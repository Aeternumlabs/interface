/**
 * app/docs/[...slug]/page.tsx
 *
 * Dynamic MDX renderer — handles every content route under /docs.
 *
 * Route examples:
 * /docs/introduction/what-is-aeternum  →  slug: ['introduction', 'what-is-aeternum']
 * /docs/architecture/keeper-network    →  slug: ['architecture', 'keeper-network']
 * /docs/faq                            →  slug: ['faq']
 * /docs                                →  handled by app/docs/page.tsx (redirect)
 *
 * Per-page lifecycle:
 * 1. Resolve slug segments → slug string
 * 2. Load + parse .mdx file via getDocContent()
 * 3. notFound() if slug is unregistered or file is missing
 * 4. Compile + render MDX via next-mdx-remote/rsc MDXRemote
 * 5. Wrap with DocsBreadcrumb + DocsPageFooter (prev / next)
 *
 * Build-time:
 * generateStaticParams  — pre-renders every registered doc page as static HTML
 * generateMetadata      — populates <title> and <meta description> per page
 *
 */

import { notFound }               from 'next/navigation'
import { MDXRemote }              from 'next-mdx-remote/rsc'
import type { Metadata }          from 'next'
import type { PluggableList }     from 'unified'
import remarkGfm                  from 'remark-gfm'
import rehypeSlug                 from 'rehype-slug'
import rehypeAutolinkHeadings     from 'rehype-autolink-headings'
import rehypePrettyCode           from 'rehype-pretty-code'

import { getDocContent, getAllDocSlugs, getDocMetadata } from '@/lib/docs'
import { getAdjacentDocs }   from '@/config/docs-nav'
import { DocsBreadcrumb }    from '@/components/docs/DocsBreadcrumb'
import { DocsPageFooter }    from '@/components/docs/DocsPageFooter'
import { mdxComponents }     from '@/components/docs/MdxComponents'

// Remark / rehype plugin config
//
// Defined once here so it is not re-allocated on every render.
// Typed as PluggableList to satisfy next-mdx-remote's options shape.
const remarkPlugins: PluggableList = [
  remarkGfm,
]

// Configuration options for the syntax highlighter
const prettyCodeOptions = {
  theme: 'one-dark-pro', // Using a standard clean dark theme
  keepBackground: false,  // Preserves Shiki's theme background color
}

const rehypePlugins: PluggableList = [
  rehypeSlug,
  // 'wrap' mode wraps the heading text in an <a> rather than prepending a
  // separate anchor element — cleaner markup and easier to style in MdxComponents
  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
  // Integrates syntax highlighting natively into the MDX compilation engine
  [rehypePrettyCode, prettyCodeOptions],
]

// --- Types ---
// Next.js 15: params is a Promise — must be awaited before accessing fields
interface PageProps {
  params: Promise<{ slug?: string[] }>
}

// --- Static generation ---
// Pre-renders every slug returned by getAllDocSlugs() at build time.
// Only slugs that both exist on disk AND are registered in config/docs-nav.ts
// are included — orphaned files are excluded.
//
// The [...slug] catch-all receives segments as string[], so we split:
//   'architecture/keeper-network'  →  { slug: ['architecture', 'keeper-network'] }
//   'faq'                          →  { slug: ['faq'] }
export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({
    slug: slug.split('/'),
  }))
}

// --- Metadata ---
// Returns page-level title and description.
// The layout template in app/docs/layout.tsx composes the full title string:
//   meta.title = 'Rolling Cursor'  →  <title>Rolling Cursor — Aeternum Docs</title>
export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { slug: segments } = await params
  const slug               = segments?.join('/') ?? ''

  const meta = await getDocMetadata(slug)
  if (!meta) return {}

  return {
    title:       meta.title,
    description: meta.description,
    openGraph: {
      title:       `${meta.title} — Aeternum Docs`,
      description: meta.description,
    },
  }
}

// --- Page ---
export default async function DocsPage({ params }: PageProps) {
  // --- 1. Resolve slug
  const { slug: segments } = await params
  const slug               = segments?.join('/') ?? ''

  // --- 2. Load content — returns null for unregistered slug or missing file
  const doc = await getDocContent(slug)
  if (!doc) notFound()

  // --- 3. Resolve adjacent pages for footer navigation
  const { prev, next } = getAdjacentDocs(slug)

  // --- 4. Render
  return (
    <article className="mx-auto w-full max-w-3xl px-6 pb-20 pt-10 md:px-10 md:pt-12">

      {/* Breadcrumb */}
      {/* e.g. "Architecture  /  Rolling Cursor"                   */}
      <DocsBreadcrumb slug={slug} />

      {/* Page header */}
      <div className="mt-4 flex flex-wrap items-start gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {doc.frontmatter.title}
        </h1>

        {doc.frontmatter.badge && (
          <PageBadge badge={doc.frontmatter.badge} />
        )}
      </div>

      {/* Description lede */}
      {doc.frontmatter.description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {doc.frontmatter.description}
        </p>
      )}

      {/* Divider */}
      <hr className="my-8 border-border/50" />

      {/* MDX body */}
      {/* */}
      {/* min-w-0 prevents flex children (tables, code blocks)    */}
      {/* from overflowing the article column.                    */}
      {/* */}
      {/* MDX files should start at h2 level — the h1 above is     */}
      {/* always rendered from frontmatter so headings in the MDX  */}
      {/* source never duplicate the page title.                  */}
      <div className="min-w-0">
        <MDXRemote
          source={doc.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins,
              rehypePlugins,
            },
          }}
        />
      </div>

      {/* Prev / next footer */}
      <DocsPageFooter prev={prev} next={next} />

    </article>
  )
}

// --- PageBadge ---
//
// Inline server component — too small to warrant its own file.
// Renders the 'new' or 'coming-soon' badge next to the page title.
//
// Colors reference existing globals.css tokens:
//   'new'          → --price-up  (142 71% 45%)  green
//   'coming-soon'  → --muted / --muted-foreground / --border  neutral
const BADGE_STYLES = {
  'new': [
    'bg-[hsl(142_71%_45%/0.1)]',
    'text-[hsl(142_71%_58%)]',
    'border border-[hsl(142_71%_45%/0.25)]',
  ].join(' '),
  'coming-soon': 'bg-muted text-muted-foreground border border-border',
} as const

const BADGE_LABELS = {
  'new':         'New',
  'coming-soon': 'Coming Soon',
} as const

function PageBadge({ badge }: { badge: 'new' | 'coming-soon' }) {
  return (
    <span
      className={[
        'mt-2 inline-flex shrink-0 items-center rounded-full',
        'px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        BADGE_STYLES[badge],
      ].join(' ')}
    >
      {BADGE_LABELS[badge]}
    </span>
  )
}