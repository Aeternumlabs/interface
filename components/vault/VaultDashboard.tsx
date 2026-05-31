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

import { cn } from '@/lib/utils'
import { BalanceCard } from '@/components/vault/cards/BalanceCard'
import { TopAssetsCard } from '@/components/vault/cards/TopAssetsCard'
import { TransactionHistoryCard } from '@/components/vault/cards/TransactionHistoryCard'
import { UpdateConfigModal } from '@/components/vault/modals/UpdateConfigModal'
import { WithdrawModal } from '@/components/vault/modals/WithdrawModal'
import { CancelRecoveryModal } from '@/components/vault/modals/CancelRecoveryModal'

export interface VaultDashboardProps {
  activeModal?: string | null
  onOpenModal?: (modal: string) => void
  onCloseModal?: () => void
  className?: string
}

export function VaultDashboard({
  activeModal,
  onCloseModal,
  className,
}: VaultDashboardProps = {}) {
  
  const closeModal = () => {
    if (onCloseModal) onCloseModal()
  }

  return (
    // 'pb-4' removed from this wrapper to prevent the WebKit flexbox overflow bug
    <div className={cn('flex flex-col gap-4', className)}>
      
      {/* Top cards — fixed height; do not shrink */}
      <BalanceCard className="shrink-0" />
      <TopAssetsCard className="shrink-0" />

      {/* Fills remaining column height; list scrolls inside the card */}
      <TransactionHistoryCard limit={10} className="shrink-0" />

      {/* Invisible spacer to permanently preserve bottom padding */}
      <div className="h-4 shrink-0" />

      {/* Sidebar-triggered modals */}
      <UpdateConfigModal
        open={activeModal === 'updateConfig'}
        onOpenChange={(o) => { if (!o) closeModal() }}
      />
      <WithdrawModal
        open={activeModal === 'withdraw'}
        onOpenChange={(o) => { if (!o) closeModal() }}
      />
      <CancelRecoveryModal
        open={activeModal === 'cancelRecovery'}
        onOpenChange={(o) => { if (!o) closeModal() }}
      />
    </div>
  )
}