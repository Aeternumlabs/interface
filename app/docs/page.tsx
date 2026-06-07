/**
 * app/docs/page.tsx
 *
 * Root /docs route.
 *
 * Immediately redirects to the first page in the documentation nav tree
 * so that visiting /docs always lands on real content rather than a
 * blank shell or a custom landing page that would drift out of sync
 * with the nav.
 *
 * The redirect target is derived from docsDefaultSlug in config/docs-nav.ts:
 *   /docs  →  /docs/introduction/what-is-aeternum
 *
 * To change where /docs lands, update the order of items in docsNavSections —
 * this file never needs to be touched.
 */

import { redirect }         from 'next/navigation'
import { docsDefaultSlug }  from '@/config/docs-nav'

export default function DocsIndexPage() {
  redirect(`/docs/${docsDefaultSlug}`)
}
