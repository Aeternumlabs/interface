/**
 * components/vault/transactions/TransactionRow.tsx
 *
 * Renders a single contract event as a transaction history row.
 *
 * Layout:
 * [Icon]  [Label             ]  [± Amount  ]
 * [secondary address ]  [timestamp ]
 *
 * Supports all TransactionType values from types/vault.ts.
 * Amount colour: green for inflows (deposited), red for outflows (sent).
 * Timestamp: relative for recent events, date string for older ones.
 */

import { useChainId }              from 'wagmi'
import {
  ShieldPlus, ArrowDownLeft, ArrowUpRight,
  Wallet, RefreshCw, UserCog, Clock,
  ShieldCheck, ShieldX, X, AlertTriangle,
  type LucideIcon,
}                                  from 'lucide-react'
import { ETHAmount }               from '@/components/common/ETHAmount'
import { AddressDisplay }          from '@/components/common/AddressDisplay'
import { formatTransactionLabel }  from '@/lib/formatters'
import { formatRelativeTime }      from '@/lib/formatters'
import { getTxUrl }                from '@/config/chains'
import { cn }                      from '@/lib/utils'
import type { TransactionEvent, TransactionType } from '@/types'

// --- Type → visual config ---

interface TypeConfig {
  icon:       LucideIcon
  iconBg:     string
  iconColor:  string
  amountSign: '+' | '-' | ''
  amountColor: string
}

const TYPE_CONFIG: Record<TransactionType, TypeConfig> = {
  registered:        { icon: ShieldPlus,    iconBg: 'bg-blue-950/60',    iconColor: 'text-blue-400',    amountSign: '+', amountColor: 'text-emerald-400' },
  deposited:         { icon: ArrowDownLeft, iconBg: 'bg-emerald-950/60', iconColor: 'text-emerald-400', amountSign: '+', amountColor: 'text-emerald-400' },
  sent:              { icon: ArrowUpRight,  iconBg: 'bg-red-950/60',     iconColor: 'text-red-400',     amountSign: '-', amountColor: 'text-red-400' },
  withdrawn:         { icon: Wallet,        iconBg: 'bg-muted/60',       iconColor: 'text-foreground/70', amountSign: '-', amountColor: 'text-foreground/80' },
  pinged:            { icon: RefreshCw,     iconBg: 'bg-muted/60',       iconColor: 'text-muted-foreground', amountSign: '', amountColor: '' },
  backupUpdated:     { icon: UserCog,       iconBg: 'bg-blue-950/60',    iconColor: 'text-blue-400',    amountSign: '', amountColor: '' },
  periodUpdated:     { icon: Clock,         iconBg: 'bg-blue-950/60',    iconColor: 'text-blue-400',    amountSign: '', amountColor: '' },
  recoveryExecuted:  { icon: ShieldCheck,   iconBg: 'bg-emerald-950/60', iconColor: 'text-emerald-400', amountSign: '', amountColor: 'text-foreground/80' },
  recoveryFailed:    { icon: ShieldX,       iconBg: 'bg-red-950/60',     iconColor: 'text-red-400',     amountSign: '', amountColor: 'text-red-400/80' },
  recoveryCancelled: { icon: X,             iconBg: 'bg-muted/60',       iconColor: 'text-muted-foreground', amountSign: '+', amountColor: 'text-foreground/80' },
  recoveryAbandoned: { icon: AlertTriangle, iconBg: 'bg-amber-950/60',   iconColor: 'text-amber-400',   amountSign: '', amountColor: 'text-amber-400/80' },
}

// --- Types ---

interface TransactionRowProps {
  event:     TransactionEvent
  className?: string
}

// --- Component ---

export function TransactionRow({ event, className }: TransactionRowProps) {
  const chainId = useChainId()
  
  // Look up the configuration. Note: if your indexer returns uppercase strings 
  // (e.g., "DEPOSIT") you may need to map them to match TYPE_CONFIG keys here.
  const cfg = TYPE_CONFIG[event.type]

  // Safety fallback: If an unrecognized event type is passed, don't crash the app
  if (!cfg) {
    console.warn(`Missing TYPE_CONFIG for event type: ${event.type}`)
    return null
  }

  const Icon = cfg.icon

  // Extract the transaction hash from the Ponder ID (format: "hash-logIndex")
  // Fallback to "0x" just in case to prevent string errors
  const extractedHash = event.id ? event.id.split('-')[0] : '0x'
  const explorerUrl = getTxUrl(extractedHash, chainId)

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center justify-between gap-3',
        'py-3 px-1 rounded-md',
        'transition-colors duration-150',
        'hover:bg-accent/40',
        'group',
        className,
      )}
    >
      {/* Left: icon + label + optional address */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon bubble */}
        <div
          className={cn(
            'flex items-center justify-center',
            'size-8 rounded-full shrink-0',
            cfg.iconBg,
          )}
          aria-hidden
        >
          <Icon className={cn('size-3.5', cfg.iconColor)} strokeWidth={2} />
        </div>

        {/* Label + secondary */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium text-foreground truncate leading-none">
            {formatTransactionLabel(event.type)}
          </span>

          {/* Secondary: to/backup address if available */}
          {event.toAddress && (
            <AddressDisplay
              address={event.toAddress}
              showCopy={false}
              showExplorer={false}
              className="text-xs text-muted-foreground"
            />
          )}
        </div>
      </div>

      {/* Right: amount + timestamp */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {/* Amount */}
        {event.amount !== undefined && event.amount > 0n && (
          <span className={cn('text-sm font-medium tabular-nums', cfg.amountColor)}>
            {cfg.amountSign}
            <ETHAmount
              wei={event.amount}
              decimals={4}
              showSymbol
              className="font-mono"
            />
          </span>
        )}

        {/* Timestamp */}
        <span className="text-[11px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          {/* @ts-expect-error - Handling potential missing blockNumber depending on type definition */}
          {event.timestamp ? formatRelativeTime(event.timestamp) : event.blockNumber ? `#${event.blockNumber.toString()}` : ''}
        </span>
      </div>
    </a>
  )
}