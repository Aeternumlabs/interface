'use client'

/**
 * components/vault/modals/RegisterModal.tsx
 *
 * Opens when the user clicks the Register button (State 2 — connected, unregistered).
 * Collects backup address, inactivity period (days), and an optional initial deposit,
 * then calls register() on the contract.
 *
 * Form fields:
 *   backup address  — validated Ethereum address, cannot be zero or self
 *   period (days)   — number input, min 1 / max 365 (Sepolia MVP)
 *   deposit (ETH)   — optional, defaults to 0 if left blank
 *
 * Transaction flow:
 *   submit → pending (MetaMask open) → confirming (mined) → confirmed → modal closes
 *   Sonner toasts reflect each state transition.
 */

import { useEffect }        from 'react'
import { useForm }          from 'react-hook-form'
import { zodResolver }      from '@hookform/resolvers/zod'
import { z }                from 'zod'
import { toast }            from 'sonner'
import { Loader2 }          from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}                           from '@/components/ui/dialog'
import { Button }           from '@/components/ui/button'
import { Input }            from '@/components/ui/input'
import { Label }            from '@/components/ui/label'
import { useRegister }      from '@/hooks/contracts/writes/useRegister'
import { isValidAddress }   from '@/lib/utils'
import { daysToSeconds }    from '@/lib/formatters'
import { ethToWei }         from '@/lib/utils'
import { cn }               from '@/lib/utils'

// --- Validation schema ---

const schema = z.object({
  backupAddress: z
    .string()
    .min(1, 'Backup address is required')
    .refine(isValidAddress, 'Must be a valid Ethereum address'),

  periodDays: z
    .number({ message: 'Enter the number of days' })
    .int('Must be a whole number of days')
    .min(1,   'Minimum is 1 day')
    .max(365, 'Maximum is 365 days on Sepolia'),

  depositEth: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Enter a valid ETH amount',
    ),
})

type RegisterFormValues = z.infer<typeof schema>

// --- Types ---

interface RegisterModalProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

// --- Helpers ---

const TOAST_ID = 'register-tx'

function getErrorMessage(error: Error | null): string {
  if (!error) return 'Transaction failed'
  const e = error as any
  return e.shortMessage ?? e.message ?? 'Transaction failed'
}

// --- Component ---

export function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const {
    register:   registerTx,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset:      resetTx,
  } = useRegister()

  const {
    register,
    handleSubmit,
    reset:      resetForm,
    formState:  { errors },
  } = useForm<RegisterFormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { backupAddress: '', periodDays: 365, depositEth: '' },
  })

  // --- Reset form + hook when modal opens or closes
  useEffect(() => {
    if (!open) {
      resetForm()
      resetTx()
    }
  }, [open, resetForm, resetTx])

  // --- Toast: pending
  useEffect(() => {
    if (isPending) {
      toast.loading('Waiting for wallet confirmation…', { id: TOAST_ID })
    }
  }, [isPending])

  // --- Toast: confirming
  useEffect(() => {
    if (isConfirming) {
      toast.loading('Transaction submitted, confirming…', { id: TOAST_ID })
    }
  }, [isConfirming])

  // --- Toast + close: confirmed
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Vault registered successfully!', { id: TOAST_ID })
      onOpenChange(false)
    }
  }, [isConfirmed, onOpenChange])

  // --- Toast: error
  useEffect(() => {
    if (isError) {
      toast.error(getErrorMessage(error), { id: TOAST_ID })
    }
  }, [isError, error])

  // --- Form submit
  const onSubmit = (values: RegisterFormValues) => {
    registerTx({
      backupAddress:           values.backupAddress as `0x${string}`,
      inactivityPeriodSeconds: daysToSeconds(values.periodDays),
      depositWei:              values.depositEth
                                 ? ethToWei(values.depositEth)
                                 : 0n,
    })
  }

  const isBusy = isPending || isConfirming

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!isBusy) onOpenChange(o) }}
    >
      <DialogContent
        className="bg-card border-border/60 text-foreground max-w-md"
        onInteractOutside={(e) => { if (isBusy) e.preventDefault() }}
        onEscapeKeyDown={(e)   => { if (isBusy) e.preventDefault() }}
      >
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-semibold">
            Set up vault recovery
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose a backup address and how long before recovery triggers.
            You can update both settings at any time.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-1"
        >
          {/* Backup address */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Backup address
            </Label>
            <Input
              {...register('backupAddress')}
              placeholder="0x..."
              autoComplete="off"
              spellCheck={false}
              disabled={isBusy}
              className={cn(
                'bg-muted/50 border-border/60 font-mono text-sm',
                'placeholder:text-muted-foreground/40',
                errors.backupAddress && 'border-red-700/60',
              )}
            />
            {errors.backupAddress && (
              <p className="text-xs text-red-400">
                {errors.backupAddress.message}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground/60">
              The wallet that receives your funds if you go inactive.
              Cannot be your own address or the zero address.
            </p>
          </div>

          {/* Inactivity period */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Inactivity period (days)
            </Label>
            <Input
              {...register('periodDays', { valueAsNumber: true })}
              type="number"
              min={1}
              max={365}
              disabled={isBusy}
              className={cn(
                'bg-muted/50 border-border/60 tabular-nums',
                errors.periodDays && 'border-red-700/60',
              )}
            />
            {errors.periodDays && (
              <p className="text-xs text-red-400">
                {errors.periodDays.message}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground/60">
              Sepolia testnet: 1–365 days. Mainnet: 180–3,650 days.
            </p>
          </div>

          {/* Initial deposit (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Initial deposit — optional
            </Label>
            <div className="relative">
              <Input
                {...register('depositEth')}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                disabled={isBusy}
                className={cn(
                  'bg-muted/50 border-border/60 pr-12 tabular-nums',
                  'placeholder:text-muted-foreground/40',
                  errors.depositEth && 'border-red-700/60',
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                ETH
              </span>
            </div>
            {errors.depositEth && (
              <p className="text-xs text-red-400">
                {errors.depositEth.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isBusy}
            className={cn(
              'w-full',
              'bg-secondary border border-border/60',
              'text-foreground hover:bg-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin shrink-0" />
                <span>{isPending ? 'Confirm in wallet…' : 'Confirming…'}</span>
              </span>
            ) : (
              'Register vault'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
