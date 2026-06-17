/**
 * hooks/useVaultTransactions.ts
 *
 * Fetches vault transaction history with automatic fallback:
 *
 *   PRIMARY  → Ponder indexer  (full history, fast, zero RPC cost)
 *   FALLBACK → Direct getLogs  (via public/Alchemy RPC)
 *
 * The fallback activates silently whenever the indexer throws — exhausted
 * API credits, Railway downtime, cold-start timeout, GraphQL schema error, etc.
 * Components never need to know which source is active; they just consume
 * TransactionEvent[]. An optional `isFallback` flag is exposed so
 * TransactionList can show a subtle "limited history" notice.
 *
 * FALLBACK SCOPE
 *   FALLBACK_BLOCK_RANGE = 10_000 blocks × 12 s/block ≈ 33.3 hours.
 *   This is intentionally conservative to stay within public-RPC getLogs limits.
 *   Alchemy/Infura paid tiers allow larger ranges — raise the constant if needed.
 */

import { useInfiniteQuery }               from '@tanstack/react-query'
import { parseEventLogs }                  from 'viem'
import { usePublicClient, useAccount, useChainId } from 'wagmi'
import { getVaultAddress }                 from '@/lib/contracts'
import { AETERNUM_VAULT_ABI }              from '@/lib/abi'
import { fetchIndexer }                    from '@/lib/indexer'
import { GET_VAULT_TRANSACTIONS }          from '@/graphql/queries'
import { EVENTS_POLL_INTERVAL_MS, TRANSACTION_PAGE_SIZE } from '@/lib/constants'
import type { TransactionEvent, TransactionType } from '@/types'

// --- Constants ---

/** Blocks to scan in the fallback path */
const FALLBACK_BLOCK_RANGE = BigInt(10_000)

// --- Indexer types ---

interface IndexerTx {
  id: string
  vaultId: string
  type: string
  amount: string | null
  timestamp: number | string
  transactionHash: string
  blockNumber?: string | number
  toAddress?: string | null
}

