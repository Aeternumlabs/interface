'use client'

/**
 * components/vault/modals/SendModal.tsx
 *
 * Opened by SendButton. Sends ETH from the vault balance to any external address.
 * send() deducts from vault balance (not a new deposit) and resets the timer.
 *
 * Validates:
 *   recipient — valid Ethereum address, not the zero address
 *   amount    — positive number, basic format validation
 *               (insufficient balance is caught by the contract and surfaced as isError)
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
import { useSend }        from '@/hooks/contracts/writes/useSend'
import { useVaultConfig } from '@/hooks/contracts/reads/useVaultConfig'
import { isValidAddress, isZeroAddress, ethToWei, cn } from '@/lib/utils'

// --- Schema ---

const schema = z.object({
  to: z
    .string()
    .min(1, 'Recipient address is required')
    .refine(isValidAddress,  'Must be a valid Ethereum address')
    .refine((v) => !isZeroAddress(v), 'Cannot send to the zero address'),

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

interface SendModalProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

const TOAST_ID = 'send-tx'

// --- Component ---

export function SendModal({ open, onOpenChange }: SendModalProps) {
  const { config }                                                            = useVaultConfig()
  const { send, isPending, isConfirming, isConfirmed, isError, error, reset: resetTx } = useSend()
  const { register, handleSubmit, reset: resetForm, formState: { errors } }  = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { to: '', amount: '' },
  })

  const isBusy = isPending || isConfirming

  useEffect(() => { if (!open) { resetForm(); resetTx() } }, [open, resetForm, resetTx])
  useEffect(() => { if (isPending)    toast.loading('Confirm in wallet…',          { id: TOAST_ID }) }, [isPending])
  useEffect(() => { if (isConfirming) toast.loading('Transaction confirming…',     { id: TOAST_ID }) }, [isConfirming])
  useEffect(() => {
    if (isConfirmed) { toast.success('ETH sent successfully!', { id: TOAST_ID }); onOpenChange(false) }
  }, [isConfirmed, onOpenChange])
  useEffect(() => {
    if (isError) toast.error((error as any)?.shortMessage ?? error?.message ?? 'Transaction failed', { id: TOAST_ID })
  }, [isError, error])

  const onSubmit = ({ to, amount }: FormValues) =>
    send({ to: to as `0x${string}`, amountWei: ethToWei(amount) })

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isBusy) onOpenChange(o) }}>
      <DialogContent
        className="bg-card border-border/60 text-foreground max-w-sm"
        onInteractOutside={(e) => { if (isBusy) e.preventDefault() }}
        onEscapeKeyDown={(e)   => { if (isBusy) e.preventDefault() }}
      >
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-semibold">Send ETH</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Send ETH from your vault to any address. Also resets your inactivity timer.
          </DialogDescription>
        </DialogHeader>

        {/* Available balance */}
        {config && (
          <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground mb-0.5">Available balance</p>
            <ETHAmount wei={config.balance} className="text-sm text-foreground" />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Recipient */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Recipient address</Label>
            <Input
              {...register('to')}
              placeholder="0x..."
              autoComplete="off"
              spellCheck={false}
              disabled={isBusy}
              className={cn(
                'bg-muted/50 border-border/60 font-mono text-sm',
                'placeholder:text-muted-foreground/40',
                errors.to && 'border-red-700/60',
              )}
            />
            {errors.to && <p className="text-xs text-red-400">{errors.to.message}</p>}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
            <div className="relative">
              <Input
                {...register('amount')}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                disabled={isBusy}
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
              : 'Send'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
