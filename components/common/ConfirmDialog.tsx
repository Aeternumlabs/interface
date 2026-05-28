'use client'

/**
 * components/common/ConfirmDialog.tsx
 *
 * Reusable "are you sure?" confirmation modal built on shadcn/ui Dialog
 * (Radix UI Dialog primitive).
 *
 * Used by:
 *   WithdrawModal       — confirm "withdraw all" before calling withdrawAll()
 *   CancelRecoveryModal — second confirmation step before cancelRecovery()
 *
 * The caller controls open/close state and supplies the confirm action.
 * ConfirmDialog is purely a presentation wrapper — it never calls contract
 * functions directly.
 *
 * Props:
 *   open          — controlled open state
 *   onOpenChange  — called when the dialog requests close (backdrop click, Esc)
 *   title         — dialog heading (e.g. "Withdraw all funds")
 *   description   — body text explaining what will happen
 *   confirmLabel  — text on the confirm button (default "Confirm")
 *   cancelLabel   — text on the cancel button (default "Cancel")
 *   onConfirm     — called when user clicks the confirm button
 *   isPending     — shows a spinner and disables buttons while a tx is in flight
 *   isDestructive — styles confirm button red (for cancelRecovery / irreversible actions)
 *   children      — optional extra content rendered between description and footer
 *
 * Usage example (WithdrawModal):
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={onOpenChange}
 *     title="Withdraw all funds"
 *     description="Your entire vault balance will be sent to your wallet. Your vault stays active."
 *     confirmLabel="Withdraw"
 *     onConfirm={withdrawAll}
 *     isPending={isPending || isConfirming}
 *   />
 */

import { ReactNode }   from 'react'
import { Loader2 }     from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}                      from '@/components/ui/dialog'
import { Button }      from '@/components/ui/button'
import { cn }          from '@/lib/utils'

// --- Types ---

interface ConfirmDialogProps {
  open:           boolean
  onOpenChange:   (open: boolean) => void
  title:          string
  description:    string | ReactNode
  confirmLabel?:  string
  cancelLabel?:   string
  onConfirm:      () => void
  isPending?:     boolean
  isDestructive?: boolean
  children?:      ReactNode
}

// --- Component ---

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel  = 'Confirm',
  cancelLabel   = 'Cancel',
  onConfirm,
  isPending     = false,
  isDestructive = false,
  children,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    if (isPending) return
    onConfirm()
  }

  const handleCancel = () => {
    if (isPending) return
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent
        className={cn(
          // Dark card background — slightly lighter than page
          'bg-card border-border/60',
          'text-foreground',
          'max-w-md w-full',
        )}
        // Prevent closing by clicking the backdrop while a tx is pending
        onInteractOutside={isPending ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isPending ? (e) => e.preventDefault() : undefined}
      >
        {/* Header */}
        <DialogHeader className="space-y-2">
          <DialogTitle
            className={cn(
              'text-base font-semibold',
              isDestructive ? 'text-red-600' : 'text-foreground',
            )}
          >
            {title}
          </DialogTitle>

          <DialogDescription
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Optional extra content (e.g. balance display) */}
        {children && (
          <div className="py-2">
            {children}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="flex gap-2 pt-2 sm:gap-2">
          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className={cn(
              'flex-1',
              'border-border/60 bg-transparent',
              'text-foreground/80 hover:text-foreground',
              'hover:bg-accent',
            )}
          >
            {cancelLabel}
          </Button>

          {/* Confirm */}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              'flex-1',
              isDestructive
                ? [
                    'bg-red-600 border border-red-600',
                    'text-white hover:bg-red-700',
                  ]
                : [
                    'bg-secondary border border-border/60',
                    'text-foreground hover:bg-accent',
                  ],
            )}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin shrink-0" />
                <span>Confirming…</span>
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
