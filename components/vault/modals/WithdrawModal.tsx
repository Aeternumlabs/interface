'use client'

/**
 * components/vault/modals/WithdrawModal.tsx
 *
 * Opened from "Withdraw balance" in the sidebar.
 * Confirms then calls withdrawAll() — moves the entire vault balance
 * back to the connected wallet. Vault stays registered and active.
 *
 * Uses ConfirmDialog (not a full form) since there are no inputs — just
 * a single action to confirm.
 */

import { useEffect }       from 'react'
import { toast }           from 'sonner'
import { ConfirmDialog }   from '@/components/common/ConfirmDialog'
import { ETHAmount }       from '@/components/common/ETHAmount'
import { USDAmount }       from '@/components/common/USDAmount'
import { useWithdrawAll }  from '@/hooks/contracts/writes/useWithdrawAll'
import { useVaultConfig }  from '@/hooks/contracts/reads/useVaultConfig'
import { useEthPrice }     from '@/hooks/useEthPrice'

interface WithdrawModalProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

const TOAST_ID = 'withdraw-tx'

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const { config }                                                                   = useVaultConfig()
  const { usdPrice }                                                                 = useEthPrice()
  const { withdrawAll, isPending, isConfirming, isConfirmed, isError, error, reset } = useWithdrawAll()

  const isBusy = isPending || isConfirming

  useEffect(() => { if (!open) reset() }, [open, reset])
  useEffect(() => { if (isPending)    toast.loading('Confirm in wallet…',      { id: TOAST_ID }) }, [isPending])
  useEffect(() => { if (isConfirming) toast.loading('Transaction confirming…', { id: TOAST_ID }) }, [isConfirming])
  useEffect(() => {
    if (isConfirmed) { toast.success('Funds withdrawn to your wallet!', { id: TOAST_ID }); onOpenChange(false) }
  }, [isConfirmed, onOpenChange])
  useEffect(() => {
    if (isError) toast.error((error as any)?.shortMessage ?? error?.message ?? 'Transaction failed', { id: TOAST_ID })
  }, [isError, error])

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o) => { if (!isBusy) onOpenChange(o) }}
      title="Withdraw all funds"
      description="Your entire vault balance will be sent to your connected wallet. Your vault stays registered and active — you can deposit again at any time."
      confirmLabel="Withdraw"
      onConfirm={withdrawAll}
      isPending={isBusy}
    >
      {config && config.balance > 0n && (
        <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground mb-1">Amount to withdraw</p>
          <div className="flex items-baseline gap-2">
            <ETHAmount wei={config.balance} className="text-sm font-medium text-foreground" />
            <USDAmount wei={config.balance} usdPrice={usdPrice} className="text-xs text-muted-foreground" />
          </div>
        </div>
      )}
    </ConfirmDialog>
  )
}
