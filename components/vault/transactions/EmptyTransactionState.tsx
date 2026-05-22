/**
 * components/vault/transactions/EmptyTransactionState.tsx
 *
 * Shown inside TransactionHistoryCard when the connected wallet has no
 * recorded events yet (new vault or vault with no activity).
 *
 * Deliberately minimal — a subtle icon and a short message.
 * No calls to action since the user reaches this state before any
 * vault interactions, and the action buttons are already visible above.
 */

import { ClockIcon } from 'lucide-react'
import { cn }        from '@/lib/utils'

interface EmptyTransactionStateProps {
  className?: string
}

export function EmptyTransactionState({ className }: EmptyTransactionStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-10 px-4',
        'text-center select-none',
        className,
      )}
    >
      <div className="flex items-center justify-center size-10 rounded-full bg-muted/40 mb-3">
        <ClockIcon className="size-5 text-muted-foreground/50" strokeWidth={1.5} />
      </div>

      <p className="text-sm font-medium text-muted-foreground/70">
        No transactions yet
      </p>
      <p className="text-xs text-muted-foreground/50 mt-1 max-w-[200px]">
        Your deposits, sends, and vault activity will appear here.
      </p>
    </div>
  )
}
