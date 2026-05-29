'use client'

import { useCallback, useEffect }       from 'react'
import { useForm, Controller }                      from 'react-hook-form'
import { zodResolver }                  from '@hookform/resolvers/zod'
import { z }                            from 'zod'
import { toast }                        from 'sonner'
import { Loader2 }                      from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}                                       from '@/components/ui/dialog'
import { Button }                       from '@/components/ui/button'
import { Input }                        from '@/components/ui/input'
import { Separator }                    from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}                                       from '@/components/ui/select'
import { AddressDisplay }               from '@/components/common/AddressDisplay'
import { useVaultConfig }               from '@/hooks/contracts/reads/useVaultConfig'
import { useUpdateBackupAddress }       from '@/hooks/contracts/writes/useUpdateBackupAddress'
import { useUpdateInactivityPeriod }    from '@/hooks/contracts/writes/useUpdateInactivityPeriod'
import { isValidAddress, isZeroAddress, cn } from '@/lib/utils'
import { daysToSeconds, hoursToSeconds, minutesToSeconds, formatDuration } from '@/lib/formatters'
import {
  MAX_RECOVERY_ATTEMPTS,
  SEPOLIA_MIN_INACTIVITY_PERIOD_SECONDS,
  SEPOLIA_MAX_INACTIVITY_PERIOD_SECONDS,
} from '@/lib/constants'   


interface UpdateConfigModalProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
}

// --- Sub-component: update backup address ---
const backupSchema = z.object({
  newBackupAddress: z
    .string()
    .min(1, 'Address is required')
    .refine(isValidAddress,  'Must be a valid Ethereum address')
    .refine((v) => !isZeroAddress(v), 'Cannot use the zero address'),
})
type BackupFormValues = z.infer<typeof backupSchema>

function UpdateBackupSection({ currentBackup, onSuccess }: { currentBackup: `0x${string}` | undefined, onSuccess: () => void }) {
  const { updateBackupAddress, isPending, isConfirming, isConfirmed, isError, error, reset: resetTx } = useUpdateBackupAddress()
  const { register, handleSubmit, reset: resetForm, formState: { errors } } = useForm<BackupFormValues>({
    resolver:      zodResolver(backupSchema),
    defaultValues: { newBackupAddress: '' },
  })

  const isBusy = isPending || isConfirming
  const TOAST  = 'update-backup-tx'

  useEffect(() => { if (isPending)    toast.loading('Confirm in wallet…',      { id: TOAST }) }, [isPending])
  useEffect(() => { if (isConfirming) toast.loading('Transaction confirming…', { id: TOAST }) }, [isConfirming])
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Backup address updated!', { id: TOAST })
      resetForm()
      resetTx()
      onSuccess()
    }
  }, [isConfirmed, onSuccess, resetForm, resetTx])
  useEffect(() => {
    if (isError) toast.error((error as any)?.shortMessage ?? error?.message ?? 'Transaction failed', { id: TOAST })
  }, [isError, error])

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Current backup address</p>
        {currentBackup && !isZeroAddress(currentBackup) ? (
          <AddressDisplay address={currentBackup} className="text-sm" />
        ) : (
          <span className="text-sm text-muted-foreground/60">—</span>
        )}
      </div>

      <form
        onSubmit={handleSubmit(({ newBackupAddress }) => updateBackupAddress(newBackupAddress as `0x${string}`))}
        className="flex gap-2 items-start"
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Input
            {...register('newBackupAddress')}
            placeholder="New address (0x…)"
            autoComplete="off"
            spellCheck={false}
            disabled={isBusy}
            className={cn(
              'bg-muted/50 border-border/60 font-mono text-sm',
              'placeholder:text-muted-foreground/40',
              errors.newBackupAddress && 'border-red-700/60',
            )}
          />
          {errors.newBackupAddress && (
            <p className="text-xs text-red-400">{errors.newBackupAddress.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isBusy}
          className="shrink-0 bg-secondary border border-border/60 text-foreground hover:bg-accent disabled:opacity-50 h-9 px-3 text-sm"
        >
          {isBusy ? <Loader2 className="size-4 animate-spin" /> : 'Update'}
        </Button>
      </form>
    </div>
  )
}

