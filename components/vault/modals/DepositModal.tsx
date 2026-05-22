'use client'

/**
 * components/vault/modals/DepositModal.tsx
 *
 * Opened by DepositButton. Lets the user add ETH to their vault balance.
 * The deposit() contract function takes no arguments — ETH is sent as msg.value.
 *
 * Shows the current vault balance so the user knows what they already hold.
 * Validates that the input amount is a positive number before submitting.
 */

import { useEffect }      from 'react'
import { useForm }        from 'react-hook-form'
import { zodResolver }    from '@hookform/resolvers/zod'
import { z }              from 'zod'
import { toast }          from 'sonner'
import { Loader2 }        from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}                         from '@/components/ui/dialog'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import { Label }          from '@/components/ui/label'
import { ETHAmount }      from '@/components/common/ETHAmount'
import { useDeposit }     from '@/hooks/contracts/writes/useDeposit'
import { useVaultConfig } from '@/hooks/contracts/reads/useVaultConfig'
import { ethToWei, cn }   from '@/lib/utils'

// --- Schema ---

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      'Amount must be greater than 0',
    ),
})
type FormValues = z.infer<typeof schema>

// --- Types ---

interface DepositModalProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

const TOAST_ID = 'deposit-tx'

// --- Component ---

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { config }                                                   = useVaultConfig()
  const { deposit, isPending, isConfirming, isConfirmed, isError, error, reset: resetTx } = useDeposit()
  const { register, handleSubmit, reset: resetForm, formState: { errors } } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { amount: '' },
  })

  const isBusy = isPending || isConfirming

  useEffect(() => { if (!open) { resetForm(); resetTx() } }, [open, resetForm, resetTx])
  useEffect(() => { if (isPending)   toast.loading('Confirm in wallet…', { id: TOAST_ID }) }, [isPending])
  useEffect(() => { if (isConfirming) toast.loading('Transaction confirming…', { id: TOAST_ID }) }, [isConfirming])
  useEffect(() => {
    if (isConfirmed) { toast.success('ETH deposited!', { id: TOAST_ID }); onOpenChange(false) }
  }, [isConfirmed, onOpenChange])
  useEffect(() => {
    if (isError) toast.error((error as any)?.shortMessage ?? error?.message ?? 'Transaction failed', { id: TOAST_ID })
  }, [isError, error])

  const onSubmit = ({ amount }: FormValues) => deposit(ethToWei(amount))

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isBusy) onOpenChange(o) }}>
      <DialogContent
        className="bg-card border-border/60 text-foreground max-w-sm"
        onInteractOutside={(e) => { if (isBusy) e.preventDefault() }}
        onEscapeKeyDown={(e)   => { if (isBusy) e.preventDefault() }}
      >
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-semibold">Deposit ETH</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add ETH to your vault balance. This also resets your inactivity timer.
          </DialogDescription>
        </DialogHeader>

        {/* Current balance */}
        {config && (
          <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground mb-0.5">Current balance</p>
            <ETHAmount wei={config.balance} className="text-sm text-foreground" />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
            <div className="relative">
              <Input
                {...register('amount')}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                disabled={isBusy}
                autoFocus
                className={cn(
                  'bg-muted/50 border-border/60 pr-12 tabular-nums',
                  'placeholder:text-muted-foreground/40',
                  errors.amount && 'border-red-700/60',
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                ETH
              </span>
            </div>
            {errors.amount && <p className="text-xs text-red-400">{errors.amount.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isBusy}
            className="w-full bg-secondary border border-border/60 text-foreground hover:bg-accent disabled:opacity-50"
          >
            {isBusy
              ? <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />{isPending ? 'Confirm in wallet…' : 'Confirming…'}</span>
              : 'Deposit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
