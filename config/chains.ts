/**
 * config/chains.ts
 *
 * Chain definitions consumed by lib/wagmi.ts.
 * Sepolia is the active network for v1 MVP.
 * Mainnet is defined but inactive — used for future address references only.
 */

import { sepolia, mainnet } from 'wagmi/chains'
import type { Chain } from 'viem'

// --- Supported chains ---

/**
 * The chains wagmi is configured to support.
 * Add mainnet here when ready for production deployment.
 */
export const supportedChains = [sepolia] as const

export type SupportedChain = (typeof supportedChains)[number]
export type SupportedChainId = SupportedChain['id']

/**
 * The chain the app targets by default.
 * All contract reads/writes use this chain unless the user has switched.
 */
export const DEFAULT_CHAIN: Chain = sepolia

// --- Chain IDs ---

export const CHAIN_IDS = {
  MAINNET: mainnet.id,   // 1
  SEPOLIA: sepolia.id,   // 11155111
} as const

// --- Block explorers ---

/**
 * Base URLs for Etherscan links.
 * Used by AddressDisplay and TransactionRow to generate tx/address links.
 */
export const BLOCK_EXPLORERS: Record<number, string> = {
  [mainnet.id]: 'https://etherscan.io',
  [sepolia.id]: 'https://sepolia.etherscan.io',
}

/**
 * Returns the Etherscan base URL for a given chainId.
 * Falls back to mainnet if chainId is not recognised.
 */
export function getExplorerUrl(chainId: number): string {
  return BLOCK_EXPLORERS[chainId] ?? BLOCK_EXPLORERS[mainnet.id]
}

/**
 * Returns a full Etherscan URL for a transaction hash.
 */
export function getTxUrl(txHash: string, chainId: number): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`
}

/**
 * Returns a full Etherscan URL for an address.
 */
export function getAddressUrl(address: string, chainId: number): string {
  return `${getExplorerUrl(chainId)}/address/${address}`
}

// --- Network display names ---

export const CHAIN_NAMES: Record<number, string> = {
  [mainnet.id]: 'Ethereum',
  [sepolia.id]: 'Sepolia',
}

export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] ?? 'Unknown network'
}