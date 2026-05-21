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

// --- Types ---

interface CountdownBoxProps {
  value:      number
  label:      string
  highlight?: boolean
  className?: string
}

// --- Component ---

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
        // Minimum width keeps boxes stable as 1→2→3 digit values change
        'min-w-[2rem]',
        className,
      )}
    >
      {/* Number */}
      <span
        className={cn(
          // Monospace + tabular-nums prevents layout shift as digits tick
          'font-mono tabular-nums',
          // Size — matches the Figma countdown numbers
          'text-[1.6rem] leading-none font-semibold',
          // Colour
          highlight ? 'text-foreground' : 'text-foreground/90',
          // Smooth colour transition when highlight fires
          'transition-colors duration-150',
        )}
      >
        {value}
      </span>

      {/* Label */}
      <span
        className={cn(
          'mt-1',
          'text-[9px] uppercase tracking-widest leading-none',
          'text-muted-foreground/70',
          'select-none',
        )}
      >
        {label}
      </span>
    </div>
  )
}
