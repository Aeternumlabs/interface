/**
 * components/vault/balance/BalanceDisplay.tsx
 *
 * Renders the left side of BalanceCard:
 *   "Total balance"     ← small muted label
 *   "$22.16"            ← large prominent USD value
 *
 * The USD value is computed by multiplying the vault's wei balance by the
 * current ETH/USD price from useEthPrice(). Both values are received as props
 * so this component stays purely presentational with no hooks of its own.
 *
 * States handled:
 *   isLoading  → LoadingSkeleton variant="balance"
 *   wei = 0n   → "$0.00" (unregistered vault — State 2 shell, correct by design)
 *   normal     → formatted USD string e.g. "$22.16"
 *
 * Props:
 *   wei        — vault balance in wei from useVaultConfig()
 *   usdPrice   — current ETH/USD price from useEthPrice()
 *   isLoading  — show skeleton while vault config or price is loading
 *   className  — forwarded to root element
 */

import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { formatWeiToUSD }  from '@/lib/formatters'
import { cn }              from '@/lib/utils'

// --- Types ---

interface BalanceDisplayProps {
  wei:        bigint
  usdPrice:   number
  isLoading?: boolean
  className?: string
}

// --- Component ---

export function BalanceDisplay({
  wei,
  usdPrice,
  isLoading = false,
  className,
}: BalanceDisplayProps) {

  // --- Loading state
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <LoadingSkeleton variant="balance" />
      </div>
    )
  }

  // --- Computed USD value
  const usdDisplay = formatWeiToUSD(wei, usdPrice)

  return (
    <div className={cn('flex flex-col gap-1', className)}>

      {/* Label */}
      <p
        className="text-xs font-medium text-muted-foreground select-none"
        aria-label="Total vault balance"
      >
        Total balance
      </p>

      {/* USD value */}
      {/* text-balance-lg is a custom font size from tailwind.config.ts:  */}
      {/* 2.25rem / line-height 1 / font-weight 700                       */}
      <p
        className={cn(
          'text-balance-lg',    // 2.25rem, lh:1, fw:700 — from tailwind config
          'text-foreground',
          'tabular-nums',
          'leading-none',
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {usdDisplay}
      </p>
    </div>
  )
}
