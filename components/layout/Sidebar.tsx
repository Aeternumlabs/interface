/**
 * components/layout/Sidebar.tsx
 *
 * Left navigation column — desktop only (hidden on mobile via lg:flex).
 * Renders all three navigation groups from config/site.ts with
 * separator lines between them, matching the Figma design.
 *
 * Layout position:
 *   Fixed w-60 (240px) column, full height of content area below Header.
 *   Right border separates it from the centre content column.
 *
 * Groups rendered (in order):
 *   1. Unlabelled  — Vault, Activity
 *   2. "explore"   — Update config, Withdraw balance, Cancel recovery
 *   3. "Insight"   — Protocol, Documentation
 *
 * Props:
 *   activeModal   — currently open modal (highlights the matching sidebar item)
 *   onOpenModal   — called when user clicks a modal nav item
 */

import { Fragment }         from 'react'
import { Separator }        from '@/components/ui/separator'
import { SidebarNavGroup }  from './SidebarNavGroup'
import { sidebarNavGroups } from '@/config/site'
import type { ActiveModal } from '@/types'

// --- Types ---

interface SidebarProps {
  activeModal?:  ActiveModal
  onOpenModal?:  (modal: NonNullable<ActiveModal>) => void
}

// --- Component ---

export function Sidebar({ activeModal, onOpenModal }: SidebarProps) {
  return (
    <aside
      className={[
        // Only visible on large screens — MobileDrawer handles mobile
        'hidden lg:flex',
        'flex-col',
        // Fixed width matching the Figma design
        'w-60 shrink-0',
        // Full height of the content area below the Header
        'h-full',
        // Right border separating sidebar from content column
        'border-r border-border/50',
        // Background — same dark card tone as the rest of the UI
        'bg-background',
      ].join(' ')}
      aria-label="Main navigation"
    >
      <nav className="flex flex-col gap-0 flex-1 overflow-y-auto px-2 py-4">
        {sidebarNavGroups.map((group, index) => (
          <Fragment key={group.label + index}>
            {/* Separator between groups — not before the first group */}
            {index > 0 && (
              <Separator className="my-3 bg-border/40" />
            )}

            <SidebarNavGroup
              group={group}
              activeModal={activeModal}
              onOpenModal={onOpenModal}
            />
          </Fragment>
        ))}
      </nav>
    </aside>
  )
}
