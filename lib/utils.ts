/**
 * lib/utils.ts
 *
 * Pure utility functions with no formatting or display concerns.
 * Nothing in this file returns a string meant for UI rendering —
 * those live in lib/formatters.ts.
 *
 * Safe to import anywhere: server components, hooks, other lib files.
 *
 * Grouped into:
 *   1. Classname merging     — cn()
 *   2. Address utilities     — validation, truncation, zero-check
 *   3. Wei / ETH conversion  — raw math, returns numbers not strings
 *   4. Countdown math        — builds breakdown from seconds remaining
 *   5. Vault state           — derives status flags from RecoveryConfig
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatUnits, parseUnits, isAddress } from 'viem'
import { ZERO_ADDRESS } from './constants'
import type { CountdownBreakdown, VaultStatus, RecoveryConfig } from '@/types'

// 1. --- Classname merging ---

/**
 * Merges Tailwind class strings without conflicts.
 * The standard shadcn/ui pattern — used in every component.
 *
 * Example:
 *   cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// 2. --- Address utilities ---

/**
 * Truncates a full Ethereum address to the format shown in the Header:
 *   0x328809Bc894f92807417D2dAD6b7C998c1aFdac6  →  0x3288...dAD6
 *
 * @param address   Full Ethereum address string
 * @param prefixLen Characters to keep after "0x" (default 4)
 * @param suffixLen Characters to keep at the end (default 4)
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
 * Returns true if the value is a valid Ethereum address.
 * Used in RegisterForm and UpdateBackupForm for inline input validation.
 */
export function isValidAddress(value: string): boolean {
  return isAddress(value)
}

/**
 * Returns true if the address is the zero address (0x000...000).
 * The contract returns address(0) for backupAddress when a wallet
 * is unregistered — use this to guard against rendering that value.
 */
export function isZeroAddress(address: string): boolean {
  return address === ZERO_ADDRESS
}

// 3. --- Wei / ETH conversion ---

/**
 * Converts a bigint wei value to a plain JavaScript number (ETH).
 * Returns a number, not a formatted string — use formatters.ts for display.
 *
 * Used by:
 *   - useBalanceHistory()  to build ChartDataPoint.balanceEth
 *   - formatters.ts        for USD math
 *
 * Example:
 *   weiToEthNumber(10000000000000000n)  →  0.01
 */
export function weiToEthNumber(wei: bigint): number {
  return parseFloat(formatUnits(wei, 18))
}

/**
 * Converts an ETH string to a wei bigint.
 * Used in form submit handlers before passing values to contract writes.
 *
 * Example:
 *   ethToWei("0.5")  →  500000000000000000n
 *
 * Returns 0n on invalid input so forms can safely pass the result
 * without a try/catch at every call site.
 */
export function ethToWei(eth: string): bigint {
  try {
    return parseUnits(eth, 18)
  } catch {
    return 0n
  }
}

/**
 * Returns true if a price change percentage is negative.
 * Used by PriceChange component to decide between red and green display.
 */
export function isPriceDown(change: number): boolean {
  return change < 0
}

// 4. --- Countdown math ---

/**
 * Breaks a remaining-seconds value into the four countdown units
 * displayed in CountdownBox: DAYS · HRS · MINS · SECS
 *
 * Returns isExpired: true when secondsRemaining ≤ 0.
 * Called inside useCountdown() on every 1-second tick.
 *
 * Example:
 *   buildCountdown(22154542)
 *   → { days: 256, hours: 7, minutes: 32, seconds: 22, isExpired: false }
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
 * Computes the seconds remaining until recovery triggers,
 * derived from lastActivity and inactivityPeriod in the vault config.
 *
 * Returns 0 when the period has elapsed — never negative.
 *
 * @param lastActivity      Unix timestamp in seconds (bigint from contract)
 * @param inactivityPeriod  Duration in seconds (bigint from contract)
 */
export function secondsUntilRecovery(
  lastActivity: bigint,
  inactivityPeriod: bigint
): number {
  const deadline   = Number(lastActivity) + Number(inactivityPeriod)
  const nowSeconds = Math.floor(Date.now() / 1000)
  return Math.max(0, deadline - nowSeconds)
}

// 5. --- Vault state helpers ---

/**
 * Derives a VaultStatus from the raw RecoveryConfig returned by the contract.
 * Components switch on VaultStatus rather than re-implementing boolean logic.
 *
 *   isActive = true    →  'active'
 *   isAbandoned = true →  'abandoned'
 *   both false         →  'unregistered'
 */
export function deriveVaultStatus(config: RecoveryConfig): VaultStatus {
  if (config.isActive)    return 'active'
  if (config.isAbandoned) return 'abandoned'
  return 'unregistered'
}

/**
 * Returns true if the vault holds a non-zero ETH balance.
 * Guards the Withdraw button from being enabled on an empty vault.
 */
export function hasBalance(config: RecoveryConfig): boolean {
  return config.balance > 0n
}

/**
 * Returns true if the vault has reached or exceeded MAX_RECOVERY_ATTEMPTS.
 * Used to determine whether the vault is on its last attempt before abandonment.
 *
 * @param config       Current vault config
 * @param maxAttempts  MAX_RECOVERY_ATTEMPTS read from the contract immutable
 */
export function isAtMaxAttempts(
  config: RecoveryConfig,
  maxAttempts: number
): boolean {
  return config.failedRecoveryAttempts >= maxAttempts
}