/**
 * components/chart/ChartLegend.tsx
 *
 * Renders the "● Balance" label beneath the BalanceChart.
 * Matches the legend visible in the bottom-right of the chart panel
 * in the Figma design.
 *
 * Static for the MVP — one line (ETH balance).
 * Designed to extend to multiple legend items in Phase 2 once ERC-20
 * tokens are tracked and displayed on the chart.
 *
 * Props:
 *   color     — the line colour used in the chart (defaults to chart-1 violet)
 *   className — forwarded to root element
 */

import { cn } from '@/lib/utils'

// --- Types ---

interface ChartLegendProps {
  /** Dot colour — should match the Line stroke in BalanceChart */
  color?:     string
  className?: string
}

// --- Component ---

export function ChartLegend({
  color     = 'hsl(263, 65%, 62%)',
  className,
}: ChartLegendProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-1.5',
        'select-none',
        className,
      )}
    >
      {/* Filled dot matching the chart line colour */}
      <span
        className="inline-block size-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="text-xs text-muted-foreground/70">Balance</span>
    </div>
  )
}
