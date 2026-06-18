/**
 * lib/wagmi.ts
 *
 * wagmi v2 configuration.
 * Wires together:
 *   - Supported chains (Sepolia for MVP)
 *   - RainbowKit connectors (injected, WalletConnect, Coinbase)
 *   - Alchemy HTTP transport for reliable RPC
 *   - TanStack Query client consumed by both wagmi and useEthPrice
 *
 * Imported once in app/providers.tsx and never elsewhere.
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { QueryClient } from '@tanstack/react-query'
import { http } from 'viem'

// --- Environment variables ---
//
// Required in .env.local:
//   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID  — from cloud.walletconnect.com
//   NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC_URL   — from dashboard.alchemy.com
//
// WalletConnect project ID is required even if you only use injected wallets.
// Without it RainbowKit throws on mount.

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!walletConnectProjectId) {
  throw new Error(
    '[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set.\n' +
    'Get one free at https://cloud.walletconnect.com and add it to .env.local'
  )
}

const alchemySepoliaRpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC_URL

// --- wagmi config ---
//
// getDefaultConfig() from RainbowKit handles:
//   - Injected wallets    (MetaMask, Rabby, Brave, etc.)
//   - WalletConnect v2    (mobile wallets via QR code)
//   - Coinbase Wallet     (smart wallet support)
//
// Transport: Alchemy for Sepolia if env var is set, otherwise public RPC.
// Public RPC is fine for Sepolia testing but rate-limited for production.

export const wagmiConfig = getDefaultConfig({
  appName:     'Aeternum',
  appDescription:
    'A non-custodial, automated inheritance protocol for Ethereum assets.',
  appUrl:      'https://www.aeternumvault.xyz',
  appIcon:     'https://www.aeternumvault.xyz/logo.png',

  projectId: walletConnectProjectId,

  chains: [sepolia],

  transports: {
    [sepolia.id]: alchemySepoliaRpcUrl
      ? http(alchemySepoliaRpcUrl)
      : http(),     // public RPC fallback — acceptable for Sepolia MVP
  },

  // Server-side rendering: false keeps wagmi fully client-side.
  // Required because wallet state cannot be serialised on the server.
  ssr: false,
})

// --- TanStack Query client ---
//
// Shared across wagmi and any other useQuery calls in the app (e.g. useEthPrice).
// Mounted once in app/providers.tsx via <QueryClientProvider>.
//
// staleTime: wagmi contract reads are considered fresh for 4 seconds.
//   This avoids redundant RPC calls when multiple components read the same
//   contract function (e.g. useIsRegistered + useVaultConfig both fetch
//   the same wallet's config on mount).
//
// gcTime: unused cache entries are garbage collected after 5 minutes.
//
// retry: failed contract reads retry once with a 1 second delay.
//   Sepolia public RPC can occasionally time out under load.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           4_000,
      gcTime:              5 * 60 * 1000,
      retry:               1,
      retryDelay:          1_000,
      refetchOnWindowFocus: false,
    },
  },
})