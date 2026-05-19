/**
 * lib/utils.ts
 *
 * Pure utility functions used across the entire Aeternum app ecosystem.
 * This file contains zero side effects, no React context, and no wagmi bindings, 
 * making it completely safe to import into any client component, server hook, or utility file.
 *
 * This utility engine drives token formatting, blockchain numeric scaling, local time ticks, 
 * dynamic CSS class injections, and critical on-chain state machine classifications.
 *
 * Grouped into:
 *   1. Classname Merging      — Resolves Tailwind styling collisions via twMerge & clsx
 *   2. Address Utilities      — Handles hex validation, zero-address sentinels, and truncation
 *   3. ETH and USD Formatting — Manages bigint-to-float scaling and locale currency structures
 *   4. Time and Relative Dates— Formats timestamps, humanizes execution ranges, and localizes history
 *   5. Countdown Breakdown    — Breaks raw seconds variables into structural layout objects
 *   6. Price Change Colors    — Formats indicator signage and tailors token trends to design tokens
 *   7. Vault Derived State    — Decodes smart contract data blocks into clean runtime states
 *
 * Dependencies:
 *   - viem          (Core numeric conversion vectors and hexadecimal string testing tools)
 *   - clsx/twMerge  (Structural styling builders optimized for dark mode interfaces)
 *   - @/types       (System-wide types providing contract struct parity)
 *   - @/lib/constants (Central data constraints, token defaults, and cache schedules)
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatUnits, parseUnits, isAddress } from 'viem'
import { ETH_DISPLAY_DECIMALS, ZERO_ADDRESS } from './constants'
import type { CountdownBreakdown, VaultStatus, RecoveryConfig } from '@/types'

// 1. --- Classname Merging ---

/**
 * Merges conditional and static Tailwind CSS utility classes into a clean string.
 * Uses clsx for conditional object processing and twMerge to programmatically 
 * eliminate property overrides, which is critical for consistent UI layout overrides.
 *
 * @param inputs  An arbitrary list of string parameters, objects, arrays, or truthy flags
 * @returns       A clean, space-separated class selector string
 *
 * @example
 *   cn('px-4 py-2 text-white', isActive && 'bg-primary', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// 2. --- Address Utilities ---

/**
 * Formats a checksummed 40-character hex address into a compact layout for presentation.
 * Retains structural identity context by displaying explicit bookends separated by an ellipsis.
 *
 * @param address   The full 0x-prefixed hex string representing the wallet position
 * @param prefixLen The quantity of alphanumeric characters to expose after the '0x' tag
 * @param suffixLen The quantity of alphanumeric characters to expose at the trailing margin
 * @returns         The condensed representation string, or the fallback raw address if invalid
 *
 * @example
 *   truncateAddress('0x328809Bc894f92807417D2dAD6b7C998c1aFdac6') -> '0x3288...dAD6'
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
 * Evaluates whether an input string conforms to strict EIP-55 wallet validation layout boundaries.
 * Directly proxies viem's regex-tested validation suite to intercept malformed string vectors.
 *
 * @param value  The raw text variable processed from an interaction field input
 * @returns      True if the parameter is verified as an active hex structure address mapping
 */
export function isValidAddress(value: string): boolean {
  return isAddress(value)
}

/**
 * Assesses if an address strictly represents the standard EVM uninitialized address parameter.
 * Used to interpret unconfigured fallback fields returned from contract execution layers.
 *
 * @param address  The validated address hash to challenge against the sentinel block
 * @returns        True if the parameter matches the contract address zero layout constant
 */
export function isZeroAddress(address: string): boolean {
  return address.toLowerCase() === ZERO_ADDRESS.toLowerCase()
}

// 3. --- ETH and USD Formatting ---

/**
 * Scales an EVM native uint256 token allocation downwards into a human-readable layout.
 * Translates base atomic bigint factors into standard floating decimals.
 *
 * @param wei       The total 18-decimal base value retrieved directly from storage registers
 * @param decimals  The total fraction positions to preserve on the rendered display
 * @returns         A formatted text string, safe for general user dashboard elements
 *
 * @example
 *   weiToEth(10000000000000000n) -> '0.0100'
 */
