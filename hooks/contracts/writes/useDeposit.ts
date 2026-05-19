/**
 * hooks/contracts/writes/useDeposit.ts
 *
 * Wraps the deposit() contract call.
 *
 * deposit() takes no function arguments — the ETH amount is sent as msg.value.
 * The contract adds the received ETH directly to the caller's vault balance
 * and resets the inactivity timer.
 *
 * Called by DepositModal when the user submits the deposit form.
 *
 * Transaction lifecycle:
 *   idle        → user has not submitted yet
 *   pending     → tx submitted to mempool, MetaMask spinner visible
 *   confirming  → tx mined, waiting for receipt
 *   confirmed   → success — vault balance increased
 *   error       → user rejected in MetaMask, or contract reverted
 *
 * After confirmation all wagmi contract reads are invalidated so
 * useVaultConfig and useTimeUntilRecovery refetch and the BalanceCard
 * reflects the updated balance and reset countdown immediately.
 *
 * Usage in DepositModal:
 *   const { deposit, isPending, isConfirming, isConfirmed, isError } = useDeposit()
 *
 *   const onSubmit = (formValues) => {
 *     deposit(ethToWei(formValues.amount))
 *   }
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Return type ---

export interface UseDepositReturn {
  /**
   * Call this on form submit with the ETH amount in wei.
   * Converts to msg.value and submits the transaction.
   *
   * Convert the user's ETH string input using ethToWei() from lib/utils.ts
   * before passing it here.
   *
   * Example:
   *   deposit(ethToWei("0.5"))   // deposits 0.5 ETH
   */
  deposit: (amountWei: bigint) => void

  /** True while the tx is in the mempool waiting to be mined. */
  isPending: boolean

  /** True while waiting for the transaction receipt after mining. */
  isConfirming: boolean

  /** True once the deposit is confirmed on-chain. */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /** The raw error — surface the message in a toast or inline form error. */
  error: Error | null

  /** The submitted transaction hash — use to build an Etherscan link. */
  txHash: `0x${string}` | undefined

  /**
   * Resets all state back to idle.
   * Call this when DepositModal closes so stale success/error state
   * does not carry over the next time the modal opens.
   */
  reset: () => void
}

// --- Hook ---

export function useDeposit(): UseDepositReturn {
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
  // Triggers useVaultConfig to refetch so BalanceCard shows the updated
  // balance without a page reload. Also resets useTimeUntilRecovery since
  // deposit() resets the inactivity timer on-chain.
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- deposit() function exposed to DepositModal
  const deposit = (amountWei: bigint) => {
    if (!contract.address) return

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'deposit',
      args:  [],
      value: amountWei,
    })
  }

  return {
    deposit,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}