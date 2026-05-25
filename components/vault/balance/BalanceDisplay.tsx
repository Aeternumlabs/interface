/**
 * components/vault/balance/BalanceDisplay.tsx
 *
 * Renders the left side of BalanceCard:
 *   "Total balance"     ← small muted label
 *   "$22.16"            ← large prominent USD value
 *
 * FONT FIX: text-balance-lg (custom Tailwind config token) does not
 * resolve in Tailwind v4's @theme inline system. Replaced with the
 * arbitrary value text-[2.5rem] which always compiles correctly.
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
