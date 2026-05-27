import { useEffect, useState } from 'react'
import { buildCountdown } from '@/lib/utils'
import { COUNTDOWN_TICK_MS } from '@/lib/constants'
import type { CountdownBreakdown } from '@/types'

export function useCountdown(deadlineUnix: number): CountdownBreakdown {

  const [now, setNow] = useState(() =>
    Math.floor(Date.now() / 1000)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, COUNTDOWN_TICK_MS)

    return () => clearInterval(interval)
  }, [])

  const secondsRemaining =
    deadlineUnix <= 0
      ? 0
      : Math.max(0, deadlineUnix - now)

  return buildCountdown(secondsRemaining)
}