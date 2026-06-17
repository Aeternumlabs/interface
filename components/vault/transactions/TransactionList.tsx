/**
 * components/vault/transactions/TransactionList.tsx
 *
 * Fetches all vault transaction events for the connected wallet via
 * useVaultTransactions() and renders them as a scrollable list of
 * TransactionRow components inside VaultHistoryCard.
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

interface TransactionListProps {
  className?: string
  limit?: number
}

export function TransactionList({ className, limit }: TransactionListProps) {
  const { 
    transactions, 
    isLoading, 
    isError, 
    refetch, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage 
  } = useVaultTransactions(limit)

  if (isLoading) {
    return (
      <div className={cn('px-1', className)}>
        <LoadingSkeleton variant="tx-row" count={limit ? Math.min(limit, 4) : 4} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 px-4', className)}>
        <p className="text-sm text-muted-foreground/70 text-center">
          Unable to load transaction history.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-full border border-border/60 bg-secondary px-4 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return <EmptyTransactionState className={className} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn('flex flex-col divide-y divide-border/30', className)}>
        {transactions.map((event, index) => (
          <TransactionRow
            key={event.id || `tx-row-${index}`} 
            event={event}
          />
        ))}
      </div>

      {/* Infinite Pagination Interface Trigger */}
      {!limit && hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className={cn(
              "rounded-lg border border-border/40 bg-secondary/50 px-5 py-2 text-xs font-medium text-foreground",
              "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isFetchingNextPage ? "Loading more history..." : "Load older activities"}
          </button>
        </div>
      )}
    </div>
  )
}