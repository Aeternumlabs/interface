/**
 * components/vault/actions/VaultActions.tsx
 *
 * Renders the three action buttons side by side for a registered vault (State 3).
 * Replaces RegisterButton after the user successfully registers.
 *
 * Layout:
 *   [↓ Deposit]  [↑ Send]  [↻ Ping]
 *
 * Each button is flex-1 so they share the full row width equally.
 * Each button is self-contained — modals and transaction state live inside them.
 *
 * Used directly by ActionButtonRow when useIsRegistered() returns true.
 */

import { DepositButton } from './DepositButton'
import { SendButton }    from './SendButton'
import { PingButton }    from './PingButton'
import { cn }            from '@/lib/utils'

// --- Types ---

interface VaultActionsProps {
  className?: string
}

// --- Component ---

export function VaultActions({ className }: VaultActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        className,
      )}
    >
      <DepositButton />
      <SendButton />
      <PingButton />
    </div>
  )
}
