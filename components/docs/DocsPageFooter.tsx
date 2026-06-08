/**
 * components/docs/DocsPageFooter.tsx
 *
 * Prev / next page navigation rendered below the MDX content on every
 * doc page. Mirrors the pattern used across Ethena, Aave, and Uniswap docs.
 *
 * Behaviour:
 *   - Returns null when both prev and next are undefined (edge case —
 *     would only happen on a single-page doc site).
 *   - Uses a two-column grid so the Next card always appears on the
 *     right even when there is no Previous card (first page in section).
 *   - Shows the parent section label above each page title so the user
 *     knows which section they are navigating into.
 *
 * Props (both optional — undefined when at the start or end of the nav tree):
 *   prev  — the item immediately before the current page in flat nav order
 *   next  — the item immediately after the current page in flat nav order
 *
 * Server component — no client state needed.
 */

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  findSectionBySlug,
  type DocsNavItem,
} from '@/config/docs-nav'

// --- Types ---
export interface DocsPageFooterProps {
  prev: DocsNavItem | undefined
  next: DocsNavItem | undefined
}

// --- NavCard — individual prev or next link ---
interface NavCardProps {
  item:      DocsNavItem
  direction: 'prev' | 'next'
}

function NavCard({ item, direction }: NavCardProps) {
  const section = findSectionBySlug(item.slug)
  const isPrev  = direction === 'prev'
  const Icon    = isPrev ? ChevronLeft : ChevronRight

  return (
    <Link
      href={`/docs/${item.slug}`}
      className={cn(
        // Base layout
        'group flex w-full flex-col gap-0.5',
        'rounded-lg border border-border/50 bg-card',
        'px-4 py-2',
        // Hover
        'transition-colors duration-150',
        'hover:border-border hover:bg-accent/40',
        // Focus
        'outline-none focus-visible:ring-1 focus-visible:ring-ring',
        // Text alignment per direction
        isPrev ? 'items-start' : 'items-end text-right',
      )}
    >
      {/* Direction label + icon */}
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {isPrev && (
          <Icon className="size-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
        )}
        <span>{isPrev ? 'Previous' : 'Next'}</span>
        {!isPrev && (
          <Icon className="size-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
        )}
      </span>

      {/* Parent section name */}
      {section && (
        <span className="text-[11px] text-muted-foreground/50">
          {section.label}
        </span>
      )}

      {/* Page title */}
      <span
        className={cn(
          'text-sm font-medium text-foreground/75',
          'transition-colors duration-150',
          'group-hover:text-foreground',
        )}
      >
        {item.label}
      </span>
    </Link>
  )
}

// --- DocsPageFooter ---
export function DocsPageFooter({ prev, next }: DocsPageFooterProps) {
  // Nothing to render — should not happen in a populated nav tree
  if (!prev && !next) return null

  return (
    <footer className="not-prose mt-12 border-t border-border/50 pt-8">
      <div className="grid grid-cols-2 gap-4">

        {/* Left cell — Previous (empty div preserves right-side alignment) */}
        <div>
          {prev && <NavCard item={prev} direction="prev" />}
        </div>

        {/* Right cell — Next */}
        <div className="flex justify-end">
          {next && <NavCard item={next} direction="next" />}
        </div>

      </div>
    </footer>
  )
}
