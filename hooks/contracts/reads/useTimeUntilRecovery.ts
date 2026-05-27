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
 *   1. useTimeUntilRecovery()  →  deadlineUnix (stable absolute timestamp)
 *   2. useCountdown(deadlineUnix)  →  ticks every second, feeds CountdownBox units
 *
 * Returns:
 *   secondsRemaining — snapshot from contract at last poll, 0 if already due
 *   deadlineUnix     — stable absolute unix timestamp when recovery triggers
 *   isLoading        — true on first fetch
 *   isError          — true if the contract read failed
 *   refetch          — manually re-read (e.g. after a ping transaction confirms)
 */

import { useMemo }                                  from 'react'
import { useReadContract, useAccount, useChainId }  from 'wagmi'
import { getVaultContract }                         from '@/lib/contracts'
import { VAULT_POLL_INTERVAL_MS }                   from '@/lib/constants'

// --- Return type ---

export interface UseTimeUntilRecoveryReturn {
  /**
   * Seconds remaining at the time of the last contract read.
   * Becomes stale between polls — use deadlineUnix for display logic.
   * Returns 0 while loading or on error.
   */
  secondsRemaining: number

  /**
   * Absolute Unix timestamp (seconds) when recovery becomes eligible.
   *
   * Computed as:  Math.floor(dataUpdatedAt / 1000) + secondsRemaining
   *
   * Using dataUpdatedAt (the ms timestamp TanStack Query recorded when the
   * RPC response arrived) as the base — NOT Date.now() — makes this value
   * stable between polls. useCountdown() depends on this value; if it
   * drifted on every render the effect would restart its setInterval
   * continuously, producing the visible jumps.
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

  const {
    data,
    dataUpdatedAt,   // ← ms timestamp when TanStack Query last stored this data
    isLoading,
    isError,
    refetch,
  } = useReadContract({
    ...contract,
    functionName: 'getTimeUntilRecovery',
    args:         [address as `0x${string}`],

    query: {
      enabled: isConnected && !!address && !!contract.address,

      // Poll every block so the seed value stays accurate.
      // The live tick between polls is handled by useCountdown() locally.
      refetchInterval: VAULT_POLL_INTERVAL_MS,

      // Hold the previous value during background refetches so the
      // countdown does not reset to 0 while the new value loads.
      placeholderData: (prev: bigint | undefined) => prev,
    },
  })

  const secondsRemaining = data !== undefined ? Number(data) : 0

  // --- THE FIX --- //
  //
  // BUG (before): deadline was computed inline on every render:
  //
  //   const deadlineUnix = Math.floor(Date.now() / 1000) + secondsRemaining
  //
  // Date.now() advances between renders, so deadlineUnix drifted forward
  // on every re-render. useCountdown's useEffect has deadlineUnix in its
  // dependency array, so every drift caused it to clear the current
  // setInterval and start a new one — resetting the visible countdown and
  // producing the jumps (e.g. 0 → 12 → 58 seconds).
  //
  // FIX: memoize deadlineUnix and base it on dataUpdatedAt rather than
  // Date.now(). dataUpdatedAt is the millisecond timestamp TanStack Query
  // recorded when the RPC response was stored. It only changes when a new
  // poll actually completes — so deadlineUnix is stable for the full 12s
  // between polls and useCountdown's interval runs uninterrupted.

  const deadlineUnix = useMemo(() => {
    if (!data || data === 0n || !dataUpdatedAt) return 0
    const fetchedAtSeconds = Math.floor(dataUpdatedAt / 1000)
    return fetchedAtSeconds + Number(data)
  }, [data, dataUpdatedAt])

  return {
    secondsRemaining,
    deadlineUnix,
    isLoading,
    isError,
    refetch,
  }
}