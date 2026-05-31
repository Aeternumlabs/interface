'use client'

/**
 * app/vault/layout.tsx
 *
 * Vault route shell — 3-column dashboard layout from the Figma desktop design.
 *
 *   Header          — full width (logo, wallet, mobile drawer)
 *   DashboardGrid   — [Sidebar | page content | ChartPanel]
 *
 * Modal state for sidebar items (Update config, Withdraw, Cancel recovery)
 * lives here and is shared globally. The modals themselves are mounted here
 * so they persist across sub-routes (like /activity).
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { Header }        from '@/components/layout/Header'
import { DashboardGrid } from '@/components/layout/DashboardGrid'
import { Sidebar }       from '@/components/layout/Sidebar'
import { ChartPanel }    from '@/components/chart/ChartPanel'
import type { ActiveModal } from '@/types'

// Import your modals here
import { UpdateConfigModal }   from '@/components/vault/modals/UpdateConfigModal'
import { WithdrawModal }       from '@/components/vault/modals/WithdrawModal'
import { CancelRecoveryModal } from '@/components/vault/modals/CancelRecoveryModal'

// --- Modal context (layout ↔ page) ---

interface VaultModalContextValue {
  activeModal: ActiveModal
  openModal:   (modal: NonNullable<ActiveModal>) => void
  closeModal:  () => void
}

const VaultModalContext = createContext<VaultModalContextValue | null>(null)

export function useVaultModal(): VaultModalContextValue {
  const ctx = useContext(VaultModalContext)
  if (!ctx) {
    throw new Error('useVaultModal must be used within app/vault/layout.tsx')
  }
  return ctx
}

// --- Layout ---

interface VaultLayoutProps {
  children: ReactNode
}

export default function VaultLayout({ children }: VaultLayoutProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)

  const openModal = useCallback((modal: NonNullable<ActiveModal>) => {
    setActiveModal(modal)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  return (
    <VaultModalContext.Provider
      value={{ activeModal, openModal, closeModal }}
    >
      <div className="flex h-screen flex-col overflow-hidden">
        <Header
          activeModal={activeModal}
          onOpenModal={openModal}
        />

        <DashboardGrid
          sidebar={
            <Sidebar
              activeModal={activeModal}
              onOpenModal={openModal}
            />
          }
          chart={<ChartPanel />}
        >
          {children}
        </DashboardGrid>
      </div>

      {/* --- Global Modals --- */}
      <UpdateConfigModal 
        open={activeModal === 'updateConfig'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      <WithdrawModal 
        open={activeModal === 'withdraw'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
      <CancelRecoveryModal 
        open={activeModal === 'cancelRecovery'} 
        onOpenChange={(open) => !open && closeModal()} 
      />
    </VaultModalContext.Provider>
  )
}

// v2