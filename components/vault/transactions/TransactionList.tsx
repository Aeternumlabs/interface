/**
 * components/vault/transactions/TransactionList.tsx
 *
 * Fetches all vault transaction events for the connected wallet via
 * useVaultTransactions() and renders them as a scrollable list of
 * TransactionRow components inside TransactionHistoryCard.
 *
 * States:
 * Not connected  → nothing (parent guards connection)
 * Loading        → skeleton rows
 * Empty          → EmptyTransactionState
 * Populated      → list of TransactionRow, newest first
 * Error          → inline error message
 */

import { LoadingSkeleton }          from '@/components/common/LoadingSkeleton'
import { TransactionRow }           from './TransactionRow'
import { EmptyTransactionState }    from './EmptyTransactionState'
import { useVaultTransactions }     from '@/hooks/useVaultTransactions'
import { cn }                       from '@/lib/utils'

// --- Types ---

interface TransactionListProps {
  className?: string
  limit?: number
}

// --- Component ---

export function TransactionList({ className, limit }: TransactionListProps) {
  const { transactions, isLoading, isError, refetch } = useVaultTransactions(limit)

  // --- Loading
  if (isLoading) {
    return (
      <div className={cn('px-1', className)}>
        <LoadingSkeleton variant="tx-row" count={limit ? Math.min(limit, 4) : 4} />
      </div>
    )
  }

  // --- Error
  if (isError) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 px-4', className)}>
        <p className="text-sm text-muted-foreground/70 text-center">
          Unable to load transaction history.
        </p>
        <p className="text-xs text-muted-foreground/50 mt-1 text-center">
          Check your RPC connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className={cn(
            'mt-4 rounded-full border border-border/60 bg-secondary',
            'px-4 py-1.5 text-xs font-medium text-foreground',
            'hover:bg-accent transition-colors',
          )}
        >
          Retry
        </button>
      </div>
    )
  }

  // --- Empty
  if (transactions.length === 0) {
    return <EmptyTransactionState className={className} />
  }

  // --- Populated
  return (
    <div
      className={cn(
        'flex flex-col',
        // Dividers between rows
        'divide-y divide-border/30',
        className,
      )}
    >
      {transactions.map((event) => (
        <TransactionRow
          key={`${event.txHash}-${event.type}`}
          event={event}
        />
      ))}
    </div>
  )
}