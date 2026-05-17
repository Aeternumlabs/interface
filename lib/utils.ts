/**
 * lib/utils.ts
 *
 * Pure utility functions used across the entire app.
 * No React, no wagmi, no side effects — safe to import anywhere.
 *
 * Grouped into:
 *   1. cn()             — Tailwind classname merging
 *   2. Address utils    — truncation and validation
 *   3. ETH / USD        — wei conversion and formatting
 *   4. Time             — duration and timestamp formatting
 *   5. Countdown        — breakdown of seconds into days/hrs/mins/secs
 *   6. Price change     — sign and color helpers
 *   7. Vault            — derived state helpers
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatUnits, parseUnits, isAddress } from 'viem'
import type { CountdownBreakdown, VaultStatus, RecoveryConfig } from '@/types'

// 1. --- Classname merging ---

/**
 * Merges Tailwind class strings without conflicts.
 * Used in every component for conditional className logic.
 *
 * Example:
 *   cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// 2. --- Address utilities ---

/**
 * Truncates a full Ethereum address to the format shown in the header:
 *   0x328809Bc894f92807417D2dAD6b7C998c1aFdac6  →  0x3288...dAD6
 *
 * @param address   Full checksummed Ethereum address
 * @param prefixLen Characters to show after "0x" (default: 4)
 * @param suffixLen Characters to show at the end (default: 4)
 */
