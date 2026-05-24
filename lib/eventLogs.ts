/**
 * lib/eventLogs.ts
 *
 * Shared helpers for fetching AeternumVault event logs via a single getLogs
 * call per request (instead of one call per event type).
 *
 * Public RPC providers (Alchemy free tier, etc.) often reject:
 *   - fromBlock: 0n (full chain scan)
 *   - many parallel eth_getLogs requests
 *   - very large block ranges
 *
 * This module resolves a bounded fromBlock and retries with smaller ranges.
 */

import { parseEventLogs, type PublicClient } from 'viem'
import { AETERNUM_VAULT_ABI } from '@/lib/abi'
import { EVENT_HISTORY_BLOCK_RANGE } from '@/lib/constants'
import { CHAIN_IDS } from '@/config/chains'

/** Smaller ranges tried when the provider rejects a wide scan. */
const FALLBACK_BLOCK_RANGES = [
  EVENT_HISTORY_BLOCK_RANGE,
  10_000n,
  2_000n,
] as const

export type ParsedVaultEvent = ReturnType<
  typeof parseEventLogs<typeof AETERNUM_VAULT_ABI>
>[number]

function getDeploymentFromBlock(chainId: number): bigint | undefined {
  if (chainId === CHAIN_IDS.SEPOLIA) {
    const block = process.env.NEXT_PUBLIC_SEPOLIA_DEPLOYMENT_BLOCK
    if (block) return BigInt(block)
  }
  return undefined
}

/**
 * Computes the earliest block to scan for vault events.
 * Uses the smaller of: (latest − range) and optional deployment block.
 */
export async function resolveEventFromBlock(
  publicClient: PublicClient,
  chainId: number,
  range: bigint,
): Promise<bigint> {
  const latest = await publicClient.getBlockNumber()
  const rangeStart = latest > range ? latest - range : 0n
  const deployment = getDeploymentFromBlock(chainId)

  if (deployment !== undefined && deployment > rangeStart) {
    return deployment
  }

  return rangeStart
}

/**
 * Fetches and decodes all logs emitted by the vault contract within a
 * bounded block range. Retries with progressively smaller ranges on failure.
 */
export async function fetchVaultEventLogs(
  publicClient: PublicClient,
  contractAddress: `0x${string}`,
  chainId: number,
): Promise<ParsedVaultEvent[]> {
  let lastError: unknown

  for (const range of FALLBACK_BLOCK_RANGES) {
    try {
      const fromBlock = await resolveEventFromBlock(publicClient, chainId, range)
      const logs = await publicClient.getLogs({
        address: contractAddress,
        fromBlock,
        toBlock: 'latest',
      })

      return parseEventLogs({
        abi: AETERNUM_VAULT_ABI,
        logs,
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

/** Returns true when a decoded event's `wallet` arg matches the connected address. */
export function eventMatchesWallet(
  event: ParsedVaultEvent,
  wallet: `0x${string}`,
): boolean {
  const args = event.args as { wallet?: `0x${string}` }
  if (!args.wallet) return false
  return args.wallet.toLowerCase() === wallet.toLowerCase()
}
