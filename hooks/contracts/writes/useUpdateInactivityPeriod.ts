/**
 * hooks/contracts/writes/useUpdateInactivityPeriod.ts
 *
 * Wraps the updateInactivityPeriod(uint256 newPeriod) contract call.
 *
 * Updates how long the vault waits before recovery is triggered.
 * The new period must fall within [MIN_INACTIVITY_PERIOD, MAX_INACTIVITY_PERIOD].
 * Also resets the inactivity timer as a side-effect.
 *
 * Called by the inactivity period section inside UpdateConfigModal.
 * The PeriodSelector in that modal works in days — use daysToSeconds()
 * from lib/formatters.ts to convert before calling this hook.
 *
 * Transaction lifecycle:
 *   idle        → PeriodSelector in normal state
 *   pending     → tx in mempool, submit button shows spinner
 *   confirming  → tx mined, waiting for receipt
 *   confirmed   → success — period updated, timer reset
 *   error       → user rejected or period outside allowed range
 *
 * Contract-level reverts (will surface as isError):
 *   • newPeriod < MIN_INACTIVITY_PERIOD  → AeternumVault__InvalidInactivityPeriod
 *   • newPeriod > MAX_INACTIVITY_PERIOD  → AeternumVault__InvalidInactivityPeriod
 *
 * After confirmation all wagmi reads are invalidated so UpdateConfigModal
 * immediately shows the new period from useVaultConfig, and CountdownDisplay
 * reseeds its countdown from the updated inactivity period.
 *
 * Usage in UpdateConfigModal:
 *   const { updateInactivityPeriod, isPending, isConfirming, isConfirmed, isError } =
 *     useUpdateInactivityPeriod()
 *
 *   const onSubmit = (formValues) => {
 *     updateInactivityPeriod(daysToSeconds(formValues.periodDays))
 *   }
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Return type ---

export interface UseUpdateInactivityPeriodReturn {
  /**
   * Call this on form submit with the new period already converted to seconds.
   * The PeriodSelector works in days — convert with daysToSeconds() first.
   *
   * Example:
   *   updateInactivityPeriod(daysToSeconds(365))  // 31536000n seconds
   */
  updateInactivityPeriod: (newPeriodSeconds: bigint) => void

  /** True while the tx is in the mempool waiting to be mined. */
  isPending: boolean

  /** True while waiting for the transaction receipt after mining. */
  isConfirming: boolean

  /** True once the update is confirmed on-chain. */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /**
   * The raw error — surface as an inline form error or toast.
   * AeternumVault__InvalidInactivityPeriod is the most common cause,
   * meaning the selected period is outside the allowed range.
   */
  error: Error | null

  /** The submitted transaction hash — use to build an Etherscan link. */
  txHash: `0x${string}` | undefined

  /**
   * Resets all state back to idle.
   * Call this when UpdateConfigModal closes or when the user
   * clears the form to start over.
   */
  reset: () => void
}

// --- Hook ---

export function useUpdateInactivityPeriod(): UseUpdateInactivityPeriodReturn {
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
  // Causes useVaultConfig to refetch so UpdateConfigModal immediately shows
  // the new period value. Also triggers useTimeUntilRecovery to refetch
  // since a longer or shorter period directly changes the recovery deadline —
  // the countdown in CountdownDisplay reseeds from the new value.
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- updateInactivityPeriod() function exposed to UpdateConfigModal
  const updateInactivityPeriod = (newPeriodSeconds: bigint) => {
    if (!contract.address) return

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'updateInactivityPeriod',
      args:         [newPeriodSeconds],
    })
  }

  return {
    updateInactivityPeriod,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}