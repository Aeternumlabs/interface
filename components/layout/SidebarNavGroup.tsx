/**
 * components/layout/SidebarNavGroup.tsx
 *
 * A labelled group of navigation items inside the sidebar.
 * Renders the optional group heading ("explore", "Insight") above
 * its list of SidebarNavItem rows.
 *
 * Separator lines between groups are handled by the parent (Sidebar /
 * MobileDrawer) so this component stays self-contained.
 *
 * Groups from config/site.ts:
 *   1. label=""        → Vault, Activity
 *   2. label="explore" → Update config, Withdraw balance, Cancel recovery
 *   3. label="Insight" → Protocol, Documentation
 */

import { SidebarNavItem }  from './SidebarNavItem'
import type { NavGroup }   from '@/config/site'
import type { ActiveModal } from '@/types'

// --- Types ---

interface SidebarNavGroupProps {
  group:          NavGroup
  activeModal?:   ActiveModal
  onOpenModal?:   (modal: NonNullable<ActiveModal>) => void
  /** Forwarded to every SidebarNavItem — used by MobileDrawer to close itself. */
  onNavigate?:    () => void
}

// --- Component ---

export function SidebarNavGroup({
  group,
  activeModal,
  onOpenModal,
  onNavigate,
}: SidebarNavGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Group label — only rendered when non-empty ("explore", "Insight") */}
      {group.label && (
        <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 select-none">
          {group.label}
        </p>
      )}

      {/* Nav items */}
      {group.items.map((item) => (
        <SidebarNavItem
          key={item.label}
          item={item}
          activeModal={activeModal}
          onOpenModal={onOpenModal}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}
