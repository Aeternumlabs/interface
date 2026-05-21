/**
 * components/common/ETHAmount.tsx
 *
 * Formats a raw wei bigint into a human-readable ETH amount string.
 * Purely presentational — no hooks, no side effects.
 *
 * Used in:
 *   BalanceDisplay         — shows vault ETH balance
 *   DepositModal           — shows current balance before depositing
 *   SendModal              — shows available balance
 *   WithdrawModal          — shows amount to be withdrawn
 *   TransactionRow         — shows amounts on deposit/send/withdrawal events
 *   AssetRow               — shows "0.01ETH" under "Sepolia Ether"
 *
 * Props:
 *   wei         — raw wei value from the contract (bigint)
 *   decimals    — decimal places in the output (default 4)
 *   showSymbol  — append " ETH" suffix (default true)
 *   className   — forwarded to the wrapping <span>
 *
 * Examples:
 *   <ETHAmount wei={10000000000000000n} />
 *   → "0.0100 ETH"
 *
 *   <ETHAmount wei={2160000000000000000n} decimals={2} />
 *   → "2.16 ETH"
 *
 *   <ETHAmount wei={10000000000000000n} showSymbol={false} />
 *   → "0.0100"
 */

import { cn }             from '@/lib/utils'
import { formatWeiToEth } from '@/lib/formatters'

// --- Types ---

interface ETHAmountProps {
  wei:         bigint
  decimals?:   number
  showSymbol?: boolean
  className?:  string
}

// --- Component ---

export function ETHAmount({
  wei,
  decimals   = 4,
  showSymbol = true,
  className,
}: ETHAmountProps) {
  const formatted = formatWeiToEth(wei, decimals)

  return (
    <span
      className={cn(
        // tabular-nums prevents layout shift as digits change
        'font-mono tabular-nums',
        className,
      )}
    >
      {formatted}
      {showSymbol && (
        <span className="ml-0.5 text-[0.85em] text-muted-foreground">
          ETH
        </span>
      )}
    </span>
  )
}
