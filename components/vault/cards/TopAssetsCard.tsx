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

// --- Types ---

interface TopAssetsCardProps {
  className?: string
}

// --- Component ---

export function TopAssetsCard({ className }: TopAssetsCardProps) {
  const { config, isLoading: configLoading } = useVaultConfig()
  const { usdPrice, change24h, isLoading: priceLoading } = useEthPrice()

  const isLoading = configLoading || priceLoading

  return (
    <div
      className={cn(
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-5',
        className,
      )}
    >
      {/* Heading */}
      <h2 className="text-sm font-medium text-foreground mb-3 select-none">
        Top assets
      </h2>

      {/* Asset rows */}
      {/*
        MVP: single ETH row.
        Phase 2: map over config.tokens[] once ERC-20 support is added.
        Each token row should receive its own symbol, name, wei balance,
        USD price, and 24h change. The AssetRow component is already
        designed to handle arbitrary tokens — only the data source changes.
      */}
      <AssetRow
        name={config?.isActive ? 'Sepolia Ether' : 'Sepolia Ether'}
        symbol="ETH"
        wei={config?.balance ?? 0n}
        usdPrice={usdPrice}
        change24h={change24h}
        isLoading={isLoading}
      />
    </div>
  )
}
