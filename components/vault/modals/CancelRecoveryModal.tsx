'use client'

/**
 * components/vault/modals/CancelRecoveryModal.tsx
 *
 * Opened from "Cancel recovery" in the sidebar.
 * cancelRecovery() is irreversible — it withdraws all funds AND removes
 * the vault from Chainlink monitoring entirely. The user must register again.
 *
 * Uses ConfirmDialog with isDestructive=true and a strong warning block
 * rendered as children so the user fully understands the consequences.
 */

import { useEffect }         from 'react'
import { toast }             from 'sonner'
import { AlertTriangle }     from 'lucide-react'
import { ConfirmDialog }     from '@/components/common/ConfirmDialog'
import { ETHAmount }         from '@/components/common/ETHAmount'
import { useCancelRecovery } from '@/hooks/contracts/writes/useCancelRecovery'
import { useVaultConfig }    from '@/hooks/contracts/reads/useVaultConfig'
import { cn }                from '@/lib/utils'

interface CancelRecoveryModalProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

const TOAST_ID = 'cancel-tx'

export function CancelRecoveryModal({ open, onOpenChange }: CancelRecoveryModalProps) {
  const { config }                                                                        = useVaultConfig()
  const { cancelRecovery, isPending, isConfirming, isConfirmed, isError, error, reset }  = useCancelRecovery()

  const isBusy = isPending || isConfirming

  useEffect(() => { if (!open) reset() }, [open, reset])
  useEffect(() => { if (isPending)    toast.loading('Confirm in wallet…',      { id: TOAST_ID }) }, [isPending])
  useEffect(() => { if (isConfirming) toast.loading('Transaction confirming…', { id: TOAST_ID }) }, [isConfirming])
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Vault cancelled. Funds returned to your wallet.', { id: TOAST_ID })
      onOpenChange(false)
    }
  }, [isConfirmed, onOpenChange])
  useEffect(() => {
    if (isError) toast.error((error as any)?.shortMessage ?? error?.message ?? 'Transaction failed', { id: TOAST_ID })
  }, [isError, error])

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o) => { if (!isBusy) onOpenChange(o) }}
      title="Cancel recovery"
      description="This action is permanent and cannot be undone."
      confirmLabel="Yes, cancel my vault"
      cancelLabel="Keep vault active"
      onConfirm={cancelRecovery}
      isPending={isBusy}
      isDestructive
    >
      {/* Warning block */}
      <div className={cn(
        'rounded-lg border border-red-600/60 bg-red-950/20',
        'px-3 py-3 flex flex-col gap-2',
      )}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-red-600">What happens when you confirm:</p>
            <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Your vault balance is returned to your wallet</li>
              <li>Your vault is removed from Chainlink monitoring</li>
              <li>Your backup address and timer settings are wiped</li>
              <li>You must register from scratch to use Aeternum again</li>
            </ul>
          </div>
        </div>

        {/* Balance to be returned */}
        {config && config.balance > 0n && (
          <div className="border-t border-red-600/40 pt-2 mt-0.5">
            <p className="text-[11px] text-red-600 mb-0.5">Balance to be returned</p>
            <ETHAmount wei={config.balance} className="text-sm font-medium text-red-600" />
          </div>
        )}
      </div>
    </ConfirmDialog>
  )
}
