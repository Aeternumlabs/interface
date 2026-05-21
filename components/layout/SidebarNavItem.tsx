'use client'

/**
 * components/layout/SidebarNavItem.tsx
 *
 * Single navigation row inside the sidebar and mobile drawer.
 * Handles all three nav item kinds defined in config/site.ts:
 *
 *   route    → Next.js <Link> — navigates to an internal page
 *   modal    → <button>  — calls onOpenModal to open a modal overlay
 *   external → <a>       — opens an external URL in a new tab
 *
 * Active state:
 *   Route items are active when pathname matches href.
 *   Modal items are active when the matching modal is open.
 *   External items are never shown as active.
 *
 * Design (from Figma):
 *   - Icon (16px) + label in a single row, ~36px tall
 *   - Default: muted text, transparent background
 *   - Hover:   slightly lighter background, foreground text
 *   - Active:  accent background, full-opacity foreground text
 */

import Link             from 'next/link'
import { usePathname }  from 'next/navigation'
import {
  Home, Activity, Settings2,
  ArrowUpFromLine, X, Globe, FileText,
  type LucideIcon,
}                       from 'lucide-react'
import { cn }           from '@/lib/utils'
import type { NavItem } from '@/config/site'
import type { ActiveModal } from '@/types'

// --- Icon map ---
//
// Maps the string icon names defined in config/site.ts to Lucide components.
// Add entries here when new nav items are introduced.

const ICON_MAP: Record<string, LucideIcon> = {
  vault:            Home,
  activity:         Activity,
  settings:         Settings2,
  arrowUpFromLine:  ArrowUpFromLine,
  x:               X,
  globe:            Globe,
  fileText:         FileText,
}

// --- Shared item classes ---

const itemBase = [
  'flex items-center gap-3',
  'w-full px-3 py-2 rounded-md',
  'text-sm',
  'transition-colors duration-150',
  'outline-none',
  'select-none cursor-pointer',
].join(' ')

const itemDefault = 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
const itemActive  = 'text-foreground bg-accent/70'

// --- Types ---

interface SidebarNavItemProps {
  item:          NavItem
  /** The currently open modal — used to highlight active modal items. */
  activeModal?:  ActiveModal
  onOpenModal?:  (modal: NonNullable<ActiveModal>) => void
  /** Called after navigation/action so the mobile drawer can close itself. */
  onNavigate?:  () => void
}

// --- Component ---

export function SidebarNavItem({
  item,
  activeModal,
  onOpenModal,
  onNavigate,
}: SidebarNavItemProps) {
  const pathname   = usePathname()
  const Icon       = ICON_MAP[item.icon] ?? Home

  // --- Determine active state
  const isActive = (() => {
    if (item.kind === 'route') {
      return pathname === item.href || pathname.startsWith(item.href + '/')
    }
    if (item.kind === 'modal') {
      return activeModal === item.modal
    }
    return false
  })()

  const classes = cn(itemBase, isActive ? itemActive : itemDefault)

  // --- Route item
  if (item.kind === 'route') {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(classes, 'focus-visible:ring-1 focus-visible:ring-ring')}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
        <span>{item.label}</span>
      </Link>
    )
  }

  // --- Modal item
  if (item.kind === 'modal') {
    return (
      <button
        type="button"
        onClick={() => {
          onOpenModal?.(item.modal)
          onNavigate?.()
        }}
        className={cn(classes, 'focus-visible:ring-1 focus-visible:ring-ring')}
      >
        <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
        <span>{item.label}</span>
      </button>
    )
  }

  // --- External link item
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={cn(classes, 'focus-visible:ring-1 focus-visible:ring-ring')}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
      <span>{item.label}</span>
    </a>
  )
}
