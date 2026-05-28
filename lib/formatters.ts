/**
 * lib/formatters.ts
 *
 * Display formatting functions — everything that produces a string
 * intended for UI rendering.
 *
 * Nothing in this file does math for computation purposes.
 * Raw math and number conversion live in lib/utils.ts.
 *
 * Grouped into:
 * 1. ETH formatting     — wei to ETH display strings
 * 2. USD formatting     — numbers to dollar display strings
 * 3. Address formatting — truncation and display
 * 4. Duration formatting — seconds to human-readable period strings
 * 5. Timestamp formatting — unix timestamps to date/time strings
 * 6. Price change formatting — percentage display for Top assets card
 * 7. Transaction formatting — event type labels for TransactionRow
 */

import { formatUnits } from 'viem'
import { weiToEthNumber } from './utils'
import type { TransactionType } from '@/types'

// 1. --- ETH formatting ---

/**
 * Converts a wei bigint to a formatted ETH string with a configurable
 * number of decimal places.
 *
 * Examples:
 * formatWeiToEth(10000000000000000n)        →  "0.0100"
 * formatWeiToEth(2160000000000000000n)      →  "2.1600"
 * formatWeiToEth(10000000000000000n, 2)     →  "0.01"
 *
 * @param wei       Raw wei value from the contract
 * @param decimals  Decimal places in the output string (default 4)
 */
export function formatWeiToEth(wei: bigint, decimals = 4): string {
  const eth = parseFloat(formatUnits(wei, 18))
  if (isNaN(eth)) return `0.${'0'.repeat(decimals)}`
  return eth.toFixed(decimals)
}

/**
 * Formats a wei bigint as a full ETH display string with the ETH suffix.
 * Used in BalanceDisplay, WithdrawModal, and TransactionRow.
 *
 * Examples:
 * formatEthDisplay(10000000000000000n)   →  "0.01 ETH"
 * formatEthDisplay(2160000000000000000n) →  "2.16 ETH"
 *
 * @param wei       Raw wei value
 * @param decimals  Decimal places (default 4)
 */
export function formatEthDisplay(wei: bigint, decimals = 4): string {
  return `${formatWeiToEth(wei, decimals)} ETH`
}

/**
 * Formats a plain ETH number string (not wei) with the ETH suffix.
 * Used after ethToWei round-trip or when amount is already in ETH.
 *
 * Example:
 * formatEthString("0.5")  →  "0.5 ETH"
 */
export function formatEthString(ethAmount: string): string {
  return `${ethAmount} ETH`
}

// 2. --- USD formatting ---

/**
 * Formats a number as a USD currency string with comma separators.
 * Used in BalanceDisplay for the primary "$22.16" value.
 *
 * Examples:
 * formatUSD(22.16)    →  "$22.16"
 * formatUSD(1234.5)   →  "$1,234.50"
 * formatUSD(0)        →  "$0.00"
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Converts a wei balance directly to a USD display string in one call.
 * Used in BalanceDisplay where we need "$22.16" from the raw contract balance.
 *
 * @param wei       Raw wei balance from the contract
 * @param usdPrice  Current ETH/USD price from useEthPrice()
 */
export function formatWeiToUSD(wei: bigint, usdPrice: number): string {
  const eth = weiToEthNumber(wei)
  return formatUSD(eth * usdPrice)
}

/**
 * Converts an ETH number to a USD display string.
 * Used in chart tooltips where the value is already in ETH (not wei).
 *
 * @param ethAmount  ETH value as a number
 * @param usdPrice   Current ETH/USD price
 */
export function formatEthNumberToUSD(ethAmount: number, usdPrice: number): string {
  return formatUSD(ethAmount * usdPrice)
}

// 3. --- Address formatting ---

