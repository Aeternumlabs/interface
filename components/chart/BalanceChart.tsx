'use client'

/**
 * components/chart/BalanceChart.tsx
 *
 * Renders the balance history as a Recharts LineChart.
 * Consumes useBalanceHistory(timeRange) to get ChartDataPoint[] and
 * renders a single smooth line showing the vault balance over time.
 *
 * Dark-theme design (matching the Figma):
 *   Line colour:   muted violet  hsl(263, 65%, 62%)
 *   Grid lines:    very faint    rgba(255,255,255,0.04)
 *   Axis ticks:    muted grey    #6b7280
 *   Tooltip:       dark card bg  #0f0f0f
 *   No dot markers on the line
 *
 * SSR safety:
 *   Recharts' ResponsiveContainer reads DOM dimensions and throws during
 *   server-side rendering. A mounted guard delays rendering until the
 *   component is hydrated so the chart never runs on the server.
 *
 * Props:
 *   timeRange  — selected time range; fed directly into useBalanceHistory
 *   className  — forwarded to the root wrapper
 */

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
}                              from 'recharts'
import { format }              from 'date-fns'
import { useBalanceHistory }   from '@/hooks/useBalanceHistory'
import { formatUSD }           from '@/lib/formatters'
import { cn }                  from '@/lib/utils'
import type { TimeRange, ChartDataPoint } from '@/types'

// --- Dark-theme colour constants ---
//
// Recharts SVG attributes do not support CSS variables, so we hardcode
// values that mirror the globals.css dark-theme tokens.

const COLORS = {
  line:         'hsl(263, 65%, 62%)',   // --chart-1 (muted violet)
  gridLine:     'rgba(255,255,255,0.04)',
  axisText:     '#6b7280',              // --muted-foreground
  tooltipBg:    '#0f0f0f',              // --card
  tooltipBorder:'#222222',             // --border
  tooltipText:  '#e8e8e8',             // --foreground
  tooltipMuted: '#6b7280',             // --muted-foreground
} as const

// --- X-axis tick formatter ---

function formatXTick(timestamp: number, timeRange: TimeRange): string {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  switch (timeRange) {
    case '1D':  return format(date, 'HH:mm')
    case '1W':  return format(date, 'MMM d')
    case '1M':  return format(date, 'MMM d')
    case '6M':  return format(date, 'MMM')
    case '1Y':  return format(date, 'MMM')
    case 'ALL': return format(date, "MMM ''yy")
    default:    return format(date, 'MMM d')
  }
}

// --- Y-axis tick formatter ---

function formatYTick(value: number): string {
  if (value === 0)      return '0'
  if (value < 0.0001)  return '<0.0001'
  if (value < 0.01)    return value.toFixed(4)
  if (value < 1)       return value.toFixed(3)
  return value.toFixed(2)
}

// --- Custom tooltip ---

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: ChartDataPoint }[]
}) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload

  return (
    <div
      style={{
        backgroundColor: COLORS.tooltipBg,
        border:          `1px solid ${COLORS.tooltipBorder}`,
        borderRadius:    '8px',
        padding:         '8px 12px',
        boxShadow:       '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {point.timestamp > 0 && (
        <p
          style={{ color: COLORS.tooltipMuted, fontSize: '11px', marginBottom: '4px' }}
        >
          {format(new Date(point.timestamp * 1000), 'MMM d, yyyy · HH:mm')}
        </p>
      )}
      <p style={{ color: COLORS.tooltipText, fontSize: '13px', fontWeight: 600 }}>
        {point.balanceEth.toFixed(4)}{' '}
        <span style={{ color: COLORS.tooltipMuted, fontWeight: 400 }}>ETH</span>
      </p>
      {point.balanceUsd > 0 && (
        <p style={{ color: COLORS.tooltipMuted, fontSize: '11px', marginTop: '2px' }}>
          {formatUSD(point.balanceUsd)}
        </p>
      )}
    </div>
  )
}

// --- Types ---

interface BalanceChartProps {
  timeRange:  TimeRange
  className?: string
}

// --- Component ---

export function BalanceChart({ timeRange, className }: BalanceChartProps) {
  // --- SSR guard
  // Recharts requires the DOM to be available. We render a placeholder on
  // the first pass and switch to the real chart after hydration completes.
  const [mounted, setMounted] = useState(false)
  // Defer setting mounted to avoid synchronous state update inside effect
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(t)
  }, [])

  const { dataPoints, isLoading } = useBalanceHistory(timeRange)

  // --- Pre-hydration placeholder
  if (!mounted) {
    return <div className={cn('w-full', className)} aria-hidden />
  }

  // --- X-axis tick count
  // Keep ticks sparse in the narrow 340px panel so labels don't overlap.
  const tickCount = timeRange === '1D' ? 4 : timeRange === 'ALL' ? 4 : 5

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataPoints}
          margin={{ top: 8, right: 4, bottom: 4, left: -8 }}
        >
          {/* Grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.gridLine}
            vertical={false}
          />

          {/* X Axis */}
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            allowDuplicatedCategory={false}
            domain={['dataMin', 'dataMax']}
            tickCount={tickCount}
            tickFormatter={(v) => formatXTick(v as number, timeRange)}
            tick={{ fill: COLORS.axisText, fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: COLORS.gridLine }}
            interval="preserveStartEnd"
          />

          {/* Y Axis */}
          <YAxis
            dataKey="balanceEth"
            tickFormatter={formatYTick}
            tick={{ fill: COLORS.axisText, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />

          {/* Custom tooltip */}
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: COLORS.gridLine, strokeWidth: 1 }}
          />

          {/* Balance line */}
          <Line
            type="monotone"
            dataKey="balanceEth"
            stroke={COLORS.line}
            strokeWidth={1.5}
            // No dot markers — cleaner in the narrow panel
            dot={false}
            // Subtle dot on hover
            activeDot={{
              r:      3,
              fill:   COLORS.line,
              stroke: 'none',
            }}
            // Do not animate on every timeRange switch — reduces
            // visual noise when the user tabs between ranges quickly
            isAnimationActive={!isLoading}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
