import { useEffect, useState } from 'react'
import { buildCountdown } from '@/lib/utils'
import { COUNTDOWN_TICK_MS } from '@/lib/constants'
import type { CountdownBreakdown } from '@/types'

export function useCountdown(deadlineUnix: number): CountdownBreakdown {

  // 1. Initialize once safely
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  // 2. Safely update the 'now' state every tick (Impure code stays in the Effect!)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, COUNTDOWN_TICK_MS)

    return () => clearInterval(interval)
  }, [])

  // 3. Pure render calculation
  const secondsRemaining =
    deadlineUnix <= 0
      ? 0
      : Math.max(0, deadlineUnix - now)

  return buildCountdown(secondsRemaining)
}