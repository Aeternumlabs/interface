/**
 * components/docs/MdxComponents.tsx
 *
 * Custom component overrides passed to MDXRemote in the dynamic renderer.
 * Every HTML element that MDX produces can be restyled here without
 * modifying any MDX source file.
 *
 * Two categories of exports:
 *
 *   1. HTML element overrides — h2, h3, h4, p, a, ul, ol, li, code, pre,
 *      blockquote, table, thead, tbody, tr, th, td, hr, strong, em
 *
 *   2. Named custom components — available as JSX tags in .mdx files:
 *      <Callout>, <StepList>, <StepItem>, <FunctionCard>
 *
 * Heading anchors:
 *   rehype-autolink-headings (behavior: 'wrap') wraps each heading's text
 *   in an <a href="#id"> element. The `a` override detects anchor-only hrefs
 *   (starting with '#') and renders them with a hover-reveal '#' symbol.
 *   The parent headings carry the `group` class so the reveal transition
 *   triggers on heading hover, not just link hover.
 *
 * Link routing:
 *   '#...'   → heading anchor        (plain <a>, no nav)
 *   '/...'   → internal docs link    (Next.js <Link> for client-side nav)
 *   'http…'  → external URL          (<a target="_blank" rel="noopener">)
 *
 * Tables:
 *   Wrapped in an overflow-x-auto container so wide tables (like the
 *   Immutable Limits table in contract-reference) scroll horizontally
 *   on narrow viewports rather than breaking layout.
 *
 * --- Install note ---
 *   The MDXComponents type is imported from 'mdx/types'.
 *   This package is a peer dependency of next-mdx-remote and should already
 *   be present. If you see a type error on the import, run:
 *     npm install mdx
 * -------------------------------------------------------------------------
 *
 * Server component — no client hooks; safe to pass to MDXRemote (RSC).
 */

import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'
import type { ComponentPropsWithoutRef } from 'react'
import { cn }           from '@/lib/utils'
import { Callout }      from './Callout'
import { StepList, StepItem } from './StepList'
import { FunctionCard } from './FunctionCard'
import { HowItWorksDiagram } from './diagrams/HowItWorksDiagram'
import { RollingCursorDiagram } from './diagrams/RollingCursorDiagram'
import { Phase2ArchitectureDiagram } from './diagrams/Phase2ArchitectureDiagram'

// --- Shared style constants ---
// --chart-1: 263 65% 62% — used for links and tip accents
const LINK_CLR         = 'text-[hsl(263_65%_65%)]'
const LINK_CLR_HOVER   = 'hover:text-[hsl(263_65%_75%)]'
const LINK_BASE        = `${LINK_CLR} underline underline-offset-4 ${LINK_CLR_HOVER} transition-colors duration-150`

// --- Element overrides ---
const H2 = ({ id, children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
  <h2
    id={id}
    className="group mt-10 mb-4 scroll-mt-20 text-xl font-semibold tracking-tight text-foreground"
    {...props}
  >
    {children}
  </h2>
)

const H3 = ({ id, children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
  <h3
    id={id}
    className="group mt-8 mb-3 scroll-mt-20 text-lg font-semibold tracking-tight text-foreground"
    {...props}
  >
    {children}
  </h3>
)

const H4 = ({ id, children, ...props }: ComponentPropsWithoutRef<'h4'>) => (
  <h4
    id={id}
    className="group mt-6 mb-2 scroll-mt-20 text-base font-semibold text-foreground"
    {...props}
  >
    {children}
  </h4>
)

const P = ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
  <p
    className="my-4 text-sm leading-relaxed text-foreground/85 first:mt-0"
    {...props}
  >
    {children}
  </p>
)

/**
 * Anchor — handles three distinct cases:
 *
 *   1. Heading anchor (#id)  — from rehype-autolink-headings, behavior:'wrap'
 *      Renders as plain text with a hover-reveal '#' glyph.
 *      The `group` class on the parent heading drives the transition.
 *
 *   2. Internal link (/...)  — uses Next.js <Link> for client-side navigation.
 *
 *   3. External link (http…) — opens in a new tab with rel="noopener".
 */
const A = ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
  // --- 1. Heading anchor
  if (href?.startsWith('#')) {
    return (
      <a
        href={href}
        className="inline-flex items-baseline gap-1 no-underline text-inherit hover:text-inherit"
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="font-normal text-muted-foreground/0 transition-colors duration-150 group-hover:text-muted-foreground/50"
        >
          #
        </span>
      </a>
    )
  }

  // --- 2. Internal link
  if (href && (href.startsWith('/') || href.startsWith('./') || href.startsWith('../'))) {
    return (
      <Link href={href} className={LINK_BASE} {...props}>
        {children}
      </Link>
    )
  }

  // --- 3. External link
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_BASE}
      {...props}
    >
      {children}
    </a>
  )
}

