/**
 * app/vault/layout.tsx
 *
 * Vault route shell — 3-column dashboard layout from the Figma desktop design.
 *
 *   Header          — full width (logo, wallet, mobile drawer)
 *   DashboardGrid   — [Sidebar | page content | ChartPanel]
 *
 * Modal state for sidebar items (Update config, Withdraw, Cancel recovery)
 * lives here and is shared with app/vault/page.tsx via VaultModalContext so
 * Header, Sidebar, MobileDrawer, and VaultDashboard stay in sync.
 *
 * Action-button modals (Register, Deposit, Send) stay inside their buttons.
 */

'use client'

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
      <div className="flex min-h-0 flex-1 flex-col">
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
    </VaultModalContext.Provider>
  )
}
