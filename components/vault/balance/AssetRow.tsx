'use client'

/**
 * components/vault/balance/AssetRow.tsx
 *
 * A single token row inside the Top assets card.
 * Displays the token icon, name, ETH balance, USD value, and 24h price change.
 *
 * Figma layout:
 * [ETH icon]  [Sepolia Ether    ]  [$22       ]
 * [0.01ETH          ]  [▼ 2.39%   ]
 *
 * MVP: only one row is ever rendered — Sepolia Ether (native ETH).
 * Designed for extension in Phase 2 when ERC-20 tokens are added —
 * the AssetEntry type in types/vault.ts already covers multi-token.
 *
 * Props:
 * name       — token display name  (e.g. "Sepolia Ether")
 * symbol     — token ticker        (e.g. "ETH")
 * wei        — balance in wei from useVaultConfig()
 * usdPrice   — current price from useEthPrice()
 * change24h  — 24h percentage change from useEthPrice()
 * isLoading  — show skeleton while price data loads
 * className  — forwarded to root element
 */

import Image               from 'next/image' // <-- Imported for high-res Figma PNG handling
import { USDAmount }       from '@/components/common/USDAmount'
import { ETHAmount }       from '@/components/common/ETHAmount'
import { PriceChange }     from '@/components/common/PriceChange'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { cn }              from '@/lib/utils'

// --- Types ---

interface AssetRowProps {
  name:       string
  symbol:     string
  wei:        bigint
  usdPrice:   number
  change24h:  number
  isLoading?: boolean
  className?: string
}

// --- Component ---

export function AssetRow({
  name,
  wei,
  usdPrice,
  change24h,
  isLoading = false,
  className,
}: AssetRowProps) {

  // --- Loading state
  if (isLoading) {
    return (
      <div className={cn('px-1', className)}>
        <LoadingSkeleton variant="asset-row" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'py-2 px-1',
        className,
      )}
    >
      {/* Left: icon + name + ETH amount */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Token icon wrapper container */}
        <div
          className={cn(
            'flex items-center justify-center',
            'size-9 rounded-full shrink-0',
            'bg-muted/60 overflow-hidden', // Added overflow-hidden to keep image clip uniform
          )}
          aria-hidden
        >
          {/* Render your high-res Figma asset directly */}
          <Image
            src="/assets/ethereum.png"
            alt={`${name} logo`}
            width={22} // Scaled slightly up from 20px to show off your Figma facets beautifully
            height={22}
            className="object-contain select-none"
            priority // Bypasses lazy-loading limits for immediate card rendering
          />
        </div>

        {/* Token name + balance */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="text-sm font-medium text-foreground truncate"
          >
            {name}
          </span>
          <ETHAmount
            wei={wei}
            decimals={4}
            showSymbol={false}
            className="text-xs text-muted-foreground"
          />
        </div>
      </div>

      {/* Right: USD value + price change */}
      <div className="flex flex-col items-end gap-0.5 shrink-0 ml-4">

        {/* USD value — compact (no cents) matching the "$22" in Figma */}
        <USDAmount
          wei={wei}
          usdPrice={usdPrice}
          compact
          className="text-sm font-medium text-foreground"
        />

        {/* 24h price change — red ▼ or green ▲ */}
        <PriceChange change={change24h} />
      </div>
    </div>
  )
}