const UL = ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
  <ul
    className="my-4 ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-foreground/85 marker:text-muted-foreground/50"
    {...props}
  >
    {children}
  </ul>
)

const OL = ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
  <ol
    className="my-4 ml-5 list-decimal space-y-1.5 text-sm leading-relaxed text-foreground/85 marker:text-muted-foreground/50"
    {...props}
  >
    {children}
  </ol>
)

const LI = ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
  <li className="pl-1" {...props}>
    {children}
  </li>
)

/**
 * Code — two modes:
 *   Block code  → rendered inside <pre>, carries a language-* className
 *   Inline code → no className, rendered mid-sentence
 */
const Code = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'code'>) => {
  const isBlock = Boolean(className?.startsWith('language-'))

  if (isBlock) {
    return (
      <code
        className={cn('block font-mono text-sm text-foreground/90', className)}
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground/90"
      {...props}
    >
      {children}
    </code>
  )
}

/**
 * Pre — code block wrapper.
 * Horizontally scrollable; uses the deepest background token (#050505 → 4%)
 * so it reads as recessed relative to the card background (#111111).
 *
 * Note: add rehype-pretty-code to the renderer's rehypePlugins array for
 * full syntax highlighting. The pre/code styling here provides a clean
 * fallback when no highlighter is configured.
 */
const Pre = ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
  <pre
    className={cn(
      'my-6 overflow-x-auto rounded-lg',
      'border border-border/50',
      'bg-[hsl(0_0%_4%)]',
      'p-5 font-mono text-sm leading-relaxed text-foreground/90',
    )}
    {...props}
  >
    {children}
  </pre>
)

const Blockquote = ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
  <blockquote
    className="my-6 border-l-2 border-border pl-4 text-sm italic text-muted-foreground [&>p]:my-0"
    {...props}
  >
    {children}
  </blockquote>
)

/**
 * Table — wrapped in an overflow container so wide tables (Immutable Limits,
 * Events reference) scroll horizontally on narrow viewports.
 */
const Table = ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
  <div className="my-6 overflow-x-auto rounded-lg border border-border/50">
    <table
      className="w-full border-collapse text-sm"
      {...props}
    >
      {children}
    </table>
  </div>
)

const THead = ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
  <thead
    className="border-b border-border/50 bg-muted/30"
    {...props}
  >
    {children}
  </thead>
)

const TBody = ({ children, ...props }: ComponentPropsWithoutRef<'tbody'>) => (
  <tbody {...props}>{children}</tbody>
)

const TR = ({ children, ...props }: ComponentPropsWithoutRef<'tr'>) => (
  <tr
    className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/20"
    {...props}
  >
    {children}
  </tr>
)

const TH = ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
  <th
    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    {...props}
  >
    {children}
  </th>
)

const TD = ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
  <td
    className="px-4 py-3 text-sm leading-relaxed text-foreground/85 align-top"
    {...props}
  >
    {children}
  </td>
)

const HR = (props: ComponentPropsWithoutRef<'hr'>) => (
  <hr className="my-8 border-border/50" {...props} />
)

const Strong = ({ children, ...props }: ComponentPropsWithoutRef<'strong'>) => (
  <strong className="font-semibold text-foreground" {...props}>
    {children}
  </strong>
)

const Em = ({ children, ...props }: ComponentPropsWithoutRef<'em'>) => (
  <em className="italic text-foreground/80" {...props}>
    {children}
  </em>
)

// --- Exported component map ---
/**
 * Passed directly to MDXRemote's `components` prop.
 *
 * Custom components (Callout, StepList, StepItem, FunctionCard) are included
 * here so they can be used as JSX tags in any .mdx file without importing them:
 *
 *   <Callout type="warning">...</Callout>
 *   <StepList><StepItem step={1} title="...">...</StepItem></StepList>
 *   <FunctionCard name="register" ... />
 */
export const mdxComponents: MDXComponents = {
  // --- HTML element overrides
  h2:         H2,
  h3:         H3,
  h4:         H4,
  p:          P,
  a:          A,
  ul:         UL,
  ol:         OL,
  li:         LI,
  code:       Code,
  pre:        Pre,
  blockquote: Blockquote,
  table:      Table,
  thead:      THead,
  tbody:      TBody,
  tr:         TR,
  th:         TH,
  td:         TD,
  hr:         HR,
  strong:     Strong,
  em:         Em,

  // --- Custom components available as JSX tags in .mdx files
  Callout,
  StepList,
  StepItem,
  FunctionCard,
  HowItWorksDiagram,
  RollingCursorDiagram,
  Phase2ArchitectureDiagram,
}
