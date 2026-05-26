/**
 * app/vault/page.tsx
 *
 * Vault dashboard route (/vault).
 * Renders the three stacked cards in the centre column.
 * Sidebar-triggered modals are controlled by vault/layout.tsx via useVaultModal.
 */

'use client'

import { VaultDashboard } from '@/components/vault/VaultDashboard'
import { useVaultModal }  from './layout'

export default function VaultPage() {
  const { activeModal, openModal, closeModal } = useVaultModal()

  return (
    <VaultDashboard
      className="h-full min-h-0"
      activeModal={activeModal}
      onOpenModal={openModal}
      onCloseModal={closeModal}
    />
  )
}
