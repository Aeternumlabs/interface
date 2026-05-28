'use client'

import { TransactionList } from '@/components/vault/transactions/TransactionList'

export default function VaultActivityPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4 md:pr-4">
      <div className="rounded-xl bg-card border border-border/30 px-5 py-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">
            All transactions
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground/80">
            All on-chain vault transactions for your account are shown here.
            Scroll to review deposits, sends, pings, and other activity.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border/30 px-5 py-4">
        <TransactionList />
      </div>
    </div>
  )
}
