'use client'

/**
 * components/vault/actions/PingButton.tsx
 *
 * The "Ping" pill button in VaultActions.
 * Unlike Deposit and Send, Ping has NO modal — clicking the button directly
 * submits the ping() transaction to prove liveness and reset the timer.
 *
 * The button is the entire interaction surface. Its appearance reflects
 * the transaction state inline:
 *
 *   idle        → [↻ Ping]               metallic dark, normal
 *   pending     → [⟳ Confirm…]          spinner, button disabled
 *   confirming  → [⟳ Confirming…]       spinner, button disabled
 *   confirmed   → [✓ Pinged!]            emerald tint, disabled (2s)
 *                   → auto-resets to idle after 2 seconds
 *   error       → [↻ Ping]               error toast shown, resets after 3s
 *
 * Sonner toasts accompany each state transition so the user has feedback
 * even if they scroll away from the button between submit and confirmation.
 */

import { useEffect }   from 'react'
import { RefreshCw, Check, Loader2 } from 'lucide-react'
import { toast }       from 'sonner'
import { usePing }     from '@/hooks/contracts/writes/usePing'
import { cn }          from '@/lib/utils'

// --- Types ---

interface PingButtonProps {
  className?: string
}

const TOAST_ID = 'ping-tx'

// --- Component ---

export function PingButton({ className }: PingButtonProps) {
  const {
    ping,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
  } = usePing()

  const isBusy = isPending || isConfirming

  // --- Toast: pending
  useEffect(() => {
    if (isPending) toast.loading('Confirm in wallet…', { id: TOAST_ID })
  }, [isPending])

  // --- Toast: confirming
  useEffect(() => {
    if (isConfirming) toast.loading('Transaction confirming…', { id: TOAST_ID })
  }, [isConfirming])

  // --- Toast + auto-reset: confirmed
  // Show the success state for 2 seconds, then return the button to idle
  // so the user can ping again if needed.
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Timer reset — vault is active!', { id: TOAST_ID })
      const t = setTimeout(() => reset(), 2_000)
      return () => clearTimeout(t)
    }
  }, [isConfirmed, reset])

  // --- Toast + auto-reset: error
  // Show the error for 3 seconds, then let the user try again.
  useEffect(() => {
    if (isError) {
      toast.error(
        (error as any)?.shortMessage ?? error?.message ?? 'Transaction failed',
        { id: TOAST_ID },
      )
      const t = setTimeout(() => reset(), 3_000)
      return () => clearTimeout(t)
    }
  }, [isError, error, reset])

  // --- Derived appearance
  const isSuccess = isConfirmed && !isBusy

  return (
    <button
      type="button"
      onClick={ping}
      // Disabled while in flight OR during the 2-second success display
      disabled={isBusy || isSuccess}
      className={cn(
        // Layout — flex-1 shares width equally with Deposit and Send
        'inline-flex items-center justify-center gap-2',
        'flex-1 h-9',
        // Shape
        'rounded-full',
        // Base colour — overridden per state below
        'border text-sm font-medium',
        // Interaction
        'transition-colors duration-150 select-none',
        'outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed',

        // --- State-specific colours
        // idle / pending / confirming
        !isSuccess && [
          'border border-foreground/10 bg-secondary',
          'text-foreground/90',
          'hover:bg-accent hover:text-foreground hover:border-foreground/20',
          isBusy && 'opacity-70',
          'cursor-pointer',
        ],

        // confirmed — emerald success tint
        isSuccess && [
          'border-emerald-800/50 bg-emerald-950/40',
          'text-emerald-400',
          // No hover change — button is disabled during this state
        ],
      )}
      aria-label={
        isBusy     ? 'Ping in progress…'
        : isSuccess ? 'Vault pinged'
        : 'Ping vault to reset inactivity timer'
      }
    >
      {/* Icon + label based on state */}
      {isBusy ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span>{isPending ? 'Confirm…' : 'Confirming…'}</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="size-4 shrink-0" strokeWidth={2.5} />
          <span>Pinged!</span>
        </>
      ) : (
        <>
          <RefreshCw className="size-4 shrink-0" strokeWidth={2} />
          <span>Ping</span>
        </>
      )}
    </button>
  )
}
