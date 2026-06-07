/**
 * components/docs/DocsBreadcrumb.tsx
 *
 * Breadcrumb trail rendered above the page heading on every doc page.
 *
 * Output:
 * Architecture  ›  Rolling Cursor
 * User Guide    ›  Testnet Walkthrough
 * FAQ           ›  Frequently Asked Questions
 *
 * Behaviour:
 * - Section label links to the first item in that section.
 * (Sections have no standalone index page — the first item is the
 * logical entry point for each section.)
 * - Current page label is plain text (no link — you're already here).
 * - Returns null for unknown slugs so the page renders cleanly
 * on 404-bound routes before notFound() fires.
 *
 * Server component — no client hooks needed.
 * The slug is passed as a prop from the parent server page.
 */

import Link           from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  findDocsBySlug,
  findSectionBySlug,
} from '@/config/docs-nav'

// --- Types ---
interface DocsBreadcrumbProps {
  /** Canonical slug, e.g. 'architecture/rolling-cursor' or 'faq' */
  slug: string
}

// --- Component ---
export function DocsBreadcrumb({ slug }: DocsBreadcrumbProps) {
  const section = findSectionBySlug(slug)
  const item    = findDocsBySlug(slug)

  // Unknown slug — page will 404; render nothing
  if (!section || !item) return null

  // Section links to its first item (no standalone section index pages)
  const sectionHref = `/docs/${section.items[0].slug}`

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">

        {/* Section label — links to first page in this section */}
        <li>
          <Link 
            href={sectionHref} 
            className="transition-colors duration-150 hover:text-foreground"
          >
            {section.label}
          </Link>
        </li>

        {/* Separator */}
        <li aria-hidden="true">
          <ChevronRight className="size-3.5 text-muted-foreground/40" />
        </li>

        {/* Current page — plain text, aria-current for screen readers */}
        <li
          aria-current="page"
          className="text-foreground/70"
        >
          {item.label}
        </li>

      </ol>
    </nav>
  )
}