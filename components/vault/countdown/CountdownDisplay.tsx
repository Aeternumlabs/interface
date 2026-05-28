'use client'

/**
 * components/vault/countdown/CountdownDisplay.tsx
 *
 * Renders the "Time until recovery" section of BalanceCard.
 *
 * Structure (matches Figma):
 *   "Time until recovery"          ← small muted label
 *   ┌────────────────────────────┐
 *   │ 256 · 7 · 32 · 22          │  ← CountdownBox × 4 with dot separators
 *   │ DAYS  HRS  MINS  SECS      │
 *   └────────────────────────────┘
 *
 * Data flow:
 *   useTimeUntilRecovery() → deadlineUnix
 *   useCountdown(deadlineUnix) → { days, hours, minutes, seconds, isExpired }
 *   CountdownDisplay renders the breakdown via four CountdownBox components
 *
 * States handled:
 *   isLoading  → LoadingSkeleton variant="countdown"
 *   isExpired  → "Recovery due" message in place of the timer
 *   deadline=0 → all zeros (unregistered vault / no balance — State 2 shell)
 *   normal     → live ticking countdown
 *
 * Props:
 *   deadlineUnix  — unix timestamp (seconds) when recovery becomes eligible
 *                   Pass 0 when unregistered or while loading
 *   isLoading     — show skeleton while contract read is in flight
 *   className     — forwarded to root element
 */

import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useCountdown }    from '@/hooks/useCountdown'
import { CountdownBox }    from './CountdownBox'
import { cn }              from '@/lib/utils'

// --- Types ---

interface CountdownDisplayProps {
  deadlineUnix: number
  isLoading?:   boolean
  className?:   string
}

// --- Dot separator ---

function Dot() {
  return (
    <span
      className={cn(
        'text-muted-foreground/50',
        'text-sm font-light leading-none',
        // Align dot with the number row, not the label row
        'self-start mt-2',
        'select-none',
        'px-0.5',
      )}
      aria-hidden
    >
      ·
    </span>
  )
}

// --- Component ---

export function CountdownDisplay({
  deadlineUnix,
  isLoading = false,
  className,
}: CountdownDisplayProps) {

  // Live countdown — ticks every second client-side.
  // When deadlineUnix is 0 (unregistered), returns all zeros.
  const { days, hours, minutes, seconds, isExpired } = useCountdown(deadlineUnix)

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <LoadingSkeleton variant="countdown" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>

      {/* Section label */}
      <p className="text-xs font-medium text-muted-foreground select-none">
        Time until recovery
      </p>

      {/* Countdown container */}
      {isExpired && deadlineUnix > 0 ? (
        // --- Expired state
        // Recovery is due — shown when inactivity period has elapsed.
        <div
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-lg border border-border/40',
            'bg-muted/60',
            'px-4 py-2.5',
            'text-xs font-medium text-red-400',
          )}
        >
          Recovery due
        </div>
      ) : (
        // --- Countdown timer
        // Dark container matching the Figma design, with four CountdownBox
        // units separated by middle-dot (·) characters.
        <div
          className={cn(
            'inline-flex items-start gap-0',
            'rounded-lg border border-border/40',
            // Slightly darker than the card background
            'bg-muted/50',
            'px-3 py-2.5',
          )}
          aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds until recovery`}
          role="timer"
        >
          <CountdownBox value={days}    label="DAYS" />
          <Dot />
          <CountdownBox value={hours}   label="HRS"  />
          <Dot />
          <CountdownBox value={minutes} label="MINS" />
          <Dot />
          <CountdownBox
            value={seconds}
            label="SECS"
            // Highlight the seconds box so the user can see it ticking
            highlight
          />
        </div>
      )}
    </div>
  )
}
