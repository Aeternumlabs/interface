/**
 * components/vault/countdown/CountdownBox.tsx
 *
 * Renders a single countdown time unit — one number stacked above its label.
 * Four of these are assembled side by side inside CountdownDisplay to produce
 * the full timer: [256 DAYS] · [7 HRS] · [32 MINS] · [22 SECS]
 *
 * Designed to match the dark inner container visible in the Figma design.
 * The number uses a monospaced font with tabular-nums so the layout
 * does not shift as digits change each second.
 *
 * Props:
 *   value      — the numeric countdown value (e.g. 256, 7, 32, 22)
 *   label      — the time unit label shown below (e.g. "DAYS", "HRS")
 *   highlight  — optional extra brightness when the unit is actively changing
 *   className  — forwarded to root element
 */

import { cn } from '@/lib/utils'

interface CountdownBoxProps {
  value:      number
  label:      string
  highlight?: boolean
  className?: string
}

export function CountdownBox({
  value,
  label,
  highlight = false,
  className,
}: CountdownBoxProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        'min-w-[1.75rem]',
        className,
      )}
    >
      {/* Number — smaller so balance stays the visual hero */}
      <span
        className={cn(
          'font-mono tabular-nums',
          'text-[1.1rem] leading-none font-semibold',
          highlight ? 'text-foreground' : 'text-foreground/90',
          'transition-colors duration-150',
        )}
      >
        {value}
      </span>

      {/* Label */}
      <span
        className={cn(
          'mt-0.5',
          'text-[8px] uppercase tracking-widest leading-none',
          'text-muted-foreground/70',
          'select-none',
        )}
      >
        {label}
      </span>
    </div>
  )
}
