/**
 * lib/docs.ts
 *
 * Server-only MDX content loader for the /docs route.
 *
 * Responsibilities:
 *   - Resolve slugs to absolute file paths under content/docs/
 *   - Read raw .mdx files from disk
 *   - Parse frontmatter with gray-matter
 *   - Merge file-level metadata with nav-config defaults
 *   - Expose getAllDocSlugs() for generateStaticParams() at build time
 *
 * This module uses Node's fs API and is server-only.
 * Importing it from a client component will throw at build time.
 *
 * MDX compilation (MDXRemote) is intentionally NOT done here.
 * That lives in app/docs/[...slug]/page.tsx so this file
 * stays a pure data layer with no React dependency.
 *
 */

import 'server-only'

import fs   from 'fs'
import path from 'path'

import matter from 'gray-matter'

import {
  findDocsBySlug,
  type DocsNavItem,
} from '@/config/docs-nav'

// 1. --- Constants ---
/**
 * Absolute path to the MDX source tree.
 * Every slug is resolved relative to this directory.
 *
 * Structure:
 *   content/docs/introduction/what-is-aeternum.mdx  →  slug: 'introduction/what-is-aeternum'
 *   content/docs/faq.mdx                             →  slug: 'faq'
 */
const DOCS_CONTENT_DIR = path.join(process.cwd(), 'content', 'docs')

// 2. --- Types ---
/**
 * Shape of the optional frontmatter block at the top of each .mdx file.
 *
 * Every field is optional. Any field absent from the frontmatter block
 * falls back to the matching value declared in config/docs-nav.ts,
 * which is the canonical source of truth for label, description, and badge.
 *
 * This means most pages can have zero frontmatter — the nav config provides
 * sensible defaults and only edge cases (e.g. a custom SEO title) need
 * to override at the file level.
 *
 * Minimal valid .mdx file (no frontmatter required):
 *   # What is Aeternum
 *   Aeternum is a trustless non-custodial Ethereum vault…
 *
 * .mdx file with optional frontmatter overrides:
 *   ---
 *   title: What is Aeternum
 *   description: A custom SEO-optimised description for this page.
 *   ---
 *   # What is Aeternum
 */
export interface DocsFrontmatter {
  /** Page <title> and H1 — falls back to navItem.label when absent */
  title: string
  /** Meta description — falls back to navItem.description when absent */
  description?: string
  /** Sidebar badge — falls back to navItem.badge when absent */
  badge?: 'new' | 'coming-soon'
}

/**
 * Full shape returned by getDocContent().
 * Everything the dynamic renderer needs to render a page.
 */
export interface DocsContent {
  /** Resolved, merged frontmatter ready for use in metadata and the page heading */
  frontmatter: DocsFrontmatter
  /**
   * Raw MDX string with the frontmatter block stripped.
   * Pass this directly to <MDXRemote source={content} /> in the renderer.
   */
  content: string
  /** Canonical slug, e.g. 'introduction/what-is-aeternum' */
  slug: string
  /**
   * Matching entry from the nav tree.
   * Used by DocsBreadcrumb, prev/next links, and active sidebar state.
   */
  navItem: DocsNavItem
}

// 3. --- Private helpers ---
/**
 * Converts a slug string to an absolute .mdx file path.
 *
 * Example:
 *   slugToPath('introduction/what-is-aeternum')
 *   → '/home/user/project/content/docs/introduction/what-is-aeternum.mdx'
 */
function slugToPath(slug: string): string {
  return path.join(DOCS_CONTENT_DIR, `${slug}.mdx`)
}

/**
 * Synchronous existence check that avoids try/catch at every call site.
 * Returns false on any fs error (missing file, permission denied, etc.).
 */
function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Recursively walks a directory tree and collects all .mdx file paths
 * as slug strings relative to the given base directory.
 *
 * Normalises Windows path separators (\) to forward slashes so slug
 * comparison works consistently across operating systems.
 *
 * @param dir   Current directory being scanned
 * @param base  Root directory — slug is computed relative to this path
 */
