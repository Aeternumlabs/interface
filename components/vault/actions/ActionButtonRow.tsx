'use client'

/**
 * components/vault/actions/ActionButtonRow.tsx
 *
 * The toggle component that sits in the footer of BalanceCard.
 * Drives the three-state design agreed in the dashboard spec:
 *
 *   Not connected          → null (Header already shows "Connect wallet")
 *   Connected, loading     → three ghost pill placeholders
 *   Connected, unregistered → <RegisterButton /> (single full-width pill)
 *   Connected, registered  → <VaultActions />   (Deposit | Send | Ping)
 *
 * The switch is driven entirely by useIsRegistered() — no props needed.
 * Modal state is fully self-contained inside each individual button.
 */

import { useAccount }       from 'wagmi'
import { RegisterButton }   from './RegisterButton'
import { VaultActions }     from './VaultActions'
import { useIsRegistered }  from '@/hooks/contracts/reads/useIsRegistered'
import { cn }               from '@/lib/utils'

// --- Loading placeholder ---
// Three ghost pills that match the VaultActions layout so there is no
// layout shift when the registration status resolves.

function ActionRowSkeleton() {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'flex-1 h-9 rounded-full',
            'border border-border/30',
            'bg-muted/30',
            'animate-pulse',
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}

// --- Component ---

interface ActionButtonRowProps {
  className?: string
}

export function ActionButtonRow({ className }: ActionButtonRowProps) {
  const { isConnected }              = useAccount()
  const { isRegistered, isLoading }  = useIsRegistered()

  // State 1 — wallet not connected
  // Header handles the connect prompt; nothing needed in the action row.
  if (!isConnected) return null

  // Loading — contract read in flight
  if (isLoading) {
    return (
      <div className={className}>
        <ActionRowSkeleton />
      </div>
    )
  }

  return (
    <div className={className}>
      {isRegistered
        // State 3 — registered: Deposit | Send | Ping
        ? <VaultActions />
        // State 2 — unregistered: single Register button
        : <RegisterButton />
      }
    </div>
  )
}