export function weiToEth(wei: bigint, decimals = ETH_DISPLAY_DECIMALS): string {
  const eth = formatUnits(wei, 18)
  const parsed = parseFloat(eth)
  if (isNaN(parsed)) return '0.0000'
  return parsed.toFixed(decimals)
}

/**
 * Unpacks a native uint256 token balance into a JavaScript number format.
 * Essential when binding Web3 blockchain inputs into standard chart library plotting tracks.
 *
 * @param wei  The total atomic precision base token tracking unit
 * @returns    A native system floating-point data approximation for analytical graphing
 */
export function weiToEthNumber(wei: bigint): number {
  return parseFloat(formatUnits(wei, 18))
}

/**
 * Directs human token inputs upwards into standard 18-decimal bigint structures.
 * Intercepts invalid input structures during modal entry phases and falls back to a clean state.
 *
 * @param eth  The human-input string typed into interactive deposit or action fields
 * @returns    The safely converted 256-bit unsigned bigint parameter expected by smart contracts
 *
 * @example
 *   ethToWei('0.5') -> 500000000000000000n
 */
export function ethToWei(eth: string): bigint {
  try {
    return parseUnits(eth, 18)
  } catch {
    return 0n
  }
}

/**
 * Converses floating point numbers into standardized localized US Dollar string blocks.
 * Employs institutional localization constructors to force consistent separators.
 *
 * @param amount  The numerical evaluation computed via internal system market vectors
 * @returns       A clean representation complete with currency identifier styling strings
 *
 * @example
 *   formatUSD(1234.5) -> '$1,234.50'
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Appends standard protocol ticks behind computed transaction configurations.
 *
 * @param ethString  A text output parsed from internal tracking records
 * @returns          The combined string block for dashboard asset components
 */
export function formatEth(ethString: string): string {
  return `${ethString} ETH`
}

/**
 * Computes asset status against real-time Oracle inputs to provide an instantly parsed USD string.
 * Reduces components calculations by completing math on intermediate string conversions.
 *
 * @param wei       The direct balance metrics assigned inside on-chain tracking structures
 * @param usdPrice  The asset exchange price fetched by active platform queries
 * @returns         The fiat value display string format
 */
export function weiToUSD(wei: bigint, usdPrice: number): string {
  const eth = parseFloat(formatUnits(wei, 18))
  return formatUSD(eth * usdPrice)
}

// 4. --- Time and Relative Dates ---

/**
 * Converts a duration block into a contextually optimized unit designation string.
 * Automatically handles sizing scales to select the single most legible visual anchor.
 *
 * @param seconds  The duration boundary parameter configured inside system parameters
 * @returns        A descriptive time summary optimized for profile dashboard pages
 *
 * @example
 *   formatDuration(604800n) -> '7 days'
 */
export function formatDuration(seconds: bigint): string {
  const secs = Number(seconds)
  const days = Math.floor(secs / 86400)
  const hours = Math.floor((secs % 86400) / 3600)
  const minutes = Math.floor((secs % 3600) / 60)

  if (days > 0) return `${days} day${days === 1 ? '' : 's'}`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  return `${secs} second${secs === 1 ? '' : 's'}`
}

/**
 * Translates epoch measurements into standard visual calendar structures.
 *
 * @param unixSeconds  The numeric sequence indexing target system block records
 * @returns            A calendar string layout format
 *
 * @example
 *   formatTimestamp(1746000000) -> 'Apr 30, 2025'
 */
export function formatTimestamp(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(unixSeconds * 1000))
}

/**
 * Translates epoch measurements into short clock records.
 *
 * @param unixSeconds  The numeric target indexing active system blocks
 * @returns            A clock representation layout format
 *
 * @example
 *   formatTime(1746000000) -> '3:20 PM'
 */
export function formatTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(unixSeconds * 1000))
}

