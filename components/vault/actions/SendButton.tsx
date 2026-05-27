'use client'

/**
 * components/vault/actions/SendButton.tsx
 *
 * The "Send" pill button in VaultActions.
 * Clicking opens SendModal which collects a recipient address and ETH amount,
 * then calls send(to, amount) — deducting from the vault balance.
 *
 * Modal state is self-contained here.
 *
 * Icon: ArrowUpRight — the conventional "send / outgoing" direction,
 * matching the upward arrow visible in the Figma design.
 */

import { useState }      from 'react'
import { ArrowUpRight }  from 'lucide-react'
import { SendModal }     from '@/components/vault/modals/SendModal'
import { cn }            from '@/lib/utils'

// --- Types ---

interface SendButtonProps {
  className?: string
}

// --- Component ---

export function SendButton({ className }: SendButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          // Layout — flex-1 shares width equally with Deposit and Ping
          'inline-flex items-center justify-center gap-2',
          'flex-1 h-9',
          // Shape
          'rounded-full',
          // Colour
          'border border-foreground/10 bg-secondary',
          'text-sm font-medium text-foreground/90',
          // Interaction
          'transition-colors duration-150 select-none cursor-pointer',
          'hover:bg-accent hover:text-foreground hover:border-foreground/20',
          // Focus
          'outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className,
        )}
        aria-label="Send ETH from vault"
      >
        <ArrowUpRight className="size-4 shrink-0" strokeWidth={2} />
        <span>Send</span>
      </button>

      <SendModal open={open} onOpenChange={setOpen} />
    </>
  )
}
