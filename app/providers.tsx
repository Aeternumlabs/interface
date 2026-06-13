/**
 * app/providers.tsx
 *
 * Client-side provider tree — mounted once from app/layout.tsx.
 *
 *   WagmiProvider        — wallet + chain state (lib/wagmi.ts)
 *   QueryClientProvider  — TanStack Query (wagmi reads + useEthPrice, etc.)
 *   RainbowKitProvider   — connect / account modals
 *
 * RainbowKit accent vs chart color:
 *   Figma uses muted violet only for the balance chart line.
 *   Wallet chrome (Connect wallet, modals) is metallic grey + dim white.
 *   accentColor below matches the pill buttons — not the chart purple.
 *   Chart accent: set via --chart-1 in globals.css (hsl 263 65% 62%).
 *
 * Toaster (Sonner) lives in app/layout.tsx outside RainbowKit so toasts are
 * not trapped in the modal z-index stack. Theme is fixed to dark via layout.
 */

'use client'

import { useState, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, queryClient } from '@/lib/wagmi'

import '@rainbow-me/rainbowkit/styles.css'

// --- Figma palette (always-dark) ---
const FIGMA = {
  background:     '#050505',
  card:           '#111111',
  button:         '#1a1a1a',
  border:         '#222222',
  foreground:     '#e8e8e8',
  muted:          '#6b6b6b',
  /** Chart line only */
  chartViolet:    'hsl(263, 65%, 62%)',
} as const

const aeternumTheme = darkTheme({
  accentColor:            FIGMA.foreground,
  accentColorForeground:  FIGMA.background,
  borderRadius:           'large',
  fontStack:              'system',
  overlayBlur:            'small',
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Fresh client instance avoids sharing cache with SSR in dev hot reload.
  const [client] = useState(() => queryClient)

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider
          theme={aeternumTheme}
          modalSize="compact"
          appInfo={{
            appName: 'Aeternum',
            learnMoreUrl: 'https://www.aeternumvault.xyz',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
