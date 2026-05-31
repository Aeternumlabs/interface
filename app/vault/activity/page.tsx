'use client'

import { TransactionList } from '@/components/vault/transactions/TransactionList'

export default function VaultActivityPage() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="rounded-xl bg-card border border-border/30 px-5 py-4">
        <div className="space-y-1">
          <h1 className="text-[17px] font-semibold text-foreground">
            Activity History
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground/80">
            All on-chain vault activities for your account are shown here.
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
