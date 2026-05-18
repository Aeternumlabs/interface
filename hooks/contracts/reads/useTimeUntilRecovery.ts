/**
 * hooks/contracts/reads/useTimeUntilRecovery.ts
 *
 * Calls getTimeUntilRecovery(address) on the contract and returns the
 * seconds remaining before recovery can be triggered.
 *
 * This hook provides the seed value for the live countdown in CountdownDisplay.
 * The contract returns a uint256 snapshot of seconds remaining at read time.
 * The actual tick-by-tick countdown is handled separately by useCountdown(),
 * which takes the deadline timestamp and decrements locally every second —
 * so the UI stays live between contract polls without hammering the RPC.
 *
 * How CountdownDisplay consumes this:
 *   1. useTimeUntilRecovery()  →  secondsRemaining (snapshot from contract)
 *   2. useVaultConfig()        →  config.lastActivity + config.inactivityPeriod
 *                                 = deadline (unix seconds)
 *   3. useCountdown(deadline)  →  ticks every second, feeds CountdownBox units
 *
 * Returns:
 *   secondsRemaining — number of seconds until recovery, 0 if already due
 *   deadlineUnix     — the absolute unix timestamp when recovery triggers
 *   isLoading        — true on first fetch
 *   isError          — true if the contract read failed
 *   refetch          — manually re-read (e.g. after a ping transaction confirms)
 */

import { useReadContract, useAccount, useChainId } from 'wagmi'
import { getVaultContract } from '@/lib/contracts'
import { VAULT_POLL_INTERVAL_MS } from '@/lib/constants'

// --- Return type ---

export interface UseTimeUntilRecoveryReturn {
  /**
   * Seconds remaining until recovery can be triggered.
   * Sourced directly from the contract at read time.
   * Returns 0 if the inactivity period has already elapsed.
   * Returns 0 while loading or on error — never undefined.
   */
  secondsRemaining: number

  /**
   * The absolute Unix timestamp (seconds) at which recovery becomes eligible.
   * Computed as: Math.floor(Date.now() / 1000) + secondsRemaining
   *
   * Pass this to useCountdown() so the countdown ticks live between polls
   * without requiring a new contract read every second.
   *
   * Returns 0 while loading or on error.
   */
  deadlineUnix: number

  /** True on the first fetch before any data arrives. */
  isLoading: boolean

  /** True if the contract read threw an error. */
  isError: boolean

  /** Manually re-read — call this after ping(), deposit(), or send() confirms. */
  refetch: () => void
}

// --- Hook ---

export function useTimeUntilRecovery(): UseTimeUntilRecoveryReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const contract                 = getVaultContract(chainId)

  const { data, isLoading, isError, refetch } = useReadContract({
    ...contract,
    functionName: 'getTimeUntilRecovery',
    args:         [address as `0x${string}`],

    query: {
      // Only fetch when a wallet is connected and the contract address is set.
      enabled: isConnected && !!address && !!contract.address,

      // Poll every block so the seed value stays accurate.
      // The live tick between polls is handled by useCountdown() locally.
      refetchInterval: VAULT_POLL_INTERVAL_MS,

      // Hold the previous value during background refetches so the
      // countdown does not reset to 0 while the new value loads.
      placeholderData: (prev: bigint | undefined) => prev,
    },
  })

  // Convert bigint (uint256 from contract) to a plain number.
  // The contract guarantees this fits safely in a JS number — the maximum
  // inactivity period is 3650 days = 315,360,000 seconds, well within
  // Number.MAX_SAFE_INTEGER (9,007,199,254,740,991).
  const secondsRemaining = data !== undefined ? Number(data) : 0

  // Compute the absolute deadline by adding secondsRemaining to the current
  // unix timestamp. This is what useCountdown() uses to tick down locally
  // without needing a new RPC call every second.
  const deadlineUnix = secondsRemaining > 0
    ? Math.floor(Date.now() / 1000) + secondsRemaining
    : 0

  return {
    secondsRemaining,
    deadlineUnix,
    isLoading,
    isError,
    refetch,
  }
}