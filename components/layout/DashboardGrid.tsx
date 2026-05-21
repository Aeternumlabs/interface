/**
 * components/layout/DashboardGrid.tsx
 *
 * Three-column CSS layout that fills the full height below the Header.
 * Provides named slots for each column — it has no knowledge of what
 * goes inside them.
 *
 * Desktop layout (lg and above):
 *   ┌──────────────┬────────────────────────┬─────────────────┐
 *   │ sidebar      │ main content (flex-1)   │ chart panel     │
 *   │ 240px fixed  │ scrollable              │ 340px fixed     │
 *   └──────────────┴────────────────────────┴─────────────────┘
 *
 * Mobile layout (below lg):
 *   ┌────────────────────────────────────────┐
 *   │ main content — full width, scrollable  │
 *   └────────────────────────────────────────┘
 *   Sidebar hidden → replaced by MobileDrawer (rendered inside Header).
 *   Chart panel hidden — not shown on mobile per design decision.
 *
 * Usage in vault/layout.tsx:
 *   <DashboardGrid
 *     sidebar={<Sidebar activeModal={activeModal} onOpenModal={handleOpen} />}
 *     chart={<ChartPanel />}
 *   >
 *     {children}
 *   </DashboardGrid>
 *
 * Props:
 *   sidebar   — left column content (Sidebar component)
 *   chart     — right column content (ChartPanel component)
 *   children  — centre column content (VaultDashboard / page content)
 */

import { ReactNode } from 'react'
import { cn }        from '@/lib/utils'

// --- Types ---

interface DashboardGridProps {
  sidebar:   ReactNode
  chart?:    ReactNode
  children:  ReactNode
  className?: string
}

// --- Component ---

export function DashboardGrid({
  sidebar,
  chart,
  children,
  className,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        // Fill all remaining height below the Header
        'flex flex-1 overflow-hidden',
        className,
      )}
    >
      {/* Left column: Sidebar */}
      {/* Sidebar itself has hidden lg:flex — this wrapper matches that. */}
      {sidebar}

      {/* Centre column: Main content */}
      {/* flex-1 fills all remaining space between the two fixed columns. */}
      {/* overflow-y-auto enables independent scrolling of the content area */}
      {/* without the sidebar or chart panel scrolling along with it.      */}
      <main
        className={cn(
          'flex-1',
          'overflow-y-auto',
          // Padding inside the scrollable content area
          'px-4 py-5 lg:px-6 lg:py-6',
          // Ensures content never gets hidden behind the chart panel
          'min-w-0',
        )}
      >
        {children}
      </main>

      {/* Right column: Chart panel */}
      {/* Hidden on mobile — intentional per agreed design decision.      */}
      {/* The chart slot renders nothing when no chart prop is provided.  */}
      {chart && (
        <aside
          className={cn(
            // Desktop only — hidden on mobile
            'hidden lg:flex',
            'flex-col',
            // Fixed width matching the Figma right panel
            'w-[340px] shrink-0',
            // Left border separating chart from content column
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
