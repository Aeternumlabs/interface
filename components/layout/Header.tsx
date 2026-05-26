'use client'

/**
 * components/layout/Header.tsx
 *
 * Full-width top bar visible on every screen.
 *
 * Desktop layout:
 *   [⬡ Aeternum]                    [WalletButton]
 *
 * Mobile layout:
 *   [⬡ Aeternum]          [WalletButton]  [≡ HamburgerButton]
 *
 * The Header owns the mobile drawer open/close state so the hamburger
 * button and MobileDrawer are co-located in one component. This avoids
 * prop-drilling the drawer state up to the layout.
 *
 * Modal awareness:
 *   Header receives activeModal + onOpenModal from vault/layout.tsx
 *   and threads them into MobileDrawer so sidebar modal items work
 *   correctly on mobile as well as desktop.
 */

import { useState }        from 'react'
import { Menu }            from 'lucide-react'
import { AeternumLogo }    from '@/components/common/AeternumLogo'
import { WalletButton }    from '@/components/common/WalletButton'
import { MobileDrawer }    from './MobileDrawer'
import { cn }              from '@/lib/utils'
import type { ActiveModal } from '@/types'

// --- Types ---

interface HeaderProps {
  activeModal?:  ActiveModal
  onOpenModal?:  (modal: NonNullable<ActiveModal>) => void
  className?:    string
}

// --- Component ---

export function Header({ activeModal, onOpenModal, className }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header
        className={cn(
          // Full width, fixed height matching the drawer header height
          'flex items-center justify-between',
          'h-16 px-4 lg:px-6',
          'shrink-0',
          // Dark background matching the page, subtle bottom border
          'bg-background border-b border-border/50',
          // Sit above the content + sidebar on mobile
          'relative z-40',
          className,
        )}
      >
        {/* Left: Logo */}
        <AeternumLogo size="lg" />

        {/* Right: Wallet button + mobile hamburger */}
        <div className="flex items-center gap-2">
          <WalletButton />

          {/* Hamburger — mobile only (hidden on lg and above) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            className={cn(
              // Show only on mobile
              'flex lg:hidden',
              'items-center justify-center',
              'rounded-md p-1.5',
              'text-muted-foreground',
              'transition-colors duration-150',
              'hover:text-foreground hover:bg-accent',
              'outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {/* Rendered at the Header level so it can access drawerOpen state. */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeModal={activeModal}
        onOpenModal={(modal) => {
          onOpenModal?.(modal)
          setDrawerOpen(false)
        }}
      />
    </>
  )
}