function walkMdxFiles(dir: string, base: string): string[] {
  if (!fs.existsSync(dir)) return []

  const slugs: string[]       = []
  const entries               = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      slugs.push(...walkMdxFiles(fullPath, base))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const relative = path.relative(base, fullPath)
      // Normalise Windows separators → forward slashes for slug consistency
      const slug = relative.replace(/\.mdx$/, '').replace(/\\/g, '/')
      slugs.push(slug)
    }
  }

  return slugs
}

// 4. --- Public API ---
/**
 * Loads and parses a single documentation page by slug.
 *
 * Returns null in two cases — the renderer should call notFound() on null:
 *   1. The slug is not registered in config/docs-nav.ts
 *   2. The matching .mdx file does not exist on disk
 *
 * Frontmatter merge strategy:
 *   The nav config entry acts as the default for title, description, and badge.
 *   Any field present in the .mdx frontmatter block overrides the nav default.
 *   A page that matches its nav entry exactly needs no frontmatter at all.
 *
 * @param slug  E.g. 'introduction/what-is-aeternum' or 'faq'
 *
 * @example
 *   const doc = await getDocContent('architecture/rolling-cursor')
 *   if (!doc) notFound()
 *   // doc.frontmatter.title  → 'Rolling Cursor'
 *   // doc.content            → raw MDX string ready for MDXRemote
 */
export async function getDocContent(slug: string): Promise<DocsContent | null> {
  // --- Guard 1: must be registered in the nav tree
  const navItem = findDocsBySlug(slug)
  if (!navItem) return null

  // --- Guard 2: .mdx file must exist on disk
  const filePath = slugToPath(slug)
  if (!fileExists(filePath)) return null

  // --- Read file
  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf-8')
  } catch {
    // Handles race conditions or permission errors after the existence check
    return null
  }

  // --- Parse frontmatter
  const { data, content } = matter(raw)

  // --- Merge: nav config provides defaults, frontmatter can override
  const frontmatter: DocsFrontmatter = {
    title:       (data.title       as string                      | undefined) ?? navItem.label,
    description: (data.description as string                      | undefined) ?? navItem.description,
    badge:       (data.badge       as DocsFrontmatter['badge']    | undefined) ?? navItem.badge,
  }

  return {
    frontmatter,
    content,
    slug,
    navItem,
  }
}

/**
 * Returns resolved frontmatter only, without reading the full MDX body.
 *
 * Used by generateMetadata() in the dynamic renderer to populate
 * <title> and <meta name="description"> without the overhead of
 * loading and returning the entire page content string.
 *
 * Returns null if the slug is not found or the file does not exist.
 *
 * @param slug  E.g. 'architecture/security'
 *
 * @example
 *   export async function generateMetadata({ params }) {
 *     const slug  = params.slug?.join('/') ?? ''
 *     const meta  = await getDocMetadata(slug)
 *     if (!meta) return {}
 *     return { title: `${meta.title} — Aeternum Docs` }
 *   }
 */
export async function getDocMetadata(
  slug: string,
): Promise<DocsFrontmatter | null> {
  const doc = await getDocContent(slug)
  return doc?.frontmatter ?? null
}

/**
 * Returns the flat list of every valid slug found under content/docs/.
 *
 * "Valid" means the slug both exists as a file on disk AND has a matching
 * entry in config/docs-nav.ts. Orphaned .mdx files with no nav entry are
 * silently excluded — they would 404 anyway and should not be pre-rendered.
 *
 * Used by generateStaticParams() to pre-render all doc pages at build time.
 *
 * @example
 *   // app/docs/[[...slug]]/page.tsx
 *   export async function generateStaticParams() {
 *     return getAllDocSlugs().map((slug) => ({
 *       slug: slug.split('/'),
 *     }))
 *   }
 */
export function getAllDocSlugs(): string[] {
  const fileSlugs = walkMdxFiles(DOCS_CONTENT_DIR, DOCS_CONTENT_DIR)
  return fileSlugs.filter((slug) => findDocsBySlug(slug) !== undefined)
}