export function truncateAddress(
  address: string,
  prefixLen = 4,
  suffixLen = 4
): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 2 + prefixLen)}...${address.slice(-suffixLen)}`
}

/**
 * Returns true if the string is a valid Ethereum address (viem's isAddress).
 * Used in RegisterForm and UpdateBackupForm for inline validation.
 */
export function isValidAddress(value: string): boolean {
  return isAddress(value)
}

/**
 * Returns true if the address is the zero address.
 * The contract returns address(0) for backupAddress when not registered.
 */
export function isZeroAddress(address: string): boolean {
  return address === '0x0000000000000000000000000000000000000000'
}

// --- 3. ETH and USD formatting ---

/**
 * Converts a bigint wei value to a human-readable ETH string.
 *
 * Examples:
 *   weiToEth(10000000000000000n)  →  "0.01"
 *   weiToEth(2160000000000000000n) →  "2.16"
 *
 * @param wei        Raw wei value from the contract
 * @param decimals   Decimal places to show (default: 4)
 */
export function weiToEth(wei: bigint, decimals = 4): string {
  const eth = formatUnits(wei, 18)
  const parsed = parseFloat(eth)
  if (isNaN(parsed)) return '0.0000'
  return parsed.toFixed(decimals)
}

/**
 * Converts a bigint wei value to a plain number for chart rendering.
 * Recharts needs a number, not a string.
 */
export function weiToEthNumber(wei: bigint): number {
  return parseFloat(formatUnits(wei, 18))
}

/**
 * Converts an ETH string amount to wei bigint.
 * Used in form submissions before calling contract write functions.
 *
 * Example:
 *   ethToWei("0.5")  →  500000000000000000n
 */
export function ethToWei(eth: string): bigint {
  try {
    return parseUnits(eth, 18)
  } catch {
    return 0n
  }
}

/**
 * Formats a USD dollar amount with comma separators and 2 decimal places.
 *
 * Examples:
 *   formatUSD(22.16)   →  "$22.16"
 *   formatUSD(1234.5)  →  "$1,234.50"
 *   formatUSD(0)       →  "$0.00"
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
 * Formats an ETH amount with the ETH suffix.
 *
 * Examples:
 *   formatEth("0.01")  →  "0.01 ETH"
 *   formatEth("2.16")  →  "2.16 ETH"
 */
export function formatEth(ethString: string): string {
  return `${ethString} ETH`
}

/**
 * Converts wei to a USD display string in one call.
 * Used in BalanceDisplay where we always show "$22.16".
 *
 * @param wei       Raw wei balance from the contract
 * @param usdPrice  Current ETH/USD price from useEthPrice()
 */
export function weiToUSD(wei: bigint, usdPrice: number): string {
  const eth = parseFloat(formatUnits(wei, 18))
  return formatUSD(eth * usdPrice)
}

// 4. --- Time and duration formatting ---

/**
 * Converts a seconds duration (bigint from contract) to a human-readable string.
 * Used in UpdateConfigModal to display the configured inactivity period.
 *
 * Examples:
 *   formatDuration(31536000n)  →  "365 days"
 *   formatDuration(15552000n)  →  "180 days"
 *   formatDuration(604800n)    →  "7 days"
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
 * Formats a Unix timestamp (seconds) to a short readable date string.
 * Used in TransactionRow to show when each event occurred.
 *
 * Example:
 *   formatTimestamp(1746000000)  →  "Apr 30, 2025"
 */
export function formatTimestamp(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  }).format(new Date(unixSeconds * 1000))
}

/**
 * Formats a Unix timestamp to a short time string.
 * Used alongside formatTimestamp in the transaction list.
 *
 * Example:
 *   formatTime(1746000000)  →  "3:20 PM"
 */
export function formatTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(unixSeconds * 1000))
}

/**
 * Returns a relative time string for recent transactions.
 * Falls back to formatTimestamp for older ones.
 *
 * Examples:
 *   "2 minutes ago"
 *   "3 hours ago"
 *   "Apr 30, 2025"    ← for anything older than 7 days
 */
export function formatRelativeTime(unixSeconds: number): string {
  const now      = Date.now()
  const then     = unixSeconds * 1000
  const diffMs   = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHrs  = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffSecs < 60)  return 'Just now'
  if (diffMins < 60)  return `${diffMins}m ago`
  if (diffHrs < 24)   return `${diffHrs}h ago`
  if (diffDays < 7)   return `${diffDays}d ago`
  return formatTimestamp(unixSeconds)
}

// 5. --- Countdown breakdown ---

/**
 * Breaks a total seconds value into days / hours / minutes / seconds.
 * Used by useCountdown() to feed the four CountdownBox units:
 *   [256 DAYS] [7 HRS] [32 MINS] [22 SECS]
 *
 * Returns isExpired: true when secondsRemaining ≤ 0.
 */
export function buildCountdown(secondsRemaining: number): CountdownBreakdown {
  if (secondsRemaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const days    = Math.floor(secondsRemaining / 86400)
  const hours   = Math.floor((secondsRemaining % 86400) / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)
  const seconds = Math.floor(secondsRemaining % 60)

  return { days, hours, minutes, seconds, isExpired: false }
}

/**
 * Computes seconds remaining from a vault config's lastActivity and inactivityPeriod.
 * Returns 0 if the period has already elapsed.
 *
 * @param lastActivity      Unix timestamp in seconds (bigint from contract)
 * @param inactivityPeriod  Inactivity period in seconds (bigint from contract)
 */
export function secondsUntilRecovery(
  lastActivity: bigint,
  inactivityPeriod: bigint
): number {
  const deadline    = Number(lastActivity) + Number(inactivityPeriod)
  const nowSeconds  = Math.floor(Date.now() / 1000)
  const remaining   = deadline - nowSeconds
  return Math.max(0, remaining)
}

// 6. --- Price change helpers ---

/**
 * Formats a 24h price change percentage for display.
 * The PriceChange component uses this to decide the sign and value.
 *
 * Examples:
 *   formatPriceChange(-2.39)  →  "2.39%"   (component adds ▼ and red color)
 *   formatPriceChange(1.20)   →  "1.20%"   (component adds ▲ and green color)
 */
export function formatPriceChange(change: number): string {
  return `${Math.abs(change).toFixed(2)}%`
}

/**
 * Returns true if the price change is negative (shown in red in the design).
 */
export function isPriceDown(change: number): boolean {
  return change < 0
}

// 7. --- Vault state helpers ---

/**
 * Derives the VaultStatus from a RecoveryConfig returned by the contract.
 * Used in useVaultConfig() to attach a status field that components can
 * switch on without re-implementing the same boolean logic everywhere.
 *
 *   isActive   = true  →  'active'
 *   isAbandoned = true →  'abandoned'
 *   both false         →  'unregistered'
 */
export function deriveVaultStatus(config: RecoveryConfig): VaultStatus {
  if (config.isActive)    return 'active'
  if (config.isAbandoned) return 'abandoned'
  return 'unregistered'
}

/**
 * Returns true if the vault has a non-zero ETH balance.
 * Used to decide whether to show the withdraw button as enabled.
 */
export function hasBalance(config: RecoveryConfig): boolean {
  return config.balance > 0n
}

/**
 * Returns true if the vault has reached the maximum failed recovery attempts.
 * The contract's MAX_RECOVERY_ATTEMPTS is 3.
 */
export function isAtMaxAttempts(
  config: RecoveryConfig,
  maxAttempts: number
): boolean {
  return config.failedRecoveryAttempts >= maxAttempts
}