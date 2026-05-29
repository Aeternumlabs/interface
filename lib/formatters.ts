/**
 * lib/formatters.ts
 *
 * Display formatting functions — everything that produces a string
 * intended for UI rendering.
 */

import { formatUnits } from 'viem'
import { weiToEthNumber } from './utils'
import type { TransactionType } from '@/types'

// 1. --- ETH formatting ---
export function formatWeiToEth(wei: bigint, decimals = 4): string {
  const eth = parseFloat(formatUnits(wei, 18))
  if (isNaN(eth)) return `0.${'0'.repeat(decimals)}`
  return eth.toFixed(decimals)
}

export function formatEthDisplay(wei: bigint, decimals = 4): string {
  return `${formatWeiToEth(wei, decimals)} ETH`
}

export function formatEthString(ethAmount: string): string {
  return `${ethAmount} ETH`
}

// 2. --- USD formatting ---
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatWeiToUSD(wei: bigint, usdPrice: number): string {
  const eth = weiToEthNumber(wei)
  return formatUSD(eth * usdPrice)
}

export function formatEthNumberToUSD(ethAmount: number, usdPrice: number): string {
  return formatUSD(ethAmount * usdPrice)
}

// 3. --- Address formatting ---
export function formatAddress(
  address: string,
  prefixLen = 4,
  suffixLen = 4
): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 2 + prefixLen)}...${address.slice(-suffixLen)}`
}

// 4. --- Duration formatting ---
export function formatDuration(seconds: bigint): string {
  const secs = Number(seconds)

  const days    = Math.floor(secs / 86400)
  const hours   = Math.floor((secs % 86400) / 3600)
  const minutes = Math.floor((secs % 3600) / 60)

  if (days > 0)    return `${days} day${days === 1 ? '' : 's'}`
  if (hours > 0)   return `${hours} hour${hours === 1 ? '' : 's'}`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  return `${secs} second${secs === 1 ? '' : 's'}`
}

export function daysToSeconds(days: number): bigint {
  return BigInt(days * 86400)
}

export function secondsToDays(seconds: bigint): number {
  return Math.floor(Number(seconds) / 86400)
}

export function hoursToSeconds(hours: number): bigint {
  return BigInt(hours * 3600)
}

export function secondsToHours(seconds: bigint): number {
  return Math.floor(Number(seconds) / 3600)
}

export function minutesToSeconds(minutes: number): bigint {
  return BigInt(minutes * 60)
}

export function secondsToMinutes(seconds: bigint): number {
  return Math.floor(Number(seconds) / 60)
}

// 5. --- Timestamp formatting ---
export function formatDate(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  }).format(new Date(unixSeconds * 1000))
}

export function formatTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(unixSeconds * 1000))
}

export function formatRelativeTime(unixSeconds: number): string {
  const diffMs   = Date.now() - unixSeconds * 1000
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHrs  = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffSecs < 60)  return 'Just now'
  if (diffMins < 60)  return `${diffMins}m ago`
  if (diffHrs  < 24)  return `${diffHrs}h ago`
  if (diffDays <  7)  return `${diffDays}d ago`
  return formatDate(unixSeconds)
}

// 6. --- Price change formatting ---
export function formatPriceChange(change: number): string {
  return `${Math.abs(change).toFixed(2)}%`
}

// 7. --- Transaction type formatting ---
export function formatTransactionLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    registered:       'Vault registered',
    deposited:        'Deposited',
    sent:             'Sent',
    withdrawn:        'Withdrawn',
    pinged:           'Timer reset',
    backupUpdated:    'Backup address updated',
    periodUpdated:    'Inactivity period updated',
    recoveryExecuted: 'Recovery executed',
    recoveryFailed:   'Recovery failed',
    recoveryCancelled:'Recovery cancelled',
    recoveryAbandoned:'Vault abandoned',
  }
  return labels[type] ?? type
}