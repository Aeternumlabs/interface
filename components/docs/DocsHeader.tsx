/**
 * components/docs/DocsHeader.tsx
 *
 * Top bar for the /docs route — intentionally simpler than the vault
 * Header.tsx because documentation is public and read-only.
 *
 * Desktop layout:
 *   [◈ Aeternum  ·  Documentation]              [← Back to App]
 *
 * Mobile layout:
 *   [◈ Aeternum]                                [← Back to App]
 *   ("· Documentation" hidden below sm breakpoint to preserve space)
 *
 * Differences from components/layout/Header.tsx:
 *   - No RainbowKit / WalletButton (docs need no wallet connection)
 *   - No MobileDrawer (docs sidebar is desktop-only in this release —
 *     see the NOTE below about adding mobile navigation)
 *   - No modal state (docs are stateless server pages)
 *   - "Back to App" link replaces the wallet button on the right
 *
 * Shell classes are copied verbatim from vault Header.tsx so both
 * headers share the same height, padding, background, and z-index:
 *   h-16  px-2 sm:px-4 lg:px-6  shrink-0
 *   bg-background border-b border-border/50  relative z-40
 *
 * Server component — no client state or hooks needed.
 *
 * NOTE — Mobile docs navigation (future enhancement):
 *   On viewports below lg the DocsSidebar is hidden (hidden lg:flex).
 *   To add mobile navigation, create a DocsMobileDrawer component
 *   (mirroring components/layout/MobileDrawer.tsx) that renders the
 *   docsNavSections, then convert this file to 'use client' and wire
 *   it up the same way as the vault Header.tsx + MobileDrawer pair.
 */

import Link         from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AeternumLogo } from '@/components/common/AeternumLogo'
import { cn }           from '@/lib/utils'

// --- Component ---
export function DocsHeader() {
  return (
    <header
      className={cn(
        // Layout — exact copy of vault Header.tsx shell classes
        'flex items-center justify-between',
        'h-16 px-2 sm:px-4 lg:px-6',
        'shrink-0',
        // Background + border
        'bg-background border-b border-border/50',
        // Stacking
        'relative z-40',
      )}
    >

      {/* --- Left: Logo + section label */}
      <div className="flex items-center gap-2.5">
        {/* Logo — same component and size as vault header */}
        <AeternumLogo size="lg" />

        {/* Separator dot — hidden on mobile to avoid crowding */}
        <span
          aria-hidden="true"
          className="hidden text-border sm:block"
        >
          ·
        </span>

        {/* "Documentation" label — hidden on mobile */}
        <span className="hidden text-sm text-muted-foreground sm:block">
          Documentation
        </span>
      </div>

      {/* --- Right: Back to App */}
      <Link
        href="/vault"
        className={cn(
          'flex items-center gap-1.5',
          'rounded-md px-3 py-1.5',
          'text-sm text-muted-foreground',
          // Hover — matches SidebarNavItem.tsx itemDefault hover
          'transition-colors duration-150',
          'hover:bg-accent hover:text-foreground',
          // Focus
          'outline-none focus-visible:ring-1 focus-visible:ring-ring',
        )}
      >
        <ArrowLeft className="size-3.5 shrink-0" />
        <span>Back to App</span>
      </Link>

    </header>
  )
}
