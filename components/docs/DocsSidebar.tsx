'use client'

/**
 * components/docs/DocsSidebar.tsx
 *
 * Left navigation column for the /docs route — desktop only.
 * Hidden on mobile (lg:flex breakpoint matches app/vault Sidebar.tsx).
 *
 * Active state:
 *   Derived from usePathname() — the slug is extracted by stripping
 *   the '/docs/' prefix and compared against each item's slug field.
 *
 * Styling:
 *   Intentionally mirrors the vault Sidebar.tsx + SidebarNavItem.tsx
 *   conventions so both sidebars feel like one coherent system:
 *     active  → bg-accent/70 text-foreground
 *     hover   → bg-accent/50 text-foreground
 *     default → text-muted-foreground
 *   Separators between sections use the same Separator + my-3 bg-border/40
 *   pattern as the vault sidebar.
 *
 * Badges:
 *   'new'         → small green pill (matching --price-up token)
 *   'coming-soon' → small muted pill
 */

import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator }   from '@/components/ui/separator'
import { cn }          from '@/lib/utils'
import {
  docsNavSections,
  type DocsNavItem,
  type DocsNavSection,
} from '@/config/docs-nav'

// --- Root sidebar ---
export function DocsSidebar() {
  const pathname   = usePathname()
  // '/docs/architecture/keeper-network' → 'architecture/keeper-network'
  // '/docs'                             → ''
  const activeSlug = pathname.startsWith('/docs/')
    ? pathname.slice('/docs/'.length)
    : ''

  return (
    <aside
      aria-label="Documentation navigation"
      className={cn(
        // Layout — matches vault Sidebar.tsx dimensions exactly
        'hidden lg:flex flex-col',
        'w-60 shrink-0 h-full',
        // Border + background
        'border-r border-border/50',
        'bg-background',
        // Independent scroll from main content
        'overflow-y-auto',
      )}
    >
      <nav className="flex flex-col px-2 pt-4 pb-12">
        {docsNavSections.map((section, index) => (
          <div key={section.id}>
            {/* Separator between sections — matches vault Sidebar.tsx */}
            {index > 0 && (
              <Separator className="my-3 bg-border/40" />
            )}

            <NavSection section={section} activeSlug={activeSlug} />
          </div>
        ))}
      </nav>
    </aside>
  )
}

// --- Section group ---
interface NavSectionProps {
  section:    DocsNavSection
  activeSlug: string
}

function NavSection({ section, activeSlug }: NavSectionProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Section heading — matches SidebarNavGroup.tsx label style exactly */}
      <p className="select-none px-3 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
        {section.label}
      </p>

      {section.items.map((item) => (
        <NavItem
          key={item.slug}
          item={item}
          isActive={item.slug === activeSlug}
        />
      ))}
    </div>
  )
}

// --- Individual nav item ---
interface NavItemProps {
  item:     DocsNavItem
  isActive: boolean
}

function NavItem({ item, isActive }: NavItemProps) {
  return (
    <Link
      href={`/docs/${item.slug}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        // Base — matches SidebarNavItem.tsx itemBase string
        'flex items-center justify-between gap-2',
        'w-full rounded-md px-3 py-2',
        'text-sm transition-colors duration-150',
        'outline-none select-none',
        'focus-visible:ring-1 focus-visible:ring-ring',
        // Active / default — matches SidebarNavItem.tsx itemActive / itemDefault
        isActive
          ? 'bg-accent/70 text-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
      )}
    >
      <span className="truncate">{item.label}</span>

      {item.badge && <NavBadge badge={item.badge} />}
    </Link>
  )
}

// --- Badge pill ---
function NavBadge({ badge }: { badge: 'new' | 'coming-soon' }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-1.5 py-0.5',
        'text-[9px] font-semibold tracking-wide',
        badge === 'new'
          // --price-up: 142 71% 45%
          ? 'bg-[hsl(142_71%_45%/0.15)] text-[hsl(142_71%_58%)]'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {badge === 'new' ? 'New' : 'Soon'}
    </span>
  )
}
