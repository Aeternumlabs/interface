/**
 * hooks/useCountdown.ts
 * 
 * A pure, state-driven countdown hook.
 * * This hook manages an internal tick (`now`) that updates every interval.
 * By deriving the remaining time purely during the render phase, it ensures 
 * that if `deadlineUnix` updates (e.g., from a fresh smart contract poll), 
 * the UI reflects the new target instantly without requiring additional 
 * synchronization effects or interval resets.
 *
 * @param deadlineUnix - Absolute Unix timestamp (in seconds) when the event triggers. 
 * Pass 0 if the vault is unregistered, has no balance, or is loading.
 * @returns A structured `CountdownBreakdown` object ready for UI rendering.
 */

import { useEffect, useState } from 'react'
import { buildCountdown } from '@/lib/utils'
import { COUNTDOWN_TICK_MS } from '@/lib/constants'
import type { CountdownBreakdown } from '@/types'

export function useCountdown(deadlineUnix: number): CountdownBreakdown {

  // 1. Initialize once safely
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  // 2. Safely update the 'now' state every tick, aligned to real second boundaries.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const tick = () => {
      setNow(Math.floor(Date.now() / 1000))

      timeout = setTimeout(
        tick,
        COUNTDOWN_TICK_MS - (Date.now() % COUNTDOWN_TICK_MS),
      )
    }

    timeout = setTimeout(
      tick,
      COUNTDOWN_TICK_MS - (Date.now() % COUNTDOWN_TICK_MS),
    )

    return () => clearTimeout(timeout)
  }, [])

  // 3. Pure render calculation
  const secondsRemaining =
    deadlineUnix <= 0
      ? 0
      : Math.max(0, deadlineUnix - now)

  return buildCountdown(secondsRemaining)
}