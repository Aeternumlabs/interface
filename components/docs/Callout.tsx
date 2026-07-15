/**
 * components/docs/Callout.tsx
 *
 * Highlighted alert block for surfacing important information in MDX content.
 *
 * Five types — each maps to a distinct visual treatment using
 * the existing globals.css design tokens:
 *
 *   info     → blue     (generic information)
 *   warning  → amber    (caution — read before proceeding)
 *   danger   → red      (--destructive token — critical, e.g. irreversible actions)
 *   success  → green    (--price-up token — confirmations, best practices)
 *   tip      → purple   (--chart-1 token — helpful suggestions)
 *
 * Usage in .mdx files:
 *   <Callout type="warning" title="Testnet only">
 *     The 5-minute timer is only available on Sepolia testnet.
 *     Mainnet minimum is 180 days.
 *   </Callout>
 *
 * Server component — purely presentational, no client state needed.
 */

import type { ReactNode } from 'react'
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Types ---
export type CalloutType = 'info' | 'warning' | 'danger' | 'success' | 'tip'

export interface CalloutProps {
  /** Visual variant — controls colour, icon, and default title */
  type?: CalloutType
  /** Overrides the default title for this type */
  title?: string
  children: ReactNode
}

// --- Per-type configuration ---
interface CalloutConfig {
  icon:           LucideIcon
  defaultTitle:   string
  containerClass: string
  iconClass:      string
  titleClass:     string
}

const CALLOUT_CONFIG: Record<CalloutType, CalloutConfig> = {
  info: {
    icon:           Info,
    defaultTitle:   'Info',
    // Standard Tailwind blue — not a custom token
    containerClass: 'bg-blue-500/8 border-blue-500/20',
    iconClass:      'text-blue-400',
    titleClass:     'text-blue-300',
  },
  warning: {
    icon:           AlertTriangle,
    defaultTitle:   'Warning',
    containerClass: 'bg-amber-500/8 border-amber-500/20',
    iconClass:      'text-amber-400',
    titleClass:     'text-amber-300',
  },
  danger: {
    icon:           AlertOctagon,
    defaultTitle:   'Danger',
    // Uses --destructive: 0 72% 51%
    containerClass: 'bg-destructive/10 border-destructive/20',
    iconClass:      'text-destructive',
    titleClass:     'text-destructive',
  },
  success: {
    icon:           CheckCircle2,
    defaultTitle:   'Note',
    // Uses --price-up: 142 71% 45%
    containerClass: 'bg-[hsl(142_71%_45%/0.1)] border-[hsl(142_71%_45%/0.2)]',
    iconClass:      'text-[hsl(142_71%_55%)]',
    titleClass:     'text-[hsl(142_71%_58%)]',
  },
  tip: {
    icon:           Lightbulb,
    defaultTitle:   'Tip',
    // Uses --chart-1: 263 65% 62%
    containerClass: 'bg-[hsl(263_65%_62%/0.1)] border-[hsl(263_65%_62%/0.2)]',
    iconClass:      'text-[hsl(263_65%_70%)]',
    titleClass:     'text-[hsl(263_65%_75%)]',
  },
}

// --- Component ---
export function Callout({ type = 'info', title, children }: CalloutProps) {
  const config       = CALLOUT_CONFIG[type]
  const Icon         = config.icon
  const displayTitle = title ?? config.defaultTitle

  return (
    <div
      role="note"
      className={cn(
        'my-6 rounded-lg border p-4',
        config.containerClass,
      )}
    >
      <div className="flex items-start gap-3">

        {/* Icon */}
        <Icon
          aria-hidden="true"
          className={cn('mt-0.5 size-4 shrink-0', config.iconClass)}
        />

        {/* Content */}
        <div className="min-w-0 flex-1">

          {/* Title */}
          <p className={cn('text-sm font-semibold leading-snug', config.titleClass)}>
            {displayTitle}
          </p>

          {/* Body — override child paragraph margins so content sits flush */}
          <div
            className={cn(
              'mt-1.5 text-sm leading-relaxed text-foreground/80',
              // Remove top margin on the first child paragraph injected by MDX
              '[&>p:first-child]:mt-0',
              '[&>p]:mt-2',
            )}
          >
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}
