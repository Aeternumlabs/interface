'use client'

/**
 * components/common/AddressDisplay.tsx
 *
 * Displays a truncated Ethereum address with optional copy-to-clipboard
 * and Etherscan external link actions.
 *
 * Used in:
 *   UpdateConfigModal  — shows current backup address
 *   TransactionRow     — shows recipient/backup on sent/recovery events
 *
 * Props:
 *   address       — full 0x address to display and link
 *   prefixLen     — chars to show after "0x" (default 4)
 *   suffixLen     — chars to show at end (default 4)
 *   showCopy      — show clipboard copy button (default true)
 *   showExplorer  — show Etherscan external link (default true)
 *   className     — forwarded to the wrapper element
 *
 * Copy feedback:
 *   The copy icon briefly changes to a checkmark for 2 seconds,
 *   then returns to the clipboard icon — no toast needed for this
 *   low-stakes interaction.
 */

import { useState, useCallback } from 'react'
import { useChainId }            from 'wagmi'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { cn }                    from '@/lib/utils'
import { formatAddress }         from '@/lib/formatters'
import { getTxUrl, getAddressUrl } from '@/config/chains'

// --- Types ---

interface AddressDisplayProps {
  address:       `0x${string}` | string
  prefixLen?:    number
  suffixLen?:    number
  showCopy?:     boolean
  showExplorer?: boolean
  /** When true, the Etherscan link is for a tx hash rather than an address */
  isTxHash?:     boolean
  className?:    string
}

// --- Component ---

export function AddressDisplay({
  address,
  prefixLen    = 4,
  suffixLen    = 4,
  showCopy     = true,
  showExplorer = true,
  isTxHash     = false,
  className,
}: AddressDisplayProps) {
  const chainId = useChainId()
  const [copied, setCopied] = useState(false)

  // --- Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2_000)
    } catch {
      // Clipboard access denied — silently ignore.
      // The address is already visible so the user can copy manually.
    }
  }, [address])

  // --- Etherscan URL
  const explorerUrl = isTxHash
    ? getTxUrl(address, chainId)
    : getAddressUrl(address, chainId)

  // --- Truncated display value
  const display = formatAddress(address, prefixLen, suffixLen)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        className,
      )}
    >
      {/* Address text — monospace so character widths are consistent */}
      <span
        className="font-mono text-sm text-foreground/80 tracking-tight"
        title={address}
      >
        {display}
      </span>

      {/* Copy button */}
      {showCopy && (
        <button
          onClick={handleCopy}
          type="button"
          aria-label={copied ? 'Copied' : 'Copy address'}
          className={cn(
            'inline-flex items-center justify-center',
            'rounded p-0.5',
            'text-muted-foreground',
            'transition-colors duration-150',
            'hover:text-foreground hover:bg-accent',
            'outline-none focus-visible:ring-1 focus-visible:ring-ring',
            copied && 'text-emerald-400 hover:text-emerald-400',
          )}
        >
          {copied
            ? <Check      className="size-3.5" strokeWidth={2.5} />
            : <Copy       className="size-3.5" />
          }
        </button>
      )}

      {/* Etherscan link */}
      {showExplorer && address && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on Etherscan"
          className={cn(
            'inline-flex items-center justify-center',
            'rounded p-0.5',
            'text-muted-foreground',
            'transition-colors duration-150',
            'hover:text-foreground hover:bg-accent',
            'outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </span>
  )
}