/**
 * Transforms classic timestamp points into relative contextual statements.
 * Cascades down through size benchmarks before dropping back onto standard date formats after a week.
 *
 * @param unixSeconds  The log timestamp captured during transaction indexing tasks
 * @returns            A relative string optimized for real-time operation feeds
 */
export function formatRelativeTime(unixSeconds: number): string {
  const now = Date.now()
  const then = unixSeconds * 1000
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHrs = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatTimestamp(unixSeconds)
}

// 5. --- Countdown Breakdown ---

/**
 * Segregates an unformatted runtime float pool into clean layout structures.
 * Feeds client timers to drive structural rendering boxes.
 *
 * @param secondsRemaining  The delta calculation isolating an active timestamp target
 * @returns                 A structural layout map containing a safety expiry evaluation parameter
 */
export function buildCountdown(secondsRemaining: number): CountdownBreakdown {
  if (secondsRemaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const days = Math.floor(secondsRemaining / 86400)
  const hours = Math.floor((secondsRemaining % 86400) / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)
  const seconds = Math.floor(secondsRemaining % 60)

  return { days, hours, minutes, seconds, isExpired: false }
}

/**
 * Aggregates vault configuration metrics against real-time local timestamps to approximate remaining horizons.
 * Returns a zero bound fallback position if the target timeframe has been exceeded.
 *
 * @param lastActivity      The immutable block index tracking historic user activity
 * @param inactivityPeriod  The safety horizon metric assigned to the protection target
 * @returns                 The absolute second scalar values remaining until vault invalidation
 */
export function secondsUntilRecovery(
  lastActivity: bigint,
  inactivityPeriod: bigint
): number {
  const deadline = Number(lastActivity) + Number(inactivityPeriod)
  const nowSeconds = Math.floor(Date.now() / 1000)
  const remaining = deadline - nowSeconds
  return remaining > 0 ? remaining : 0
}

// 6. --- Price Change Indicators ---

/**
 * Evaluates market pricing differentials to deliver targeted styling design variables.
 * Automatically aligns trend vectors against your custom Tailwind configuration properties.
 *
 * @param changePercent  The active variance ratio retrieved from asset indexing engines
 * @returns              A styling asset property flag injection string
 */
export function getPriceChangeColor(changePercent: number): string {
  return changePercent >= 0 ? 'text-price-up' : 'text-price-down'
}

/**
 * Normalizes decimal pricing structures and prefixes an explicit algebraic direction marker.
 *
 * @param changePercent  The raw floating variance percentage extracted from index feeds
 * @returns              A complete dashboard text component string block
 */
export function formatPriceChange(changePercent: number): string {
  const sign = changePercent >= 0 ? '+' : ''
  return `${sign}${changePercent.toFixed(2)}%`
}

// 7. --- Vault Derived State Helpers ---

/**
 * Decodes the raw contract storage variables into a defined, type-safe runtime layout string.
 * Computes localized expiration offsets dynamically to evaluate deadlocks before triggering state transitions.
 *
 * @param config  The structural configuration record object fetched via active wagmi lines
 * @returns       The specific string layout type that guides dashboard operational interfaces
 */
export function getVaultStatus(config: RecoveryConfig): VaultStatus {
  if (!config.isActive) return 'unregistered'
  if (config.isAbandoned) return 'abandoned'

  const deadline = Number(config.lastActivity) + Number(config.inactivityPeriod)
  const now = Math.floor(Date.now() / 1000)

  if (now >= deadline) return 'abandoned' // If the time is fully up, map into the abandoned tier
  return 'active'
}

/**
 * Assesses structural balances and registration configurations to authorize protocol asset withdrawal loops.
 * Protects users by preventing zero-value execution iterations on the contract address.
 *
 * @param config  The structural configuration parameters mapped from user profiles
 * @returns       True if the connected profile meets all structural safety checkpoints
 */
export function isVaultWithdrawable(config: RecoveryConfig): boolean {
  return config.isActive && config.balance > 0n && !config.isAbandoned
}
