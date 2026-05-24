/**
 * app/layout.tsx
 *
 * Root layout for the entire app.
 *   - Fonts + always-dark class on <html>
 *   - Providers (wagmi, RainbowKit, TanStack Query)
 *   - Full-viewport flex shell for the vault dashboard
 *   - Sonner toasts (fixed dark theme)
 */

import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { siteConfig } from '@/config/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage }],
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('dark h-full', inter.variable, geistMono.variable)}
    >
      <body
        className={cn(
          'flex min-h-dvh flex-col overflow-hidden',
          'bg-background text-foreground antialiased',
        )}
      >
        <Providers>
          {/* flex-1 chain lets app/vault/layout fill the viewport below the header */}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
