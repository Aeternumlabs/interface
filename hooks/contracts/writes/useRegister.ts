/**
 * hooks/contracts/writes/useRegister.ts
 *
 * Wraps the register(backupAddress, inactivityPeriod) contract call.
 *
 * Called by RegisterModal when the user submits the registration form.
 * The function accepts a deposit amount as msg.value — 0n means no deposit,
 * which is valid since the contract allows zero-balance registration.
 *
 * Transaction lifecycle:
 *   idle        → user has not submitted yet
 *   pending     → tx submitted to mempool, MetaMask spinner visible
 *   confirming  → tx mined, waiting for receipt
 *   confirmed   → success — vault is now registered
 *   error       → user rejected in MetaMask, or contract reverted
 *
 * After confirmation, all wagmi contract reads are invalidated so
 * useVaultConfig, useIsRegistered, and useTimeUntilRecovery automatically
 * refetch and the dashboard reflects the new vault state immediately.
 *
 * Usage in RegisterModal:
 *   const { register, isPending, isConfirming, isConfirmed, isError } = useRegister()
 *
 *   const onSubmit = (formValues) => {
 *     register({
 *       backupAddress:           formValues.backupAddress,
 *       inactivityPeriodSeconds: daysToSeconds(formValues.periodDays),
 *       depositWei:              ethToWei(formValues.depositEth),
 *     })
 *   }
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Argument type ---

export interface RegisterArgs {
  /**
   * The backup address entered in BackupAddressInput.
   * Must be validated with isValidAddress() before calling register().
   */
  backupAddress: `0x${string}`

  /**
   * Inactivity period in seconds (uint256 expected by the contract).
   * Convert from the form's day value using daysToSeconds() from lib/formatters.ts
   * before passing here.
   *
   * Must be between MIN_INACTIVITY_PERIOD_SECONDS and MAX_INACTIVITY_PERIOD_SECONDS.
   */
  inactivityPeriodSeconds: bigint

  /**
   * Optional ETH to deposit into the vault at registration time.
   * Pass 0n if the user left the deposit field empty.
   * Sent as msg.value — the contract adds it directly to the vault balance.
   */
  depositWei: bigint
}

// --- Return type ---

export interface UseRegisterReturn {
  /**
   * Call this on form submit. Triggers the contract write and opens MetaMask.
   * Safe to call multiple times — previous state is replaced each call.
   */
  register: (args: RegisterArgs) => void

  /** True while the tx is in the mempool waiting to be mined. */
  isPending: boolean

  /** True while waiting for the transaction receipt after mining. */
  isConfirming: boolean

  /** True once the transaction is confirmed on-chain. */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /** The raw error object — surface the message in a toast or form error. */
  error: Error | null

  /** The submitted transaction hash — use to build an Etherscan link. */
  txHash: `0x${string}` | undefined

  /**
   * Resets all state back to idle.
   * Call this when the modal closes so stale success/error state
   * does not leak into the next time the modal opens.
   */
  reset: () => void
}

// --- Hook ---

export function useRegister(): UseRegisterReturn {
  const chainId     = useChainId()
  const contract    = getVaultContract(chainId)
  const queryClient = useQueryClient()

  // --- Step 1: submit the transaction ---
  const {
    writeContract,
    data:    txHash,
    isPending,
    isError: isWriteError,
    error:   writeError,
    reset,
  } = useWriteContract()

  // --- Step 2: wait for the receipt ---
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError:   isReceiptError,
    error:     receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      // Only poll for the receipt once we have a hash to watch.
      enabled: !!txHash,
    },
  })

  // --- Step 3: invalidate reads after confirmation ---
  //
  // Invalidating all queries causes useVaultConfig, useIsRegistered, and
  // useTimeUntilRecovery to refetch in the background. The dashboard will
  // update to show the registered state without requiring a page reload.
  //
  // We use useEffect rather than calling invalidateQueries() directly in the
  // render body, which would cause an infinite loop.
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- register() function exposed to the form ---
  const register = ({
    backupAddress,
    inactivityPeriodSeconds,
    depositWei,
  }: RegisterArgs) => {
    if (!contract.address) {
      console.error("Contract address is not deployed on this network channel.")
      return
    }

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'register',
      args:  [backupAddress, inactivityPeriodSeconds],
      value: depositWei,
    })
  }

  return {
    register,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}