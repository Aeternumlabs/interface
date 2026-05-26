'use client'

/**
 * components/common/AeternumLogo.tsx
 *
 * Renders the Aeternum logo mark alongside the wordmark.
 * Logo image is loaded from public/logo.png.
 *
 * Used in:
 *   Header.tsx  — top left on both desktop and mobile
 *   Sidebar.tsx — top of the left nav column on desktop
 *
 * Props:
 *   size — controls icon dimensions and text scale
 *     'sm'  — 20px icon, text-sm  (sidebar compact)
 *     'md'  — 26px icon, text-base (header default)
 *     'lg'  — 32px icon, text-lg   (future use)
 *
 *   showWordmark — set false to render the icon only
 */

import Image   from 'next/image'
import Link    from 'next/link'
import { cn }  from '@/lib/utils'

// --- Types ---

type LogoSize = 'sm' | 'md' | 'lg'

interface AeternumLogoProps {
  size?:         LogoSize
  showWordmark?: boolean
  className?:    string
  /** When true the logo links to /vault (default). Set false in nav contexts
   *  where the surrounding element already handles navigation. */
  asLink?:       boolean
}

// --- Size map ---

const SIZE: Record<LogoSize, { icon: number; text: string; gap: string }> = {
  sm: { icon: 20, text: 'text-sm',   gap: 'gap-1'   },
  md: { icon: 26, text: 'text-base', gap: 'gap-1' },
  lg: { icon: 32, text: 'text-lg',   gap: 'gap-1'   },
}

// --- Component ---

export function AeternumLogo({
  size         = 'md',
  showWordmark = true,
  className,
  asLink       = true,
}: AeternumLogoProps) {
  const { icon, text, gap } = SIZE[size]

  const content = (
    <span
      className={cn(
        'flex items-center',
        gap,
        className,
      )}
    >
      {/* Logo mark from public/logo.png */}
      <Image
        src="/logo.png"
        alt="Aeternum"
        width={icon}
        height={icon}
        className="shrink-0 select-none"
        priority
      />

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={cn(
            'font-semibold tracking-wide text-foreground select-none',
            text,
          )}
        >
          Aeternum
        </span>
      )}
    </span>
  )

  if (asLink) {
    return (
      <Link
        href="/vault"
        className="outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
        aria-label="Aeternum home"
      >
        {content}
      </Link>
    )
  }

  return content
}
