/**
 * hooks/contracts/writes/useSend.ts
 *
 * Wraps the send(address to, uint256 amount) contract call.
 *
 * send() transfers ETH from the caller's vault balance to any external
 * address. It reduces the vault balance by the sent amount and resets
 * the inactivity timer — proving liveness at the same time as spending.
 *
 * Called by SendModal when the user submits the send form.
 *
 * Transaction lifecycle:
 *   idle        → user has not submitted yet
 *   pending     → tx submitted to mempool, MetaMask spinner visible
 *   confirming  → tx mined, waiting for receipt
 *   confirmed   → success — vault balance reduced, ETH at recipient
 *   error       → user rejected, insufficient balance, or transfer failed
 *
 * After confirmation all wagmi contract reads are invalidated so
 * useVaultConfig refetches and BalanceCard reflects the reduced balance.
 * useTimeUntilRecovery also refetches since send() resets the timer on-chain.
 *
 * Contract-level validations (will surface as isError):
 *   • to == address(0)          → AeternumVault__InvalidAddress
 *   • amount == 0               → AeternumVault__InvalidAmount
 *   • amount > vault balance    → AeternumVault__InsufficientBalance
 *   • recipient rejects ETH     → AeternumVault__TransferFailed
 *
 * Usage in SendModal:
 *   const { send, isPending, isConfirming, isConfirmed, isError } = useSend()
 *
 *   const onSubmit = (formValues) => {
 *     send({
 *       to:        formValues.recipientAddress,
 *       amountWei: ethToWei(formValues.amount),
 *     })
 *   }
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Argument type ---

export interface SendArgs {
  /**
   * The recipient Ethereum address.
   * Validated with isValidAddress() in SendModal before calling send().
   * The contract reverts with AeternumVault__InvalidAddress if this is
   * the zero address.
   */
  to: `0x${string}`

  /**
   * The amount to send in wei (uint256 expected by the contract).
   * Convert the user's ETH string input using ethToWei() from lib/utils.ts.
   * Must be > 0 and <= the caller's current vault balance.
   *
   * Example:
   *   ethToWei("0.1")  →  100000000000000000n
   */
  amountWei: bigint
}

// --- Return type ---

export interface UseSendReturn {
  /**
   * Call this on form submit.
   * Opens MetaMask for the user to sign and broadcasts the transaction.
   */
  send: (args: SendArgs) => void

  /** True while the tx is in the mempool waiting to be mined. */
  isPending: boolean

  /** True while waiting for the transaction receipt after mining. */
  isConfirming: boolean

  /** True once the send is confirmed on-chain. */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /** The raw error — surface the message in a toast or inline form error. */
  error: Error | null

  /** The submitted transaction hash — use to build an Etherscan link. */
  txHash: `0x${string}` | undefined

  /**
   * Resets all state back to idle.
   * Call this when SendModal closes so stale success/error state
   * does not carry over the next time the modal opens.
   */
  reset: () => void
}

// --- Hook ---

export function useSend(): UseSendReturn {
  const chainId     = useChainId()
  const contract    = getVaultContract(chainId)
  const queryClient = useQueryClient()

  // --- Step 1: submit the transaction
  const {
    writeContract,
    data:    txHash,
    isPending,
    isError: isWriteError,
    error:   writeError,
    reset,
  } = useWriteContract()

  // --- Step 2: wait for the receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError:   isReceiptError,
    error:     receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  })

  // --- Step 3: invalidate reads after confirmation
  //
  // Triggers useVaultConfig to refetch so BalanceCard shows the reduced
  // balance. Also resets useTimeUntilRecovery since send() resets the
  // inactivity timer on-chain — the countdown restarts from the full period.
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- send() function exposed to SendModal
  const send = ({ to, amountWei }: SendArgs) => {
    if (!contract.address) return

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'send',
      // send(address to, uint256 amount) — no ETH sent as msg.value here.
      // The contract deducts from the existing vault balance, not from a
      // fresh deposit. value is intentionally omitted (defaults to 0).
      args:  [to, amountWei],
    })
  }

  return {
    send,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}