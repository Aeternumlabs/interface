'use client'

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
import { daysToSeconds, hoursToSeconds, minutesToSeconds } from '@/lib/formatters'
import { ethToWei }         from '@/lib/utils'
import { cn }               from '@/lib/utils'
import { 
  SEPOLIA_MIN_INACTIVITY_PERIOD_SECONDS, 
  SEPOLIA_MAX_INACTIVITY_PERIOD_SECONDS 
} from '@/lib/constants'

const schema = z.object({
  backupAddress: z
    .string()
    .min(1, 'Backup address is required')
    .refine(isValidAddress, 'Must be a valid Ethereum address'),

  periodValue: z
    .number({ message: 'Enter a valid number' })
    .int('Must be a whole number'),

  periodUnit: z.enum(['minutes', 'hours', 'days']),

  depositEth: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Enter a valid ETH amount',
    ),
}).superRefine((data, ctx) => {
  const totalSeconds = 
    data.periodUnit === 'days' ? data.periodValue * 86400 :
    data.periodUnit === 'hours' ? data.periodValue * 3600 :
    data.periodValue * 60;

  if (totalSeconds < SEPOLIA_MIN_INACTIVITY_PERIOD_SECONDS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Minimum is ${SEPOLIA_MIN_INACTIVITY_PERIOD_SECONDS / 60} minutes`,
      path: ['periodValue'],
    })
  }

  if (totalSeconds > SEPOLIA_MAX_INACTIVITY_PERIOD_SECONDS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Maximum is ${SEPOLIA_MAX_INACTIVITY_PERIOD_SECONDS / 86400} days`,
      path: ['periodValue'],
    })
  }
})

type RegisterFormValues = z.infer<typeof schema>

interface RegisterModalProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

const TOAST_ID = 'register-tx'

function getErrorMessage(error: Error | null): string {
  if (!error) return 'Transaction failed'
  const e = error as any
  return e.shortMessage ?? e.message ?? 'Transaction failed'
}

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
    resolver:    zodResolver(schema),
    defaultValues: { backupAddress: '', periodValue: 30, periodUnit: 'days', depositEth: '' },
  })

  useEffect(() => {
    if (!open) {
      resetForm()
      resetTx()
    }
  }, [open, resetForm, resetTx])

  useEffect(() => {
    if (isPending) toast.loading('Waiting for wallet confirmation…', { id: TOAST_ID })
  }, [isPending])

  useEffect(() => {
    if (isConfirming) toast.loading('Transaction submitted, confirming…', { id: TOAST_ID })
  }, [isConfirming])

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Vault registered successfully!', { id: TOAST_ID })
      onOpenChange(false)
    }
  }, [isConfirmed, onOpenChange])

  useEffect(() => {
    if (isError) toast.error(getErrorMessage(error), { id: TOAST_ID })
  }, [isError, error])

  const onSubmit = (values: RegisterFormValues) => {
    const inactivitySeconds = 
      values.periodUnit === 'days' ? daysToSeconds(values.periodValue) :
      values.periodUnit === 'hours' ? hoursToSeconds(values.periodValue) :
      minutesToSeconds(values.periodValue)

    registerTx({
      backupAddress:           values.backupAddress as `0x${string}`,
      inactivityPeriodSeconds: inactivitySeconds,
      depositWei:              values.depositEth ? ethToWei(values.depositEth) : 0n,
    })
  }

  const isBusy = isPending || isConfirming

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isBusy) onOpenChange(o) }}>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
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
              <p className="text-xs text-red-400">{errors.backupAddress.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground/60">
              The wallet that receives your funds if you go inactive.
              Cannot be your own address or the zero address.
            </p>
          </div>

          {/* Inactivity period */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Inactivity period
            </Label>
            <div className="flex gap-2">
              <Input
                {...register('periodValue', { valueAsNumber: true })}
                type="number"
                disabled={isBusy}
                className={cn(
                  'bg-muted/50 border-border/60 tabular-nums flex-1',
                  errors.periodValue && 'border-red-700/60',
                )}
              />
              <select
                {...register('periodUnit')}
                disabled={isBusy}
                className="bg-muted/50 border border-border/60 rounded-md px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-9"
              >
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </div>
            {errors.periodValue && (
              <p className="text-xs text-red-400">{errors.periodValue.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground/60">
              Testnet configuration: 5 minutes up to 3650 days max.
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
              <p className="text-xs text-red-400">{errors.depositEth.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isBusy}
            className="w-full bg-secondary border border-border/60 text-foreground hover:bg-accent disabled:opacity-50"
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