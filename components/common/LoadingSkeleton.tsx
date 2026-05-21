/**
 * components/common/LoadingSkeleton.tsx
 *
 * Shimmer skeleton placeholders shown while contract reads are in flight.
 * Prevents layout shift by rendering ghost elements the exact same dimensions
 * as the real content they are waiting for.
 *
 * Two usage modes:
 *
 *   1. Generic block — pass width/height/className for any freeform skeleton:
 *        <LoadingSkeleton className="h-4 w-32 rounded" />
 *
 *   2. Preset variants — named configs that match specific dashboard sections:
 *        <LoadingSkeleton variant="balance" />
 *        <LoadingSkeleton variant="countdown" />
 *        <LoadingSkeleton variant="asset-row" />
 *        <LoadingSkeleton variant="tx-row" />
 *        <LoadingSkeleton variant="tx-row" count={3} />
 *
 * The shimmer animation is defined in tailwind.config.ts under keyframes.shimmer.
 *
 * Used in:
 *   BalanceDisplay         — while wei balance loads from contract
 *   CountdownDisplay       — while time until recovery loads
 *   TopAssetsCard          — while ETH price loads from CoinGecko
 *   TransactionHistoryCard — while event logs load from RPC
 */

import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef } from 'react'

// --- Base skeleton atom ---

interface SkeletonProps extends ComponentPropsWithoutRef<'div'> {
  className?: string
}

function Skeleton({ className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        // Base appearance
        'rounded-md bg-muted/60',
        // Shimmer animation
        'bg-gradient-to-r from-muted/60 via-muted-foreground/10 to-muted/60',
        'bg-[length:200%_100%]',
        'animate-shimmer',
        className,
      )}
      style={style}
      aria-hidden
      {...props}
    />
  )
}

// --- Preset variants ---

type SkeletonVariant =
  | 'balance'    // "$22.16" large balance value in BalanceDisplay
  | 'countdown'  // Four countdown unit boxes in CountdownDisplay
  | 'asset-row'  // Single row in TopAssetsCard
  | 'tx-row'     // Single row in TransactionHistoryCard

// --- balance — matches the large "$22.16" value ---

function BalanceSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {/* "Total balance" label */}
      <Skeleton className="h-3.5 w-24 rounded" />
      {/* "$22.16" value */}
      <Skeleton className="h-8 w-36 rounded" />
    </div>
  )
}

// --- countdown — matches the four DAYS · HRS · MINS · SECS boxes ---

function CountdownSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {/* "Time until recovery" label */}
      <Skeleton className="h-3.5 w-32 rounded" />
      {/* Four countdown boxes */}
      <div className="flex items-center gap-1">
        {[60, 40, 40, 40].map((w, i) => (
          <div key={i} className="flex items-center gap-1">
            <Skeleton className={`h-10 rounded`} style={{ width: `${w}px` }} />
            {i < 3 && (
              <Skeleton className="h-3 w-1.5 rounded" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- asset-row — matches the Sepolia Ether row in TopAssetsCard ---

function AssetRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      {/* Left: icon + name + amount */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-3 w-14 rounded" />
        </div>
      </div>
      {/* Right: USD value + price change */}
      <div className="flex flex-col items-end gap-1.5">
        <Skeleton className="h-3.5 w-12 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
      </div>
    </div>
  )
}

// --- tx-row — matches a single TransactionRow in TransactionHistoryCard ---

function TxRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      {/* Left: icon + type + address */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-20 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      </div>
      {/* Right: amount + timestamp */}
      <div className="flex flex-col items-end gap-1.5">
        <Skeleton className="h-3.5 w-16 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
      </div>
    </div>
  )
}

// --- Main exported component ---

interface LoadingSkeletonProps {
  /** Named preset — renders a pre-built skeleton matching a dashboard section. */
  variant?:   SkeletonVariant
  /**
   * For list variants ('tx-row', 'asset-row'), how many rows to render.
   * Ignored for non-list variants.
   */
  count?:     number
  /** Generic: forwarded to the base Skeleton block when no variant is set. */
  className?: string
}

export function LoadingSkeleton({
  variant,
  count    = 1,
  className,
}: LoadingSkeletonProps) {
  // --- Preset variants
  if (variant === 'balance') {
    return <BalanceSkeleton />
  }

  if (variant === 'countdown') {
    return <CountdownSkeleton />
  }

  if (variant === 'asset-row') {
    return (
      <div className="divide-y divide-border/40">
        {Array.from({ length: count }).map((_, i) => (
          <AssetRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (variant === 'tx-row') {
    return (
      <div className="divide-y divide-border/40">
        {Array.from({ length: count }).map((_, i) => (
          <TxRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  // --- Generic block
  return <Skeleton className={className} />
}