interface IndexerResponse {
  vaultTransactionsItems: {
    items: IndexerTx[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

interface PageData {
  items: TransactionEvent[]
  endCursor: string | null
  hasNextPage: boolean
  fallback: boolean
}

// --- Mappers ---

/** Map a Ponder indexer row to the canonical TransactionEvent shape. */
function fromIndexer(item: IndexerTx): TransactionEvent {
  return {
    id:          item.id,
    type:        item.type.toLowerCase() as TransactionType,
    txHash:      (item.transactionHash ?? undefined) as `0x${string}` | undefined,
    blockNumber: BigInt(item.blockNumber ?? 0),
    timestamp:   Number(item.timestamp),
    amount:      item.amount  ? BigInt(item.amount)  : undefined,
    toAddress:   (item.toAddress ?? undefined) as `0x${string}` | undefined,
  }
}

/** Contract event name → TransactionType key. */
const EVENT_TO_TYPE: Partial<Record<string, TransactionType>> = {
  RecoveryRegistered:      'registered',
  Deposited:               'deposited',
  Sent:                    'sent',
  Withdrawn:               'withdrawn',
  ActivityPinged:          'pinged',
  BackupAddressUpdated:    'backupUpdated',
  InactivityPeriodUpdated: 'periodUpdated',
  RecoveryExecuted:        'recoveryExecuted',
  RecoveryFailed:          'recoveryFailed',
  RecoveryCancelled:       'recoveryCancelled',
  RecoveryAbandoned:       'recoveryAbandoned',
}

// --- Blockchain fallback fetcher ---

async function fetchFromBlockchain(
  publicClient:    NonNullable<ReturnType<typeof usePublicClient>>,
  contractAddress: `0x${string}`,
  walletAddress:   `0x${string}`,
  limit:           number = TRANSACTION_PAGE_SIZE,
): Promise<TransactionEvent[]> {

  // Clamp fromBlock to the most recent FALLBACK_BLOCK_RANGE blocks
  const latestBlock = await publicClient.getBlockNumber()
  const fromBlock   = latestBlock > FALLBACK_BLOCK_RANGE
    ? latestBlock - FALLBACK_BLOCK_RANGE
    : 0n

  // Single getLogs call — ABI decode handles all event types at once
  const rawLogs = await publicClient.getLogs({
    address:  contractAddress,
    fromBlock,
    toBlock:  'latest',
  })

  // Decode using typed ABI
  const parsedLogs = parseEventLogs({ abi: AETERNUM_VAULT_ABI, logs: rawLogs })

  // Every vault event has `wallet` as its first indexed argument
  const walletLogs = parsedLogs.filter(log => {
    const args = (log.args ?? {}) as Record<string, unknown>
    return (args.wallet as string | undefined)
      ?.toLowerCase() === walletAddress.toLowerCase()
  })

  if (walletLogs.length === 0) return []

  // Batch-fetch block timestamps (deduplicated by block number)
  const uniqueBlocks = [
    ...new Set(walletLogs.map(l => l.blockNumber).filter((b): b is bigint => b !== null)),
  ]

  const tsMap = new Map<bigint, number>()
  await Promise.all(
    uniqueBlocks.map(async bn => {
      try {
        const block = await publicClient.getBlock({ blockNumber: bn })
        tsMap.set(bn, Number(block.timestamp))
      } catch {
        tsMap.set(bn, 0) // timestamp unknown — TransactionRow falls back to block #
      }
    })
  )

  // Build TransactionEvent[] from parsed logs
  const events: TransactionEvent[] = []

  for (const log of walletLogs) {
    const type = EVENT_TO_TYPE[log.eventName as string]
    if (!type) continue

    const args      = (log.args ?? {}) as Record<string, unknown>
    const logIndex  = (log as any).logIndex ?? 0
    const txHash    = log.transactionHash as `0x${string}`
    const blockNum  = log.blockNumber as bigint
    const id        = `${txHash}-${logIndex}`

    // Extract optional amount / destination from event args
    let amount:    bigint | undefined
    let toAddress: `0x${string}` | undefined

    if (typeof args.amount       === 'bigint') amount    = args.amount
    if (typeof args.refundAmount === 'bigint') amount    = args.refundAmount
    if (typeof args.balance      === 'bigint') amount    = args.balance
    if (typeof args.to           === 'string') toAddress = args.to as `0x${string}`
    if (typeof args.backupAddress === 'string' && type !== 'registered') {
      toAddress = args.backupAddress as `0x${string}`
    }

    events.push({ id, type, txHash, blockNumber: blockNum,
                  timestamp: tsMap.get(blockNum) ?? 0, amount, toAddress })
  }

  // Newest first, capped at limit
  events.sort((a, b) => {
    const diff = b.blockNumber - a.blockNumber
    return diff > 0n ? 1 : diff < 0n ? -1 : 0
  })

  return events.slice(0, limit)
}

// --- Return type ---

export interface UseVaultTransactionsReturn {
  transactions: TransactionEvent[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  /**
   * True when the indexer was unavailable and data was sourced from
   * a direct blockchain getLogs call.
   * Use this to show a "limited history" notice in the UI.
   */
  isFallback: boolean
}

const INDEXER_TYPE_MAP: Record<string, TransactionType> = {
  'REGISTERED': 'registered',
  'DEPOSIT': 'deposited',
  'SENT': 'sent',
  'WITHDRAWAL': 'withdrawn',
  'PING': 'pinged',
  'PINGED': 'pinged',
  'BACKUP_UPDATED': 'backupUpdated',
  'PERIOD_UPDATED': 'periodUpdated',
  'RECOVERY_EXECUTED': 'recoveryExecuted',
  'RECOVERY_FAILED': 'recoveryFailed',
  'RECOVERY_CANCELLED': 'recoveryCancelled',
  'RECOVERY_ABANDONED': 'recoveryAbandoned',
}

// --- Hook ---

export function useVaultTransactions(limit?: number): UseVaultTransactionsReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const publicClient             = usePublicClient()
  const contractAddress          = getVaultAddress(chainId)

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PageData>({
    queryKey: ['vaultTransactions', address, chainId, limit],
    
    queryFn: async ({ pageParam }) => {
      if (!address) return { items: [], endCursor: null, hasNextPage: false, fallback: false }

      // If a strict layout limit is passed (dashboard), fetch exactly that.
      // Otherwise, pull down blocks in clean chunks of 50.
      const pageSize = limit ?? TRANSACTION_PAGE_SIZE

      // --- PRIMARY: Ponder indexer
      try {
        const response = await fetchIndexer<IndexerResponse>(
          GET_VAULT_TRANSACTIONS,
          {
            vaultId: address.toLowerCase(),
            limit: pageSize,
            after: pageParam, // The cursor string passed by React Query
          }
        )

        const rawItems = response?.vaultTransactionsItems?.items ?? []
        const hasNext = response?.vaultTransactionsItems?.pageInfo?.hasNextPage ?? false
        const cursor = response?.vaultTransactionsItems?.pageInfo?.endCursor ?? null

        const mappedItems = rawItems.map((item) => {
          const rawType = (item.type || '').trim().toUpperCase()
          const mappedType = INDEXER_TYPE_MAP[rawType] || (item.type as TransactionType)

          return {
            id: item.id,
            type: mappedType,
            txHash: (item.transactionHash ?? '0x0') as `0x${string}`,
            blockNumber: item.blockNumber ? BigInt(item.blockNumber) : 0n,
            timestamp: Number(item.timestamp),
            amount: item.amount ? BigInt(item.amount) : undefined,
            toAddress: item.toAddress ? (item.toAddress as `0x${string}`) : undefined,
          }
        })

        return { items: mappedItems, endCursor: cursor, hasNextPage: hasNext, fallback: false }

      } catch (err) {
        console.warn(
          '[useVaultTransactions] Indexer unavailable — switching to blockchain fallback.',
          err,
        )
      }

      // --- FALLBACK: direct blockchain getLogs
      if (!publicClient || !contractAddress) {
        return { items: [], endCursor: null, hasNextPage: false, fallback: true }
      }

      const events = await fetchFromBlockchain(publicClient, contractAddress, address, pageSize)
      // Fallback doesn't support pagination - return single page with no next cursor
      return { items: events, endCursor: null, hasNextPage: false, fallback: true }
    },

    initialPageParam: null as string | null,
    
    // Looks at the last fetched page to determine the next DB evaluation point
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.endCursor : undefined),
    
    enabled: isConnected && !!address,
    refetchInterval: limit ? EVENTS_POLL_INTERVAL_MS : false, // Poll on dashboard, let manual/scroll govern large tables
    retry: 2,
  })

  // Flatten all query pages into a single continuous transaction array
  const allTransactions = data ? data.pages.flatMap((page) => page.items) : []
  
  // Determine if any page used fallback
  const isFallback = data?.pages.some(page => page.fallback) ?? false

  return {
    transactions: allTransactions,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFallback,
  }
}