/**
 * components/vault/cards/TransactionHistoryCard.tsx
 *
 * The bottom card in the vault dashboard.
 *
 * APPROACH: The card grows naturally with its content. The parent
 * (DashboardGrid main column) has overflow-y-auto so the user scrolls
 * the entire middle column as the transaction list grows. No internal
 * scroll mechanism is needed here — that complexity is removed.
 *
 * This works on both desktop and mobile:
 *   Desktop — sidebar and chart stay fixed; only the centre column scrolls.
 *   Mobile  — same centre column scroll, no sidebar or chart present.
 */

import { TransactionList } from '@/components/vault/transactions/TransactionList'
import { cn }              from '@/lib/utils'

interface TransactionHistoryCardProps {
  className?: string
  limit?: number
}

export function TransactionHistoryCard({ className, limit }: TransactionHistoryCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-4',
        className,
      )}
    >
      <h2 className="text-sm font-medium text-foreground mb-2 select-none">
        Transaction history
      </h2>

      {/*
        TransactionList grows to fit all events. The card grows with it.
        The parent column scrolls — no overflow needed here.
      */}
      <TransactionList limit={limit} />
    </div>
  )
}