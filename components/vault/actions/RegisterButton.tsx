'use client'

/**
 * components/vault/actions/RegisterButton.tsx
 *
 * Renders as the single action button when the connected wallet has no
 * active vault (State 2). Occupies the full width of the action row —
 * the same horizontal space that Deposit | Send | Ping fills in State 3.
 *
 * Clicking opens RegisterModal which collects backup address,
 * inactivity period, and an optional initial deposit, then calls register().
 *
 * Modal state is self-contained here — ActionButtonRow needs no knowledge
 * of whether the registration modal is open.
 */

import { useState }       from 'react'
import { ShieldPlus }     from 'lucide-react'
import { RegisterModal }  from '@/components/vault/modals/RegisterModal'
import { cn }             from '@/lib/utils'

// --- Types ---

interface RegisterButtonProps {
  className?: string
}

// --- Component ---

export function RegisterButton({ className }: RegisterButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          // Layout
          'inline-flex items-center justify-center gap-2',
          'w-full h-9',
          // Shape
          'rounded-full',
          // Colour — slightly brighter outline for better contrast
          'border border-foreground/10 bg-secondary',
          'text-sm font-medium text-foreground/90',
          // Interaction
          'transition-colors duration-150 select-none cursor-pointer',
          'hover:bg-accent hover:text-foreground hover:border-foreground/20',
          // Focus
          'outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className,
        )}
        aria-label="Register vault recovery"
      >
        <ShieldPlus className="size-4 shrink-0" strokeWidth={1.75} />
        <span>Register</span>
      </button>

      <RegisterModal open={open} onOpenChange={setOpen} />
    </>
  )
}
