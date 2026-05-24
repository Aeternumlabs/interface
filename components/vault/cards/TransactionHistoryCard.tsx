/**
 * components/vault/cards/TransactionHistoryCard.tsx
 *
 * The bottom card in the vault dashboard.
 * Fills all remaining centre-column height; the transaction list scrolls
 * inside this card so the rest of the app stays viewport-locked.
 */

import { TransactionList } from '@/components/vault/transactions/TransactionList'
import { cn }              from '@/lib/utils'

// --- Types ---

interface TransactionHistoryCardProps {
  className?: string
}

// --- Component ---

export function TransactionHistoryCard({ className }: TransactionHistoryCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col min-h-0',
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-5',
        className,
      )}
    >
      <h2 className="shrink-0 text-sm font-medium text-foreground mb-4 select-none">
        Transaction history
      </h2>

      {/* Scrollable list — only this region moves when history is long */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        <TransactionList />
      </div>
    </div>
  )
}
