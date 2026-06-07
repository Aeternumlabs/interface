/**
 * app/docs/layout.tsx
 *
 * Documentation route shell — wraps every page under /docs.
 *
 * Differences from app/vault/layout.tsx:
 *   - No RainbowKit wallet-connect in the header
 *   - No chart panel (vault-specific)
 *   - No modal state (docs are read-only)
 *   - Sidebar uses route-only navigation — no modal triggers
 *
 * Server component: DocsHeader has no client dependencies.
 * DocsSidebar is 'use client' internally (uses usePathname for active
 * state) but the layout itself stays a server component.
 *
 * Requires components/docs/ — generate that folder before this
 * file will compile without import errors.
 */

import type { Metadata }  from 'next'
import type { ReactNode } from 'react'

import { DocsHeader }  from '@/components/docs/DocsHeader'
import { DocsSidebar } from '@/components/docs/DocsSidebar'
import { siteConfig }  from '@/config/site'

// --- Section metadata ---
//
// Sets the <title> template for all pages under /docs.
// Individual pages override the default string via generateMetadata().
//
// Result:
//   /docs/introduction/what-is-aeternum  →  "What is Aeternum — Aeternum Docs"
//   /docs  (fallback)                    →  "Aeternum Docs"

export const metadata: Metadata = {
  title: {
    template: '%s — Aeternum Docs',
    default:  'Aeternum Docs',
  },
  description: siteConfig.description,
}

// --- Layout ---
interface DocsLayoutProps {
  children: ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">

      {/* Top bar */}
      <DocsHeader />

      {/* Body: sidebar + scrollable content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Fixed-width left sidebar — hidden on mobile, visible lg+ */}
        <DocsSidebar />

        {/* Scrollable content area — independent from sidebar scroll */}
        <main
          id="docs-main"
          className="flex-1 overflow-y-auto scroll-smooth focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>

      </div>
    </div>
  )
}