/**
 * Formats a full Ethereum address for display in the Header wallet button:
 * 0x328809Bc894f92807417D2dAD6b7C998c1aFdac6  →  0x3288...dAD6
 *
 * This is a display-only formatter. For address validation use
 * isValidAddress() in lib/utils.ts.
 *
 * @param address   Full Ethereum address
 * @param prefixLen Characters after "0x" to show (default 4)
 * @param suffixLen Characters at the end to show (default 4)
 */
export function formatAddress(
  address: string,
  prefixLen = 4,
  suffixLen = 4
): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 2 + prefixLen)}...${address.slice(-suffixLen)}`
}

// 4. --- Duration formatting ---

/**
 * Converts a seconds duration (bigint from the contract) to a human-readable
 * period string. Used in UpdateConfigModal to display the stored inactivity period.
 *
 * Examples:
 * formatDuration(15552000n)  →  "180 days"
 * formatDuration(31536000n)  →  "365 days"
 * formatDuration(604800n)    →  "7 days"
 * formatDuration(3600n)      →  "1 hour"
 * formatDuration(120n)       →  "2 minutes"
 */
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

/**
 * Converts a number of days to a seconds bigint.
 * Used in RegisterForm and UpdatePeriodForm when converting the
 * slider/input value (days) into the seconds value the contract expects.
 *
 * Example:
 * daysToSeconds(180)  →  15552000n
 */
export function daysToSeconds(days: number): bigint {
  return BigInt(days * 86400)
}

/**
 * Converts a seconds bigint to a number of days.
 * Used to initialise the PeriodSelector slider from the stored contract value.
 *
 * Example:
 * secondsToDays(15552000n)  →  180
 */
export function secondsToDays(seconds: bigint): number {
  return Math.floor(Number(seconds) / 86400)
}

/**
 * Converts a number of minutes to a seconds bigint.
 * Used for ultra-short testnet evaluation cycles.
 */
export function minutesToSeconds(minutes: number): bigint {
  return BigInt(minutes * 60)
}

/**
 * Converts a seconds bigint to a number of minutes.
 */
export function secondsToMinutes(seconds: bigint): number {
  return Math.floor(Number(seconds) / 60)
}


// 5. --- Timestamp formatting ---

/**
 * Formats a Unix timestamp (seconds) as a short date string.
 * Used in TransactionRow alongside formatRelativeTime for older events.
 *
 * Example:
 * formatDate(1746000000)  →  "Apr 30, 2025"
 */
export function formatDate(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  }).format(new Date(unixSeconds * 1000))
}

/**
 * Formats a Unix timestamp to a short time string.
 * Shown alongside formatDate in the transaction list.
 *
 * Example:
 * formatTime(1746000000)  →  "3:20 PM"
 */
export function formatTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(unixSeconds * 1000))
}

/**
 * Formats a Unix timestamp as a relative time string for recent transactions,
 * falling back to formatDate for anything older than 7 days.
 *
 * Examples:
 * "Just now"       — within the last minute
 * "5m ago"         — within the last hour
 * "3h ago"         — within the last day
 * "2d ago"         — within the last 7 days
 * "Apr 30, 2025"   — older than 7 days
 */
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

/**
 * Formats a 24h price change percentage as an absolute value string.
 * The PriceChange component adds the ▼ or ▲ arrow and applies red/green color.
 *
 * Examples:
 * formatPriceChange(-2.39)  →  "2.39%"
 * formatPriceChange(1.2)    →  "1.20%"
 * formatPriceChange(0)      →  "0.00%"
 */
export function formatPriceChange(change: number): string {
  return `${Math.abs(change).toFixed(2)}%`
}

// 7. --- Transaction type formatting ---

/**
 * Maps a TransactionType to the human-readable label shown in TransactionRow.
 * Keeps the label logic in one place rather than scattered across components.
 *
 * Examples:
 * formatTransactionLabel('deposited')         →  "Deposited"
 * formatTransactionLabel('recoveryExecuted')  →  "Recovery executed"
 * formatTransactionLabel('backupUpdated')     →  "Backup address updated"
 */
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