// --- Sub-component: update inactivity period ---
const periodSchema = z.object({
  periodValue: z
    .number({ message: 'Enter a valid number' })
    .int('Must be a whole number'),
  periodUnit: z.enum(['minutes', 'hours', 'days']),
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
type PeriodFormValues = z.infer<typeof periodSchema>

function UpdatePeriodSection({ currentPeriodSeconds, onSuccess }: { currentPeriodSeconds: bigint | undefined, onSuccess: () => void }) {
  const { updateInactivityPeriod, isPending, isConfirming, isConfirmed, isError, error, reset: resetTx } = useUpdateInactivityPeriod()
  
  const getInitialValues = useCallback(() => {
    if (!currentPeriodSeconds) return { periodValue: 30, periodUnit: 'days' as const }
    const secs = Number(currentPeriodSeconds)
    if (secs % 86400 === 0) {
      return { periodValue: secs / 86400, periodUnit: 'days' as const }
    }
    if (secs % 3600 === 0) {
      return { periodValue: secs / 3600, periodUnit: 'hours' as const }
    }
    return { periodValue: Math.floor(secs / 60), periodUnit: 'minutes' as const }
  }, [currentPeriodSeconds])

  const { register, handleSubmit, control, reset: resetForm, formState: { errors } } = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: getInitialValues(),
  })

  useEffect(() => {
    if (currentPeriodSeconds) {
      resetForm(getInitialValues())
    }
  }, [currentPeriodSeconds, getInitialValues, resetForm])

  const isBusy = isPending || isConfirming
  const TOAST  = 'update-period-tx'

  useEffect(() => { if (isPending)    toast.loading('Confirm in wallet…',      { id: TOAST }) }, [isPending])
  useEffect(() => { if (isConfirming) toast.loading('Transaction confirming…', { id: TOAST }) }, [isConfirming])
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Inactivity period updated!', { id: TOAST })
      resetTx()
      onSuccess()
    }
  }, [isConfirmed, onSuccess, resetTx])
  useEffect(() => {
    if (isError) toast.error((error as any)?.shortMessage ?? error?.message ?? 'Transaction failed', { id: TOAST })
  }, [isError, error])

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Current period</p>
        <p className="text-sm text-foreground">
          {currentPeriodSeconds ? formatDuration(currentPeriodSeconds) : <span className="text-muted-foreground/60">—</span>}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(({ periodValue, periodUnit }) => {
          const totalSeconds = 
            periodUnit === 'days' ? daysToSeconds(periodValue) : 
            periodUnit === 'hours' ? hoursToSeconds(periodValue) : 
            minutesToSeconds(periodValue);
          updateInactivityPeriod(totalSeconds)
        })}
        className="flex gap-2 items-start"
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0">
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
            <Controller
              control={control}
              name="periodUnit"
              render={({ field }) => (
                <Select
                  disabled={isBusy}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-[110px] bg-muted/50 border-border/60 h-9 focus:ring-1 focus:ring-ring focus:ring-offset-0">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/60 text-popover-foreground">
                    <SelectItem value="minutes" className="focus:bg-muted focus:text-foreground cursor-pointer">minutes</SelectItem>
                    <SelectItem value="hours" className="focus:bg-muted focus:text-foreground cursor-pointer">hours</SelectItem>
                    <SelectItem value="days" className="focus:bg-muted focus:text-foreground cursor-pointer">days</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.periodValue && (
            <p className="text-xs text-red-400">{errors.periodValue.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isBusy}
          className="shrink-0 bg-secondary border border-border/60 text-foreground hover:bg-accent disabled:opacity-50 h-9 px-3 text-sm"
        >
          {isBusy ? <Loader2 className="size-4 animate-spin" /> : 'Update'}
        </Button>
      </form>
    </div>
  )
}

// --- Main component ---
export function UpdateConfigModal({ open, onOpenChange }: UpdateConfigModalProps) {
  const { config, isLoading } = useVaultConfig()
  const handleClose = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 text-foreground max-w-md">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-semibold">Vault configuration</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            View and update your recovery settings. Each section submits independently.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading configuration…</p>
        ) : (
          <div className="flex flex-col gap-4 pt-1">
            {/* Backup address */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Backup address
              </p>
              <UpdateBackupSection
                currentBackup={config?.backupAddress}
                onSuccess={handleClose}
              />
            </div>

            <Separator className="bg-border/40" />

            {/* Inactivity period */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Inactivity period
              </p>
              <UpdatePeriodSection
                currentPeriodSeconds={config?.inactivityPeriod}
                onSuccess={handleClose}
              />
            </div>

            <Separator className="bg-border/40" />

            {/* Failed attempts (read-only) */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Recovery attempts
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Failed consecutive attempts
                </p>
                <span className={cn(
                  'text-sm font-mono tabular-nums font-medium',
                  config && config.failedRecoveryAttempts > 0 ? 'text-amber-400' : 'text-foreground/70',
                )}>
                  {config?.failedRecoveryAttempts ?? 0} / {MAX_RECOVERY_ATTEMPTS}
                </span>
              </div>
              {config && config.failedRecoveryAttempts > 0 && (
                <p className="text-[11px] text-amber-400/80 mt-0.5">
                  Your backup address failed to receive ETH {config.failedRecoveryAttempts} time{config.failedRecoveryAttempts > 1 ? 's' : ''}.
                  Ensure it can receive ETH to avoid vault abandonment.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}