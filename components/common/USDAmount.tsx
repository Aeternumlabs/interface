/**
 * components/common/USDAmount.tsx
 *
 * Formats a dollar amount into a "$X.XX" display string.
 * Purely presentational — no hooks, no side effects.
 *
 * Accepts two calling conventions:
 *
 *   Convention A — pre-calculated USD amount
 *     <USDAmount amount={22.16} />
 *     → "$22.16"
 *
 *   Convention B — wei + live ETH price (calculates internally)
 *     <USDAmount wei={10000000000000000n} usdPrice={2216} />
 *     → "$22.16"
 *
 * Used in:
 *   BalanceDisplay   — the primary "$22.16" large balance value
 *   AssetRow         — "$22" in the Top assets card
 *   TransactionRow   — USD equivalent of ETH amounts (optional)
 *
 * Props:
 *   amount    — pre-calculated USD value (use with Convention A)
 *   wei       — raw wei from the contract (use with Convention B)
 *   usdPrice  — current ETH/USD from useEthPrice() (use with Convention B)
 *   compact   — when true, strips cents for large values (e.g. "$22" not "$22.00")
 *   className — forwarded to the wrapping <span>
 *
 * Zero / loading state:
 *   Pass amount={0} or omit both wei and usdPrice to display "$0.00".
 *   Components should show a LoadingSkeleton while useEthPrice() is in flight
 *   rather than letting this component render "$0.00" prematurely.
 */

import { cn }            from '@/lib/utils'
import { formatUSD }     from '@/lib/formatters'
import { weiToEthNumber } from '@/lib/utils'

// --- Types ---

interface USDAmountProps {
  /** Convention A: supply the already-calculated USD amount. */
  amount?:    number
  /** Convention B: supply wei + price, component multiplies internally. */
  wei?:       bigint
  usdPrice?:  number
  /** Show integer dollars only for large amounts (e.g. in AssetRow). */
  compact?:   boolean
  className?: string
}

// --- Component ---

export function USDAmount({
  amount,
  wei,
  usdPrice  = 0,
  compact   = false,
  className,
}: USDAmountProps) {
  // --- Resolve the USD value
  let usdValue: number

  if (amount !== undefined) {
    // Convention A — use as-is
    usdValue = amount
  } else if (wei !== undefined) {
    // Convention B — multiply ETH balance by current price
    usdValue = weiToEthNumber(wei) * usdPrice
  } else {
    usdValue = 0
  }

  // --- Format
  // compact mode: no cents — matches "$22" in the Top assets AssetRow
  const display = compact
    ? new Intl.NumberFormat('en-US', {
        style:                 'currency',
        currency:              'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(usdValue)
    : formatUSD(usdValue)

  return (
    <span
      className={cn(
        'tabular-nums',
        className,
      )}
    >
      {display}
    </span>
  )
}
