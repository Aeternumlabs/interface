'use client'

/**
 * components/common/WalletButton.tsx
 *
 * Wallet connection button rendered via RainbowKit's ConnectButton.Custom.
 * Fully controls its own styling so it matches the Figma design exactly —
 * no RainbowKit default chrome leaks through.
 *
 * Three visual states:
 *
 *   State 1 — Not mounted / loading
 *     Invisible placeholder preserving layout space.
 *
 *   State 2 — Not connected
 *     Pill button: "Connect wallet"
 *     Clicking opens RainbowKit's wallet selection modal.
 *
 *   State 3 — Connected, wrong network
 *     Pill button: "Wrong network" (amber tint)
 *     Clicking opens RainbowKit's network switcher.
 *     Only Sepolia is supported in v1.
 *
 *   State 4 — Connected, correct network
 *     Pill button: truncated address e.g. "0x3288...dAD6"
 *     Clicking opens RainbowKit's account modal (disconnect, copy, explorer).
 *
 * Used in:
 *   Header.tsx — top right on every screen
 */

import Image              from 'next/image'
import { ConnectButton }  from '@rainbow-me/rainbowkit'
import { cn }             from '@/lib/utils'
import { truncateAddress } from '@/lib/utils'

// --- Shared pill class ---

const pillBase = [
  // Shape
  'inline-flex items-center justify-center',
  'rounded-full',
  'px-5 py-2',
  // Typography
  'text-sm font-medium tracking-wide',
  'whitespace-nowrap',
  // Border + colour — metallic dark, slightly brighter outline
  'border border-foreground/10',
  'bg-secondary',
  'text-foreground/90',
  // Interaction
  'cursor-pointer select-none',
  'transition-colors duration-150',
  'hover:bg-accent hover:text-foreground hover:border-foreground/20',
  'active:scale-[0.98]',
  // Focus
  'outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
  'focus-visible:ring-offset-background',
].join(' ')

// --- Component ---

interface WalletButtonProps {
  className?: string
}

export function WalletButton({ className }: WalletButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        // --- Not yet hydrated
        // Render an invisible placeholder of the same width so layout does
        // not shift when the component hydrates on the client.
        if (!mounted) {
          return (
            <div
              aria-hidden
              className={cn(
                'inline-flex rounded-full px-5 py-2 text-sm',
                'opacity-0 pointer-events-none select-none',
                'border border-foreground/10 bg-secondary',
                className,
              )}
            >
              Connect wallet
            </div>
          )
        }

        const connected = !!account && !!chain

        // --- Not connected
        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className={cn(pillBase, className)}
            >
              Connect wallet
            </button>
          )
        }

        // --- Wrong network
        // User is connected but on a chain we don't support (not Sepolia).
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              className={cn(
                pillBase,
                // Amber tint to signal the problem without being alarming
                'border-amber-800/60 bg-amber-950/40 text-amber-400',
                'hover:bg-amber-900/40 hover:border-amber-700/60',
                className,
              )}
            >
              Wrong network
            </button>
          )
        }

        // --- Connected, correct network
        // Shows the truncated wallet address.
        // Clicking opens RainbowKit's account modal (disconnect, copy, etc.)
        return (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'hidden md:inline-flex items-center justify-center',
                'size-10 rounded-full bg-muted/60 overflow-hidden',
              )}
              aria-hidden="true"
            >
              <Image
                src="/assets/ethereum.png"
                alt="Ethereum logo"
                width={26}
                height={26}
                className="object-contain select-none"
                priority
              />
            </div>
            <button
              onClick={openAccountModal}
              type="button"
              className={cn(pillBase, 'font-mono', className)}
              title={account.address}
            >
              {truncateAddress(account.address)}
            </button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
