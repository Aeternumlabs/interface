/**
 * hooks/useCountdown.ts
 *
 * Takes an absolute, stable Unix deadline timestamp in seconds and returns a live
 * CountdownBreakdown that ticks every second in the browser.
 *
 * This is a pure client-side timer — it does not make any RPC calls.
 * The deadline value comes from useTimeUntilRecovery(), which seeds it from 
 * the contract using a stable block timestamp (dataUpdatedAt) to avoid drift.
 *
 * Design & Architecture:
 * useTimeUntilRecovery()   → stable deadlineUnix (re-synced every ~12 seconds)
 * useCountdown(deadline)   → tracks current wall-clock time, derives remaining seconds
 * CountdownDisplay         → renders computed days / hrs / mins / secs
 *
 * To avoid cascading render errors and hydration mismatches, this hook follows the
 * React-idiomatic pattern of derived state. It tracks only the *current time* in state 
 * and computes the remaining intervals purely during rendering. If a new deadlineUnix 
 * arrives from the parent, the countdown adapts immediately on the first render frame 
 * without requiring a separate layout effect synchronization step.
 *
 * Returns:
 * { days, hours, minutes, seconds, isExpired }
 *
 * isExpired is true when deadlineUnix has passed — CountdownDisplay
 * can show a "Recovery due" state instead of the countdown numbers.
 *
 * Usage in CountdownDisplay:
 * const { deadlineUnix } = useTimeUntilRecovery()
 * const { days, hours, minutes, seconds, isExpired } = useCountdown(deadlineUnix)
 */

import { useState, useEffect } from 'react'
import { buildCountdown } from '@/lib/utils'
import { COUNTDOWN_TICK_MS } from '@/lib/constants'
import type { CountdownBreakdown } from '@/types'

export function useCountdown(deadlineUnix: number): CountdownBreakdown {
  // 1. Store the "current time" in state, not the "remaining time".
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    // If the deadline is 0 (unregistered/loading) or has already passed,
    // do not start a timer interval.
    if (deadlineUnix <= 0 || deadlineUnix <= Math.floor(Date.now() / 1000)) {
      return
    }

    const interval = setInterval(() => {
      const currentNow = Math.floor(Date.now() / 1000)
      setNow(currentNow)

      // Stop ticking once expired — no point keeping the interval alive
      if (currentNow >= deadlineUnix) {
        clearInterval(interval)
      }
    }, COUNTDOWN_TICK_MS)

    return () => clearInterval(interval)
  }, [deadlineUnix])

  // 2. Derive the seconds remaining purely during render.
  // Because this is outside the useEffect, if a new deadlineUnix arrives 
  // from the parent, this math instantly recalculates with zero delay!
  const secondsRemaining = deadlineUnix > 0 
    ? Math.max(0, deadlineUnix - now) 
    : 0

  return buildCountdown(secondsRemaining)
}