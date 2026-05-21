/**
 * components/common/PriceChange.tsx
 *
 * Displays a 24h price change percentage with directional arrow and colour.
 * Purely presentational — no hooks, no side effects.
 *
 *   Negative change → red  + ▼  e.g. "▼ 2.39%"
 *   Positive change → green + ▲  e.g. "▲ 1.20%"
 *   Zero            → muted, no arrow
 *
 * Used in:
 *   AssetRow — right side of the Sepolia Ether row in TopAssetsCard
 *
 * Props:
 *   change     — 24h percentage change from useEthPrice() (e.g. -2.39)
 *   showArrow  — render the ▼/▲ indicator (default true)
 *   className  — forwarded to the root <span>
 */

import { cn }                                from '@/lib/utils'
import { isPriceDown }                       from '@/lib/utils'
import { formatPriceChange }                 from '@/lib/formatters'
import { TrendingDown, TrendingUp, Minus }   from 'lucide-react'

// --- Types ---

interface PriceChangeProps {
  change:     number
  showArrow?: boolean
  className?: string
}

// --- Component ---

export function PriceChange({
  change,
  showArrow = true,
  className,
}: PriceChangeProps) {
  const isDown = isPriceDown(change)
  const isFlat = change === 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5',
        'text-xs font-medium tabular-nums',
        // Colour based on direction
        isFlat  && 'text-muted-foreground',
        isDown  && 'text-red-400',
        !isDown && !isFlat && 'text-emerald-400',
        className,
      )}
      aria-label={`${isDown ? 'Down' : 'Up'} ${formatPriceChange(change)} in the last 24 hours`}
    >
      {/* Directional arrow icon */}
      {showArrow && !isFlat && (
        <>
          {isDown
            ? <TrendingDown className="size-3 shrink-0" strokeWidth={2.5} />
            : <TrendingUp   className="size-3 shrink-0" strokeWidth={2.5} />
          }
        </>
      )}

      {showArrow && isFlat && (
        <Minus className="size-3 shrink-0 text-muted-foreground" strokeWidth={2} />
      )}

      {/* Percentage value — always positive, sign conveyed by colour + icon */}
      <span>{formatPriceChange(change)}</span>
    </span>
  )
}
