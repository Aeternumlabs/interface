'use client'

/**
 * components/vault/VaultDashboard.tsx
 *
 * Stacks the three vault cards vertically and renders the sidebar-triggered
 * modals (Update config, Withdraw, Cancel recovery).
 *
 * Modal ownership split:
 *   Self-contained (inside action buttons):
 *     RegisterModal  → RegisterButton
 *     DepositModal   → DepositButton
 *     SendModal      → SendButton
 *
 *   Externally triggered (from sidebar nav items):
 *     UpdateConfigModal   → activeModal === 'updateConfig'
 *     WithdrawModal       → activeModal === 'withdraw'
 *     CancelRecoveryModal → activeModal === 'cancelRecovery'
 *
 * The sidebar modals are wired here via the activeModal state pattern.
 *
 * --- Wiring the sidebar ---
 *
 * VaultDashboard can be used in two ways:
 *
 * A) Self-contained (VaultDashboard manages its own modal state):
 *      <VaultDashboard />
 *    Sidebar items have no effect — only works if the sidebar is not
 *    present or not wired to open modals.
 *
 * B) Externally controlled (parent manages modal state — recommended):
 *      // In vault/page.tsx ('use client'):
 *      const [modal, setModal] = useState<ActiveModal>(null)
 *      <VaultDashboard activeModal={modal} onOpenModal={setModal} onCloseModal={() => setModal(null)} />
 *
 *    Then in vault/layout.tsx, provide setModal to the sidebar via a
 *    shared React context so sidebar nav items can call openModal()
 *    across the layout / page component tree boundary.
 *    See: app/vault/layout.tsx for the complete wiring.
 */

import { useState }              from 'react'
import { BalanceCard }           from './cards/BalanceCard'
import { TopAssetsCard }         from './cards/TopAssetsCard'
import { TransactionHistoryCard } from './cards/TransactionHistoryCard'
import { UpdateConfigModal }     from './modals/UpdateConfigModal'
import { WithdrawModal }         from './modals/WithdrawModal'
import { CancelRecoveryModal }   from './modals/CancelRecoveryModal'
import { cn }                    from '@/lib/utils'
import type { ActiveModal }      from '@/types'

// --- Types ---

interface VaultDashboardProps {
  /**
   * Externally controlled active modal.
   * Provide this (with onOpenModal + onCloseModal) when vault/page.tsx
   * manages modal state so the sidebar can trigger modals via context.
   * Omit to let VaultDashboard manage its own modal state internally.
   */
  activeModal?:   ActiveModal
  onOpenModal?:   (modal: NonNullable<ActiveModal>) => void
  onCloseModal?:  () => void
  className?:     string
}

// --- Component ---

export function VaultDashboard({
  activeModal:   externalModal,
  onOpenModal:   externalOpen,
  onCloseModal:  externalClose,
  className,
}: VaultDashboardProps = {}) {

  // --- Modal state
  // Own internal state — used when no external control is provided.
  const [ownModal, setOwnModal] = useState<ActiveModal>(null)

  // Whether the parent is driving modal state.
  // We detect this by checking if an external setter was provided.
  const isControlled = externalOpen !== undefined

  // The active modal is whichever source is authoritative.
  const activeModal = isControlled ? (externalModal ?? null) : ownModal

  // Open a sidebar modal — updates own state OR notifies the parent.
  const openModal = (modal: NonNullable<ActiveModal>) => {
    if (!isControlled) setOwnModal(modal)
    externalOpen?.(modal)
  }

  // Close whatever modal is currently open.
  const closeModal = () => {
    if (!isControlled) setOwnModal(null)
    externalClose?.()
  }

  return (
    <div className={cn('flex flex-1 flex-col gap-4 overflow-y-auto pb-4 md:pr-4', className)}>

      {/* Top cards — fixed height; do not shrink */}
      <BalanceCard className="shrink-0" />
      <TopAssetsCard className="shrink-0" />

      {/* Fills remaining column height; list scrolls inside the card */}
      <TransactionHistoryCard className="shrink-0" />

      {/* Sidebar-triggered modals */}
      {/*
        These three modals are opened by sidebar nav items, not by the
        action buttons inside BalanceCard. They live here so they are
        always mounted when the dashboard is visible.
      */}

      {/* "Update config" sidebar item → opens this modal */}
      <UpdateConfigModal
        open={activeModal === 'updateConfig'}
        onOpenChange={(o) => { if (!o) closeModal() }}
      />

      {/* "Withdraw balance" sidebar item → opens this modal */}
      <WithdrawModal
        open={activeModal === 'withdraw'}
        onOpenChange={(o) => { if (!o) closeModal() }}
      />

      {/* "Cancel recovery" sidebar item → opens this modal */}
      <CancelRecoveryModal
        open={activeModal === 'cancelRecovery'}
        onOpenChange={(o) => { if (!o) closeModal() }}
      />
    </div>
  )
}
