'use client'

/**
 * components/chart/ChartPanel.tsx
 *
 * The right-column panel visible on desktop (hidden on mobile via DashboardGrid).
 * Orchestrates the three chart sub-components and owns the timeRange state.
 *
 * Desktop layout (340px fixed width, full height of content area):
 *
 * Data flow:
 *   ChartPanel  →  timeRange state
 *       ↓
 *   BalanceChart(timeRange)  →  useBalanceHistory(timeRange)  →  dataPoints
 *
 * The default timeRange is '1W' to match the Figma design where
 * the 1W tab appears as the active tab.
 */

import { useState }          from 'react'
import { TimeRangeSelector } from './TimeRangeSelector'
import { BalanceChart }      from './BalanceChart'
import { ChartLegend }       from './ChartLegend'
import { cn }                from '@/lib/utils'
import type { TimeRange }    from '@/types'

// --- Types ---

interface ChartPanelProps {
  className?: string
}

// --- Component ---

export function ChartPanel({ className }: ChartPanelProps) {
  // '1W' is the default to match the active tab shown in the Figma design.
  const [timeRange, setTimeRange] = useState<TimeRange>('1W')

  return (
    <div
      className={cn(
        // Fill the full height of the DashboardGrid right column
        'flex flex-col h-full',
        'px-4 pt-4 pb-8',
        className,
      )}
    >
      {/* Time range selector — right-aligned matching Figma */}
      <div className="flex justify-end mb-2 shrink-0">
        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
        />
      </div>

      {/* Balance line chart — fills remaining height */}
      {/*
        flex-1 + min-h-0 is the correct pattern for a flex child that
        contains a ResponsiveContainer. Without min-h-0, the container
        may grow beyond its parent and cause scroll or overflow issues.
      */}
      <BalanceChart
        timeRange={timeRange}
        className="flex-1 min-h-0"
      />

      {/* Legend — "● Balance" bottom-right */}
      <ChartLegend className="mt-2 shrink-0" />
    </div>
  )
}
