/**
 * hooks/useVaultTransactions.ts
 *
 * Fetches historical vault event logs via the Aeternum GraphQL indexer interface.
 * Eliminates intensive parallel RPC getLogs scans and block timestamp lookups,
 * providing instant pagination-ready transaction histories.
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'
import { fetchIndexer } from '@/lib/indexer'
import { GET_VAULT_TRANSACTIONS } from '@/graphql/queries'
import { EVENTS_POLL_INTERVAL_MS } from '@/lib/constants'
import type { TransactionEvent, TransactionType } from '@/types'

export interface UseVaultTransactionsReturn {
  transactions: TransactionEvent[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

interface GraphQLTransactionItem {
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
    items: GraphQLTransactionItem[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
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

export function useVaultTransactions(limit?: number): UseVaultTransactionsReturn {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['vaultTransactions', address, chainId, limit],
    
    queryFn: async ({ pageParam }) => {
      if (!address) return { items: [], endCursor: null, hasNextPage: false }

      // If a strict layout limit is passed (dashboard), fetch exactly that.
      // Otherwise, pull down blocks in clean chunks of 50.
      const pageSize = limit ?? 50

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

      return { items: mappedItems, endCursor: cursor, hasNextPage: hasNext }
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

  return {
    transactions: allTransactions,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}