'use client'

import { TransactionList } from '@/components/vault/transactions/TransactionList'

export default function VaultActivityPage() {
  return (
    <div className="flex min-h-screen flex-col gap-4 px-4 py-6 md:px-8">
      <div className="rounded-xl bg-card border border-border/30 px-5 py-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Activity
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Full transaction history
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground/80">
            Review all on-chain activity for your vault. This page shows the complete history
            rather than the dashboard preview.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border/30 px-5 py-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-foreground">Transactions</h2>
            <p className="text-xs text-muted-foreground/70">
              Newest first. Includes all vault events and history.
            </p>
          </div>
        </div>

        <TransactionList />
      </div>
    </div>
  )
}
