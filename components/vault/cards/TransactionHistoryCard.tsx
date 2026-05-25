/**
 * components/vault/cards/TransactionHistoryCard.tsx
 *
 * The bottom card in the vault dashboard.
 * Fills all remaining centre-column height; the transaction list scrolls
 * inside this card so the rest of the app stays viewport-locked.
 */

import { TransactionList } from '@/components/vault/transactions/TransactionList'
import { cn }              from '@/lib/utils'

interface TransactionHistoryCardProps {
  className?: string
}

export function TransactionHistoryCard({ className }: TransactionHistoryCardProps) {
  return (
    <div
      className={cn(
        // flex-col + min-h-0 + flex-1 (from VaultDashboard) = bounded height
        'flex flex-col min-h-0',
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-4',             // ← was py-5, saves 8px
        className,
      )}
    >
      <h2 className="shrink-0 text-sm font-medium text-foreground mb-2 select-none">
        {/* ↑ was mb-4, saves 8px */}
        Transaction history
      </h2>

      {/*
        flex-1 min-h-0: fills remaining card height after the heading.
        overflow-y-auto: scrolls when transaction rows exceed that height.
        The scroll works because the parent card has a bounded height
        (flex-1 min-h-0 in VaultDashboard's flex column).
      */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <TransactionList />
      </div>
    </div>
  )
}