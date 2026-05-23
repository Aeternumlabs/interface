'use client'

/**
 * components/vault/actions/DepositButton.tsx
 *
 * The "Deposit" pill button in VaultActions.
 * Clicking opens DepositModal which collects an ETH amount and
 * calls deposit() — sending ETH as msg.value to the vault.
 *
 * Modal state is self-contained here. ActionButtonRow and VaultActions
 * need no knowledge of whether the deposit modal is open.
 *
 * Icon: ArrowDownLeft — the conventional "receive / deposit" direction,
 * matching the downward arrow visible in the Figma design.
 */

import { useState }       from 'react'
import { ArrowDownLeft }  from 'lucide-react'
import { DepositModal }   from '@/components/vault/modals/DepositModal'
import { cn }             from '@/lib/utils'

// --- Types ---

interface DepositButtonProps {
  className?: string
}

// --- Component ---

export function DepositButton({ className }: DepositButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          // Layout — flex-1 shares width equally with Send and Ping
          'inline-flex items-center justify-center gap-2',
          'flex-1 h-9',
          // Shape
          'rounded-full',
          // Colour
          'border border-border/60 bg-secondary',
          'text-sm font-medium text-foreground/90',
          // Interaction
          'transition-colors duration-150 select-none cursor-pointer',
          'hover:bg-accent hover:text-foreground hover:border-border',
          // Focus
          'outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className,
        )}
        aria-label="Deposit ETH into vault"
      >
        <ArrowDownLeft className="size-4 shrink-0" strokeWidth={2} />
        <span>Deposit</span>
      </button>

      <DepositModal open={open} onOpenChange={setOpen} />
    </>
  )
}
