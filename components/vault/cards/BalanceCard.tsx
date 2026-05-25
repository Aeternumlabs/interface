'use client'

/**
 * components/vault/cards/BalanceCard.tsx
 *
 * The primary card at the top of the vault dashboard.
 * Matches the top section of the Figma design exactly.
 * When unregistered (State 2):
 *   Balance shows $0.00, countdown shows zeros, Register button shown.
 *
 * Data owned here:
 *   useVaultConfig()        → vault balance (wei)
 *   useEthPrice()           → ETH/USD price for balance display
 *   useTimeUntilRecovery()  → deadline timestamp fed to CountdownDisplay
 */

import { useVaultConfig }        from '@/hooks/contracts/reads/useVaultConfig'
import { useTimeUntilRecovery }  from '@/hooks/contracts/reads/useTimeUntilRecovery'
import { useEthPrice }           from '@/hooks/useEthPrice'
import { useMounted }            from '@/hooks/useMounted'
import { BalanceDisplay }        from '@/components/vault/balance/BalanceDisplay'
import { CountdownDisplay }      from '@/components/vault/countdown/CountdownDisplay'
import { ActionButtonRow }       from '@/components/vault/actions/ActionButtonRow'
import { cn }                    from '@/lib/utils'

interface BalanceCardProps {
  className?: string
}

export function BalanceCard({ className }: BalanceCardProps) {
  const mounted = useMounted()
  const { config, isLoading: configLoading }     = useVaultConfig()
  const { deadlineUnix, isLoading: timeLoading } = useTimeUntilRecovery()
  const { usdPrice, isLoading: priceLoading }    = useEthPrice()

  const balanceLoading  = !mounted || configLoading || priceLoading
  const countdownLoading = !mounted || timeLoading

  return (
    <div
      className={cn(
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-4',          // ← was py-5, saves 8px
        'shrink-0',
        className,
      )}
    >
      {/* Top row: balance (left) + countdown (right) */}
      <div className="flex items-start justify-between gap-4">
        <BalanceDisplay
          wei={config?.balance ?? 0n}
          usdPrice={usdPrice}
          isLoading={balanceLoading}
        />
        <CountdownDisplay
          deadlineUnix={deadlineUnix}
          isLoading={countdownLoading}
          className="items-end text-right"
        />
      </div>

      {/* Action buttons */}
      <ActionButtonRow className="mt-3" />
    </div>
  )
}
