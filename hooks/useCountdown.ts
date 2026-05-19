/**
 * hooks/useCountdown.ts
 *
 * Takes an absolute Unix deadline timestamp in seconds and returns a live
 * CountdownBreakdown that ticks every second in the browser.
 *
 * This is a pure client-side timer — it does not make any RPC calls.
 * The deadline value comes from useTimeUntilRecovery() which seeds it
 * from the contract, and this hook handles the local tick-down between
 * contract polls.
 *
 * Design:
 *   useTimeUntilRecovery() → deadlineUnix (re-synced every ~12 seconds)
 *   useCountdown(deadlineUnix) → ticks every 1 second locally
 *   CountdownDisplay → renders days / hrs / mins / secs
 *
 * The separation means the countdown stays smooth and live without a new
 * RPC call every second. When useTimeUntilRecovery() resync fires (e.g.
 * after a ping confirms), deadlineUnix changes, the useEffect re-runs,
 * and the countdown reseeds from the fresh contract value.
 *
 * Returns:
 *   { days, hours, minutes, seconds, isExpired }
 *
 *   isExpired is true when deadlineUnix has passed — CountdownDisplay
 *   can show a "Recovery due" state instead of the countdown numbers.
 *
 * Usage in CountdownDisplay:
 *   const { deadlineUnix } = useTimeUntilRecovery()
 *   const { days, hours, minutes, seconds, isExpired } = useCountdown(deadlineUnix)
 */

import { useState, useEffect, useCallback } from 'react'
import { buildCountdown } from '@/lib/utils'
import { COUNTDOWN_TICK_MS } from '@/lib/constants'
import type { CountdownBreakdown } from '@/types'

// --- Hook ---

/**
 * @param deadlineUnix  Unix timestamp in seconds when recovery becomes eligible.
 *                      Pass 0 when the vault is unregistered, has no balance,
 *                      or while the contract read is still loading — the hook
 *                      returns all-zero breakdown with isExpired: false.
 */
export function useCountdown(deadlineUnix: number): CountdownBreakdown {

  // Computes seconds remaining from the deadline at call time.
  // Wrapped in useCallback so it can be listed as a dependency without
  // causing infinite re-renders.
  const getSecondsRemaining = useCallback((): number => {
    if (deadlineUnix <= 0) return 0
    const nowSeconds = Math.floor(Date.now() / 1000)
    return Math.max(0, deadlineUnix - nowSeconds)
  }, [deadlineUnix])

  // Initialise synchronously so the correct value is rendered on the first
  // frame — no flash of "0 days 0 hours 0 minutes 0 seconds" on mount.
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    getSecondsRemaining
  )

  useEffect(() => {
    // Sync immediately when deadlineUnix changes.
    // This fires when:
    //   - A ping/deposit/send confirms and useTimeUntilRecovery resyncs
    //   - The vault is first loaded and deadlineUnix arrives from the contract
    //   - The vault transitions to unregistered (deadlineUnix becomes 0)
    const initial = getSecondsRemaining()
    setSecondsRemaining(initial)

    // If the deadline is 0 (unregistered, no balance, or loading),
    // do not start a timer — nothing to count down to.
    if (deadlineUnix <= 0) return

    // If we are already expired on mount (e.g. user opens app after their
    // period has elapsed), show 0 immediately and skip the interval.
    if (initial <= 0) return

    const interval = setInterval(() => {
      const remaining = getSecondsRemaining()
      setSecondsRemaining(remaining)

      // Stop ticking once expired — no point keeping the interval alive
      // after the deadline has passed.
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, COUNTDOWN_TICK_MS)

    // Clean up on unmount or when deadlineUnix changes to prevent
    // multiple concurrent intervals from running simultaneously.
    return () => clearInterval(interval)

  }, [deadlineUnix, getSecondsRemaining])

  // Convert raw seconds to the { days, hours, minutes, seconds, isExpired }
  // shape that CountdownBox renders.
  return buildCountdown(secondsRemaining)
}