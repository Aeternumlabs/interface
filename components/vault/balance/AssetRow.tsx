/**
 * components/vault/balance/AssetRow.tsx
 *
 * A single token row inside the Top assets card.
 * Displays the token icon, name, ETH balance, USD value, and 24h price change.
 *
 * Figma layout:
 *   [ETH icon]  [Sepolia Ether    ]  [$22       ]
 *               [0.01ETH          ]  [▼ 2.39%   ]
 *
 * MVP: only one row is ever rendered — Sepolia Ether (native ETH).
 * Designed for extension in Phase 2 when ERC-20 tokens are added —
 * the AssetEntry type in types/vault.ts already covers multi-token.
 *
 * Props:
 *   name       — token display name  (e.g. "Sepolia Ether")
 *   symbol     — token ticker        (e.g. "ETH")
 *   wei        — balance in wei from useVaultConfig()
 *   usdPrice   — current price from useEthPrice()
 *   change24h  — 24h percentage change from useEthPrice()
 *   isLoading  — show skeleton while price data loads
 *   className  — forwarded to root element
 */

import { USDAmount }       from '@/components/common/USDAmount'
import { ETHAmount }       from '@/components/common/ETHAmount'
import { PriceChange }     from '@/components/common/PriceChange'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { cn }              from '@/lib/utils'

// --- ETH icon ---
// Inline SVG approximating the Ethereum diamond mark.
// Used instead of an image to avoid an extra network request and to ensure
// it inherits the dark-mode colour context cleanly.

function EthIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      {/* Upper diamond — brightest section */}
      <path
        d="M16 3L7 16.5L16 13L25 16.5L16 3Z"
        fill="currentColor"
        opacity="0.95"
      />
      {/* Lower diamond — slightly muted */}
      <path
        d="M16 20L7 16.5L16 29L25 16.5L16 20Z"
        fill="currentColor"
        opacity="0.70"
      />
      {/* Middle band — darkest highlight, gives 3D effect */}
      <path
        d="M7 16.5L16 13L25 16.5L16 20L7 16.5Z"
        fill="currentColor"
        opacity="0.40"
      />
    </svg>
  )
}

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
  symbol,
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

        {/* Token icon */}
        <div
          className={cn(
            'flex items-center justify-center',
            'size-9 rounded-full shrink-0',
            'bg-muted/60',
            'text-foreground/90',
          )}
          aria-hidden
        >
          <EthIcon size={20} />
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
          {/* Show symbol inline for legibility: "0.0100 ETH" */}
          {/* ETHAmount renders the number, the line below appends symbol */}
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
