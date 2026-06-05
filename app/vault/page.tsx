/**
 * app/vault/page.tsx
 *
 * Vault dashboard route (/vault).
 * Renders the three stacked cards in the centre column.
 * Sidebar-triggered modals are now globally controlled and mounted in vault/layout.tsx.
 */

'use client'

import { VaultDashboard } from '@/components/vault/VaultDashboard'

export default function VaultPage() {
  return (
    <VaultDashboard className="h-full min-h-0" />
  )
}