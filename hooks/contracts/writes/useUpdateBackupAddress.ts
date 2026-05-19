/**
 * hooks/contracts/writes/useUpdateBackupAddress.ts
 *
 * Wraps the updateBackupAddress(address newBackupAddress) contract call.
 *
 * Updates the backup address to which funds will be transferred if the
 * inactivity period elapses. Also resets the inactivity timer as a
 * side-effect — changing the backup address proves liveness.
 *
 * Called by the backup address section inside UpdateConfigModal.
 * The form validates the address with isValidAddress() before calling
 * the hook so the contract never receives an invalid input.
 *
 * Transaction lifecycle:
 *   idle        → form in normal state
 *   pending     → tx in mempool, submit button shows spinner
 *   confirming  → tx mined, waiting for receipt
 *   confirmed   → success — backup address updated, timer reset
 *   error       → user rejected, invalid address, or abandoned backup
 *
 * Contract-level reverts (will surface as isError):
 *   • newBackupAddress == address(0) or msg.sender
 *                          → AeternumVault__InvalidBackupAddress
 *   • address was abandoned after MAX_RECOVERY_ATTEMPTS failures
 *                          → AeternumVault__WalletAbandoned
 *
 * After confirmation all wagmi reads are invalidated so UpdateConfigModal
 * refreshes to display the new backup address from useVaultConfig.
 *
 * Usage in UpdateConfigModal:
 *   const { updateBackupAddress, isPending, isConfirming, isConfirmed, isError } =
 *     useUpdateBackupAddress()
 *
 *   const onSubmit = (formValues) => {
 *     updateBackupAddress(formValues.newBackupAddress)
 *   }
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Return type ---

export interface UseUpdateBackupAddressReturn {
  /**
   * Call this on form submit with the validated new backup address.
   * Ensure isValidAddress(newBackupAddress) returns true before calling.
   */
  updateBackupAddress: (newBackupAddress: `0x${string}`) => void

  /** True while the tx is in the mempool waiting to be mined. */
  isPending: boolean

  /** True while waiting for the transaction receipt after mining. */
  isConfirming: boolean

  /** True once the update is confirmed on-chain. */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /** The raw error — surface as an inline form error or toast. */
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

export function useUpdateBackupAddress(): UseUpdateBackupAddressReturn {
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
  // Causes useVaultConfig to refetch so UpdateConfigModal immediately
  // shows the new backup address. Also resets useTimeUntilRecovery since
  // updateBackupAddress() resets the inactivity timer on-chain.
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- updateBackupAddress() function exposed to UpdateConfigModal
  const updateBackupAddress = (newBackupAddress: `0x${string}`) => {
    if (!contract.address) return

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'updateBackupAddress',
      args: [newBackupAddress],
    })
  }

  return {
    updateBackupAddress,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}