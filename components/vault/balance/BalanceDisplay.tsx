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

interface BalanceDisplayProps {
  wei:        bigint
  usdPrice:   number
  isLoading?: boolean
  className?: string
}

export function BalanceDisplay({
  wei,
  usdPrice,
  isLoading = false,
  className,
}: BalanceDisplayProps) {

  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <LoadingSkeleton variant="balance" />
      </div>
    )
  }

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

      {/* USD value — arbitrary value avoids Tailwind v4 custom-token issues */}
      <p
        className={cn(
          'text-[1.75rem]',
          'font-bold',
          'leading-none',
          'tabular-nums',
          'text-foreground',
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {usdDisplay}
      </p>
    </div>
  )
}
