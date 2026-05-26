'use client'

/**
 * components/layout/MobileDrawer.tsx
 *
 * Mobile navigation drawer — visible on small screens only (lg:hidden).
 * Slides in from the left when the hamburger icon in Header is tapped.
 *
 * Built as a custom fixed overlay (not using Sheet) since Sheet is not
 * in the installed shadcn/ui components. Implements:
 * - Backdrop: semi-transparent overlay, click to close
 * - Slide panel: 240px wide, slides in from left with CSS transform
 * - Scroll lock: prevents body scroll while the drawer is open
 * - Auto-close: nav items call onClose after navigation/modal trigger
 *
 * Contains:
 * - AeternumLogo + close button in the drawer header
 * - All three SidebarNavGroup sections (same content as desktop Sidebar)
 * - CommunityLinks footer
 *
 * Props:
 * open          — controlled open state (managed by Header)
 * onClose       — called when drawer should close
 * activeModal   — currently open modal (highlights the matching item)
 * onOpenModal   — called when user taps a modal nav item
 */

import { useEffect }        from 'react'
import { Fragment }         from 'react'
import { X }                from 'lucide-react'
import { Separator }        from '@/components/ui/separator'
import { AeternumLogo }     from '@/components/common/AeternumLogo'
import { SidebarNavGroup }  from './SidebarNavGroup'
import { CommunityLinks }   from './CommunityLinks'
import { sidebarNavGroups } from '@/config/site'
import { cn }               from '@/lib/utils'
import type { ActiveModal } from '@/types'

// --- Types ---

interface MobileDrawerProps {
  open:          boolean
  onClose:       () => void
  activeModal?:  ActiveModal
  onOpenModal?:  (modal: NonNullable<ActiveModal>) => void
}

// --- Component ---

export function MobileDrawer({
  open,
  onClose,
  activeModal,
  onOpenModal,
}: MobileDrawerProps) {

  // --- Body scroll lock
  // Prevents the page from scrolling behind the drawer on mobile.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // --- Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    // Only mounted on mobile — hidden on lg and above via CSS
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        // When closed, disable pointer events so nothing underneath is blocked
        !open && 'pointer-events-none',
      )}
      aria-hidden={!open ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/70',
          'transition-opacity duration-300 ease-in-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide panel */}
      <div
        className={cn(
          // Position: full height, slides from the left edge
          'absolute left-0 top-0 bottom-0',
          // Width matching the desktop sidebar
          'w-60',
          // Appearance
          'flex flex-col',
          'bg-card border-r border-border/60',
          // Slide animation
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header — logo + close button */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border/50 shrink-0">
          <AeternumLogo size="md" asLink={false} />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className={cn(
              'flex items-center justify-center',
              'rounded-md p-1.5',
              'text-muted-foreground',
              'transition-colors duration-150',
              'hover:text-foreground hover:bg-accent',
              'outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-2 py-4"
          aria-label="Mobile navigation"
        >
          {sidebarNavGroups.map((group, index) => (
            <Fragment key={group.label + index}>
              {index > 0 && (
                <Separator className="my-3 bg-border/40" />
              )}

              <SidebarNavGroup
                group={group}
                activeModal={activeModal}
                onOpenModal={(modal) => {
                  onOpenModal?.(modal)
                  // Close drawer after triggering a modal
                  onClose()
                }}
                // Close drawer after navigating to a route
                onNavigate={onClose}
              />
            </Fragment>
          ))}

          {/* --- STATIC COMMUNITY LINKS --- */}
          <Separator className="my-3 bg-border/40" />
          <CommunityLinks />

        </nav>
      </div>
    </div>
  )
}