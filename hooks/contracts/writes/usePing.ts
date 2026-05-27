/**
 * hooks/contracts/writes/usePing.ts
 *
 * Wraps the ping() contract call.
 *
 * ping() resets the inactivity timer without moving any funds.
 * It is the cheapest proof-of-liveness operation — around 6,000 gas,
 * costing a fraction of a cent. Used when the user wants to keep their
 * vault active without depositing, sending, or withdrawing.
 *
 * Unlike every other write hook, ping() is called directly from PingButton
 * without a modal — the button itself IS the entire interaction surface.
 * The button shows a spinner while pending and a brief success state
 * after confirmation before returning to its idle appearance.
 *
 * Transaction lifecycle:
 *   idle        → button in normal state, ready to click
 *   pending     → spinner shown, button disabled
 *   confirming  → spinner shown, button disabled
 *   confirmed   → brief success indicator, then resets to idle
 *   error       → error state shown inline on the button
 *
 * Contract-level reverts (will surface as isError):
 *   • wallet not registered → AeternumVault__NotRegistered
 *
 * After confirmation useVaultConfig and useTimeUntilRecovery are invalidated
 * so CountdownDisplay immediately reflects the reset countdown.
 *
 * Usage in PingButton:
 *   const { ping, isPending, isConfirming, isConfirmed, isError } = usePing()
 *
 *   <button
 *     onClick={ping}
 *     disabled={isPending || isConfirming}
 *   >
 *     {isPending || isConfirming ? <Spinner /> : 'Ping'}
 *   </button>
 */

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { getVaultContract } from '@/lib/contracts'

// --- Return type ---

export interface UsePingReturn {
  /**
   * Call this directly on the button onClick.
   * No modal, no arguments — just submit and watch the states.
   */
  ping: () => void

  /**
   * True while the tx is in the mempool.
   * Use to show a spinner and disable the button to prevent double-clicks.
   */
  isPending: boolean

  /**
   * True while waiting for the receipt after the tx is mined.
   * Keep the button disabled during this phase too.
   */
  isConfirming: boolean

  /**
   * True once the ping is confirmed on-chain.
   * Use to briefly flash a success indicator on the button before
   * auto-resetting after a short delay.
   */
  isConfirmed: boolean

  /** True if the write was rejected or the contract reverted. */
  isError: boolean

  /** The raw error — surface as a brief inline error on the button. */
  error: Error | null

  /** The submitted transaction hash — use to build an Etherscan link. */
  txHash: `0x${string}` | undefined

  /**
   * Resets all state back to idle.
   * PingButton calls this automatically after a short success display delay
   * so the button returns to its normal appearance after each ping.
   */
  reset: () => void
}

// --- Hook ---

export function usePing(): UsePingReturn {
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
  // ping() updates lastActivity on-chain which resets the recovery deadline.
  // Invalidating causes useTimeUntilRecovery to refetch with the new deadline,
  // and useCountdown re-seeds from the fresh value — the countdown visually
  // resets to the full inactivity period.
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isConfirmed, queryClient])

  // --- ping() function exposed to PingButton
  const ping = () => {
    if (!contract.address) return

    writeContract({
      abi: contract.abi,
      address: contract.address as `0x${string}`,
      functionName: 'ping',
      // ping() takes no arguments and sends no ETH.
      // It is a pure state-change: sets lastActivity = block.timestamp.
      args: [],
    })
  }

  return {
    ping,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error:   (writeError ?? receiptError ?? null) as Error | null,
    txHash,
    reset,
  }
}