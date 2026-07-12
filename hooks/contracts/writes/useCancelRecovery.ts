/**
 * hooks/contracts/writes/useCancelRecovery.ts
 *
 * Wraps the cancelRecovery() contract call.
 *
 * cancelRecovery() is the nuclear exit function. It does two things
 * atomically in a single transaction:
 *   1. Transfers the entire vault balance back to the caller's wallet
 *   2. Permanently removes the vault from monitoring registry
 *
 * This is fundamentally different from withdrawAll() which only moves funds
 * but keeps the vault registered and active. After cancelRecovery(), the
 * vault config is wiped — the user must call register() again from scratch
 * if they want to re-enroll.
 *
 * Called by CancelRecoveryModal which enforces a double-confirmation step
 * before this hook is ever invoked, because the action is irreversible
 * within the same registration session.
 *
 * Transaction lifecycle:
 *   idle        → modal showing double-confirm UI
 *   pending     → tx in mempool, final confirm button shows spinner
 *   confirming  → tx mined, waiting for receipt
 *   confirmed   → success — balance returned, vault deregistered
 *   error       → user rejected, not registered, or transfer failed
 *
 * Contract-level reverts (will surface as isError):
 *   • wallet not registered  → AeternumVault__NotRegistered
 *   • ETH transfer fails     → AeternumVault__TransferFailed
 *
 * After confirmation all wagmi reads are invalidated so the dashboard
 * transitions from the 'active' state back to 'unregistered', BalanceCard
 * shows $0.00, ActionButtonRow toggles back to the Register button, and
 * the countdown clears — all without a page reload.
 *
 * Usage in CancelRecoveryModal:
 *   const { cancelRecovery, isPending, isConfirming, isConfirmed, isError } =
 *     useCancelRecovery()
 *
 *   // Only reachable after the user passes the double-confirm step
 *   const onFinalConfirm = () => {
 *     cancelRecovery()
 *   }
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Return type ---

export interface UseCancelRecoveryReturn {
  /**
   * Call this only after the user passes the double-confirmation step in
   * CancelRecoveryModal. This is a destructive, irreversible action.
   * Takes no arguments — the contract deregisters the caller's vault entirely.
   */
  cancelRecovery: () => void

  /** True while the tx is in the mempool waiting to be mined. */
  isPending: boolean

  /** True while waiting for the transaction receipt after mining. */
  isConfirming: boolean

  /** True once cancellation is confirmed on-chain. */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /** The raw error — surface as a toast or inline modal error. */
  error: Error | null

  /** The submitted transaction hash — use to build an Etherscan link. */
  txHash: `0x${string}` | undefined

  /**
   * Resets all state back to idle.
   * CancelRecoveryModal calls this on close so the double-confirm
   * flow restarts cleanly if the user opens the modal again.
   */
  reset: () => void
}

// --- Hook ---

export function useCancelRecovery(): UseCancelRecoveryReturn {
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
  // This is the most impactful invalidation in the app. After cancellation:
  //   - useVaultConfig refetches → config shows zeroed/inactive state
  //   - useIsRegistered refetches → returns false
  //   - useTimeUntilRecovery refetches → returns 0
  //
  // The dashboard responds by:
  //   - ActionButtonRow toggling back to <RegisterButton />
  //   - BalanceCard showing $0.00 with no countdown
  //   - UpdateConfigModal clearing the backup address display
  //   - the vault state behaving as unregistered
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- cancelRecovery() function exposed to CancelRecoveryModal
  const cancelRecovery = () => {
    if (!contract.address) return

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'cancelRecovery',
      // cancelRecovery() takes no arguments and sends no ETH.
      // The contract internally: zeroes the balance, sets isActive = false,
      // removes from registry, then transfers the balance to msg.sender.
      args: [],
    })
  }

  return {
    cancelRecovery,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}