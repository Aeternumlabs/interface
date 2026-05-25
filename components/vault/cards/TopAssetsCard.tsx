'use client'

/**
 * components/vault/cards/TopAssetsCard.tsx
 *
 * The middle card showing token holdings inside the vault.
 * Matches the "Top assets" section in the Figma design.
 * MVP: one row only (native ETH / Sepolia ETH).
 * Designed to extend in Phase 2 when ERC-20 tokens are tracked —
 * `config.balance` becomes one of many token balances and each
 * gets its own AssetRow.
 *
 * Data:
 *   useVaultConfig()  → vault balance in wei
 *   useEthPrice()     → USD price and 24h change (feeds AssetRow)
 */

import { useVaultConfig } from '@/hooks/contracts/reads/useVaultConfig'
import { useEthPrice }    from '@/hooks/useEthPrice'
import { AssetRow }       from '@/components/vault/balance/AssetRow'
import { cn }             from '@/lib/utils'

interface TopAssetsCardProps {
  className?: string
}

export function TopAssetsCard({ className }: TopAssetsCardProps) {
  const { config, isLoading: configLoading } = useVaultConfig()
  const { usdPrice, change24h, isLoading: priceLoading } = useEthPrice()

  const isLoading = configLoading || priceLoading

  return (
    <div
      className={cn(
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-3',          // ← was py-5, saves 16px
        'shrink-0',
        className,
      )}
    >
      <h2 className="text-sm font-medium text-foreground mb-1.5 select-none">
        {/* ↑ was mb-3, saves 6px */}
        Top assets
      </h2>

      <AssetRow
        name="Sepolia Ether"
        symbol="ETH"
        wei={config?.balance ?? 0n}
        usdPrice={usdPrice}
        change24h={change24h}
        isLoading={isLoading}
      />
    </div>
  )
}