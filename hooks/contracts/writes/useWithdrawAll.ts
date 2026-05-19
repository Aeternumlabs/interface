/**
 * hooks/contracts/writes/useWithdrawAll.ts
 *
 * Wraps the withdrawAll() contract call.
 *
 * withdrawAll() transfers the caller's entire vault balance back to their
 * own wallet address, resets the inactivity timer, and keeps the vault
 * registered and active. The user can deposit again at any time after
 * withdrawing — the vault configuration is preserved.
 *
 * This is distinct from cancelRecovery() which both withdraws the balance
 * AND removes the vault from monitoring entirely.
 *
 * Called by WithdrawModal when the user confirms the withdrawal.
 *
 * Transaction lifecycle:
 *   idle        → user has not confirmed yet
 *   pending     → tx submitted to mempool, MetaMask spinner visible
 *   confirming  → tx mined, waiting for receipt
 *   confirmed   → success — vault balance is now zero, ETH in user's wallet
 *   error       → user rejected, zero balance revert, or transfer failed
 *
 * Contract-level reverts (will surface as isError):
 *   • balance == 0   → AeternumVault__InvalidAmount
 *   • transfer fails → AeternumVault__TransferFailed
 *
 * After confirmation all wagmi reads are invalidated so useVaultConfig
 * refetches and BalanceCard shows $0.00 balance immediately.
 *
 * Usage in WithdrawModal:
 *   const { withdrawAll, isPending, isConfirming, isConfirmed, isError } = useWithdrawAll()
 *
 *   const onConfirm = () => {
 *     withdrawAll()
 *   }
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Return type ---

export interface UseWithdrawAllReturn {
  /**
   * Call this when the user confirms the withdrawal in WithdrawModal.
   * Takes no arguments — the contract always sends the entire balance.
   */
  withdrawAll: () => void

  /** True while the tx is in the mempool waiting to be mined. */
  isPending: boolean

  /** True while waiting for the transaction receipt after mining. */
  isConfirming: boolean

  /** True once the withdrawal is confirmed on-chain. */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /** The raw error — surface the message in a toast or modal error state. */
  error: Error | null

  /** The submitted transaction hash — use to build an Etherscan link. */
  txHash: `0x${string}` | undefined

  /**
   * Resets all state back to idle.
   * Call this when WithdrawModal closes so stale success/error state
   * does not carry over the next time the modal opens.
   */
  reset: () => void
}

// --- Hook ---

export function useWithdrawAll(): UseWithdrawAllReturn {
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
  // Triggers useVaultConfig to refetch so BalanceCard shows zero balance.
  // Also resets useTimeUntilRecovery since withdrawAll() resets the
  // inactivity timer on-chain — the countdown restarts from the full period.
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- withdrawAll() function exposed to WithdrawModal
  const withdrawAll = () => {
    if (!contract.address) return

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'withdrawAll',
      // withdrawAll() takes no arguments and no msg.value.
      // The contract sends config.balance to msg.sender internally.
      args: [],
    })
  }

  return {
    withdrawAll,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}