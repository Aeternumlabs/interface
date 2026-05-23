/**
 * components/vault/cards/TransactionHistoryCard.tsx
 *
 * The bottom card in the vault dashboard.
 * Matches the "Transaction history" section in the Figma design.
 *
 * This card is intentionally thin — it owns no data hooks of its own.
 * All data fetching lives inside TransactionList → useVaultTransactions().
 * The card provides only the shell: heading, card background, padding.
 *
 * Empty state: TransactionList renders EmptyTransactionState when
 * no events exist yet ("No transactions yet" with a clock icon).
 *
 * Loading state: TransactionList renders skeleton rows while getLogs
 * is in flight. The card does not flicker because TransactionList holds
 * the previous data as a placeholder during background refetches.
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
        'rounded-xl bg-card',
        'border border-border/30',
        'px-5 py-5',
        // Minimum height keeps the card visually substantial even when
        // the empty state is shown — prevents layout collapse.
        'min-h-[180px]',
        className,
      )}
    >
      {/* Heading */}
      <h2 className="text-sm font-medium text-foreground mb-4 select-none">
        Transaction history
      </h2>

      {/* Transaction list */}
      {/*
        TransactionList handles all internal states:
          • isLoading   → skeleton rows via LoadingSkeleton variant="tx-row"
          • isEmpty     → EmptyTransactionState ("No transactions yet")
          • isError     → inline RPC error message
          • populated   → list of TransactionRow, newest first
      */}
      <TransactionList />
    </div>
  )
}
