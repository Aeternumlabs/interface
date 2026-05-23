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
import { BalanceDisplay }        from '@/components/vault/balance/BalanceDisplay'
import { CountdownDisplay }      from '@/components/vault/countdown/CountdownDisplay'
import { ActionButtonRow }       from '@/components/vault/actions/ActionButtonRow'
import { cn }                    from '@/lib/utils'

// --- Types ---

interface BalanceCardProps {
  className?: string
}

// --- Component ---

export function BalanceCard({ className }: BalanceCardProps) {
  const { config, isLoading: configLoading }    = useVaultConfig()
  const { deadlineUnix, isLoading: timeLoading } = useTimeUntilRecovery()
  const { usdPrice, isLoading: priceLoading }    = useEthPrice()

  // Show skeleton until vault config and price are both ready.
  // The countdown can seed from 0 while loading — it shows zeroed boxes.
  const isLoading = configLoading || priceLoading

  return (
    <div
      className={cn(
        // Card shell
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-5',
        className,
      )}
    >
      {/* Top row: balance (left) + countdown (right) */}
      <div className="flex items-start justify-between gap-4">

        {/* Left: Total balance */}
        <BalanceDisplay
          wei={config?.balance ?? 0n}
          usdPrice={usdPrice}
          isLoading={isLoading}
        />

        {/* Right: Time until recovery */}
        <CountdownDisplay
          deadlineUnix={deadlineUnix}
          isLoading={timeLoading}
          className="items-end text-right"
        />
      </div>

      {/* Bottom row: action buttons */}
      {/* Separated from the info row by a consistent top margin      */}
      <ActionButtonRow className="mt-5" />
    </div>
  )
}
