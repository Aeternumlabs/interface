/**
 * components/layout/DashboardGrid.tsx
 *
 * Three-column layout. Sidebar and chart are fixed-width flex children
 * that never scroll. The centre main column scrolls vertically when
 * VaultDashboard content (cards + growing transaction list) exceeds
 * the viewport height.
 *
 * Desktop:
 *   ┌──────────────┬──────────────────────────┬─────────────────┐
 *   │ sidebar      │ main — overflow-y-auto    │ chart panel     │
 *   │ 240px fixed  │ scrolls as cards grow     │ 340px fixed     │
 *   └──────────────┴──────────────────────────┴─────────────────┘
 *
 * Mobile:
 *   ┌───────────────────────────────────────────────────────────┐
 *   │ main — full width, same overflow-y-auto scroll behaviour  │
 *   └───────────────────────────────────────────────────────────┘
 *   Sidebar → MobileDrawer (inside Header). Chart → hidden.
 *
 * Why this works:
 *   The outer div has overflow-hidden which clips the sidebar/chart
 *   to their natural height. The main column independently gets
 *   overflow-y-auto so it scrolls without affecting the other columns.
 */

import { ReactNode } from 'react'
import { cn }        from '@/lib/utils'

interface DashboardGridProps {
  sidebar:    ReactNode
  chart?:     ReactNode
  children:   ReactNode
  className?: string
}

export function DashboardGrid({
  sidebar,
  chart,
  children,
  className,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        'flex flex-1 overflow-hidden',
        className,
      )}
    >
      {/* Left: Sidebar (fixed, desktop only) */}
      {sidebar}

      {/* Centre: scrollable content column */}
      {/*
        overflow-y-auto  — scrolls when VaultDashboard height > viewport
        flex-1           — fills all space between sidebar and chart
        min-w-0          — prevents content from overflowing flex parent
        No flex-col / min-h-0 needed — content flows in block layout
      */}
      <main
        className={cn(
          'flex-1 min-w-0 overflow-y-auto',
          'px-4 py-5 lg:pl-6 lg:pr-4 lg:mr-4 lg:py-6',
        )}
      >
        {children}
      </main>

      {/* Right: Chart panel (fixed, desktop only) */}
      {chart && (
        <aside
          className={cn(
            'hidden lg:flex',
            'flex-col',
            'w-85 shrink-0',
            'border-l border-border/50',
          )}
          aria-label="Balance chart"
        >
          {chart}
        </aside>
      )}
    </div>
  )
}