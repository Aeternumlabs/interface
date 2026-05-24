'use client'

/**
 * components/chart/TimeRangeSelector.tsx
 *
 * Renders the time range tab row visible at the top of the chart panel:
 *   1D | 1W | 1M | 6M | 1Y | ALL
 *
 * Matches the Figma design where "1W" is the default active tab —
 * active tab renders in full foreground white, inactive tabs are muted.
 *
 * Stateless — controlled by ChartPanel via value + onChange props.
 *
 * Props:
 *   value     — the currently active TimeRange
 *   onChange  — called when the user taps a different range
 *   className — forwarded to the root element
 */

import { cn }          from '@/lib/utils'
import type { TimeRange } from '@/types'

// --- Range options ---

const RANGES: TimeRange[] = ['1D', '1W', '1M', '6M', '1Y', 'ALL']

// --- Types ---

interface TimeRangeSelectorProps {
  value:      TimeRange
  onChange:   (range: TimeRange) => void
  className?: string
}

// --- Component ---

export function TimeRangeSelector({
  value,
  onChange,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="tablist"
      aria-label="Chart time range"
    >
      {RANGES.map((range) => {
        const isActive = range === value

        return (
          <button
            key={range}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Show ${range} chart`}
            onClick={() => onChange(range)}
            className={cn(
              // Base
              'px-2 py-1',
              'text-xs font-medium',
              'rounded',
              // Interaction
              'transition-colors duration-150',
              'select-none cursor-pointer',
              'outline-none focus-visible:ring-1 focus-visible:ring-ring',
              // Active state — bright white matching the "1W" tab in Figma
              isActive
                ? 'text-foreground'
                : [
                    'text-muted-foreground/50',
                    'hover:text-muted-foreground',
                  ],
            )}
          >
            {range}
          </button>
        )
      })}
    </div>
  )
}
