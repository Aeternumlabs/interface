/**
 * hooks/useBalanceHistory.ts
 *
 * Reconstructs the vault balance over time by replaying balance-affecting
 * contract events from the indexer, then filters the result to the
 * selected time range for the BalanceChart.
 */

import { useMemo, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'
import { usePublicClient, useAccount, useChainId } from 'wagmi'
import { getVaultAddress } from '@/lib/contracts'
import { AETERNUM_VAULT_ABI } from '@/lib/abi'
import { fetchIndexer } from '@/lib/indexer'
import { GET_VAULT_BALANCE_EVENTS } from '@/graphql/queries'
import { useEthPrice } from './useEthPrice'
import { weiToEthNumber } from '@/lib/utils'
import { EVENTS_POLL_INTERVAL_MS } from '@/lib/constants'
import type { ChartDataPoint, TimeRange } from '@/types'

const TIME_RANGE_SECONDS: Record<TimeRange, number | null> = {
  '1D': 86_400,
  '1W': 604_800,
  '1M': 2_592_000,
  '6M': 15_552_000,
  '1Y': 31_536_000,
  'ALL': null,
}

/** Blocks to scan in the fallback path */
const FALLBACK_BLOCK_RANGE = BigInt(10_000)

interface GraphQLBalanceEvent {
  eventName: 'Deposited' | 'Sent' | 'Withdrawn' | 'RecoveryExecuted' | 'RecoveryCancelled'
  blockNumber: string | number
  logIndex: number
  blockTimestamp: string | number
  amount?: string | null
}

interface RawBalancePoint {
  timestamp: number
  balanceEth: number
}

// --- Blockchain fallback fetcher ---

async function fetchBalanceEventsFromBlockchain(
  publicClient:    NonNullable<ReturnType<typeof usePublicClient>>,
  contractAddress: `0x${string}`,
  walletAddress:   `0x${string}`,
): Promise<GraphQLBalanceEvent[]> {

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

  // Filter for balance-affecting events only
  const balanceEventNames = ['Deposited', 'Sent', 'Withdrawn', 'RecoveryExecuted', 'RecoveryCancelled']
  const walletLogs = parsedLogs.filter(log => {
    const args = (log.args ?? {}) as Record<string, unknown>
    const isWallet = (args.wallet as string | undefined)
      ?.toLowerCase() === walletAddress.toLowerCase()
    const isBalanceEvent = balanceEventNames.includes(log.eventName as string)
    return isWallet && isBalanceEvent
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
        tsMap.set(bn, 0)
      }
    })
  )

  // Convert to GraphQLBalanceEvent format
  const events: GraphQLBalanceEvent[] = []
  for (const log of walletLogs) {
    const args = (log.args ?? {}) as Record<string, unknown>
    const logIndex = (log as any).logIndex ?? 0
    const blockNum = log.blockNumber as bigint

    let amount: string | null = null
    if (typeof args.amount === 'bigint') {
      amount = args.amount.toString()
    } else if (typeof args.refundAmount === 'bigint') {
      amount = args.refundAmount.toString()
    } else if (typeof args.balance === 'bigint') {
      amount = args.balance.toString()
    }

    events.push({
      eventName: log.eventName as GraphQLBalanceEvent['eventName'],
      blockNumber: blockNum.toString(),
      logIndex,
      blockTimestamp: tsMap.get(blockNum) ?? 0,
      amount,
    })
  }

  return events
}

export interface UseBalanceHistoryReturn {
  dataPoints: ChartDataPoint[]
  isLoading: boolean
  isError: boolean
}

export function useBalanceHistory(timeRange: TimeRange): UseBalanceHistoryReturn {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const contractAddress = getVaultAddress(chainId)
  const { usdPrice } = useEthPrice()
  const queryClient = useQueryClient()

  // Clear cached data when wallet disconnects to revert UI to pre-connected state
  useEffect(() => {
    if (!isConnected) {
      queryClient.removeQueries({ queryKey: ['balanceHistory', address, chainId] })
    }
  }, [isConnected, address, chainId, queryClient])

  // --- Layer 1: Fetch events and reconstruct chronological balance
  const { data: rawPoints, dataUpdatedAt, isLoading, isError } = useQuery<RawBalancePoint[]>({
    queryKey: ['balanceHistory', address, chainId],

    queryFn: async (): Promise<RawBalancePoint[]> => {
      if (!address) return []

      // --- PRIMARY: Ponder indexer
      try {
        const response = await fetchIndexer<{ balanceEvents: { items: GraphQLBalanceEvent[] } }>(
          GET_VAULT_BALANCE_EVENTS,
          { vaultId: address.toLowerCase() }
        )

        // Drill down into the items array
        const events = response?.balanceEvents?.items ?? []
        if (events.length === 0) return []

        // Sort chronologically by block and log index (backup in case GraphQL sorting is ignored)
        const sortedEvents = [...events].sort((a, b) => {
          const blockDiff = BigInt(a.blockNumber) - BigInt(b.blockNumber)
          if (blockDiff !== 0n) return blockDiff > 0n ? 1 : -1
          return a.logIndex - b.logIndex
        })

        let runningBalance = 0n
        const points: RawBalancePoint[] = []

        for (const event of sortedEvents) {
          const amount = event.amount ? BigInt(event.amount) : 0n

          switch (event.eventName) {
            case 'Deposited':
              runningBalance += amount
              break
            case 'Sent':
              runningBalance -= amount
              if (runningBalance < 0n) runningBalance = 0n
              break
            case 'Withdrawn':
            case 'RecoveryExecuted':
            case 'RecoveryCancelled':
              runningBalance = 0n
              break
          }

          points.push({
            timestamp: Number(event.blockTimestamp),
            balanceEth: weiToEthNumber(runningBalance),
          })
        }

        // Append a rolling "now" point to extend the chart line cleanly to the edge
        if (points.length > 0) {
          points.push({
            timestamp: Math.floor(Date.now() / 1000),
            balanceEth: points[points.length - 1].balanceEth,
          })
        }

        return points

      } catch (err) {
        console.warn(
          '[useBalanceHistory] Indexer unavailable — switching to blockchain fallback.',
          err,
        )
      }

      // --- FALLBACK: direct blockchain getLogs
      if (!publicClient || !contractAddress) {
        return []
      }

      const events = await fetchBalanceEventsFromBlockchain(publicClient, contractAddress, address)
      if (events.length === 0) return []

      // Sort chronologically by block and log index
      const sortedEvents = [...events].sort((a, b) => {
        const blockDiff = BigInt(a.blockNumber) - BigInt(b.blockNumber)
        if (blockDiff !== 0n) return blockDiff > 0n ? 1 : -1
        return a.logIndex - b.logIndex
      })

      let runningBalance = 0n
      const points: RawBalancePoint[] = []

      for (const event of sortedEvents) {
        const amount = event.amount ? BigInt(event.amount) : 0n

        switch (event.eventName) {
          case 'Deposited':
            runningBalance += amount
            break
          case 'Sent':
            runningBalance -= amount
            if (runningBalance < 0n) runningBalance = 0n
            break
          case 'Withdrawn':
          case 'RecoveryExecuted':
          case 'RecoveryCancelled':
            runningBalance = 0n
            break
        }

        points.push({
          timestamp: Number(event.blockTimestamp),
          balanceEth: weiToEthNumber(runningBalance),
        })
      }

      // Append a rolling "now" point to extend the chart line cleanly to the edge
      if (points.length > 0) {
        points.push({
          timestamp: Math.floor(Date.now() / 1000),
          balanceEth: points[points.length - 1].balanceEth,
        })
      }

      return points
    },

    enabled: isConnected && !!address,
    refetchInterval: EVENTS_POLL_INTERVAL_MS,
    staleTime: 0, // Clear data immediately when wallet disconnects
  })

  // --- Layer 2: Filter by range & apply fresh market price
  const dataPoints = useMemo((): ChartDataPoint[] => {
    if (!rawPoints || rawPoints.length === 0 || !dataUpdatedAt) return []

    const rangeSeconds = TIME_RANGE_SECONDS[timeRange]
    let filtered: RawBalancePoint[]

    if (rangeSeconds === null) {
      filtered = rawPoints
    } else {
      const cutoff = Math.floor(dataUpdatedAt / 1000) - rangeSeconds
      filtered = rawPoints.filter(p => p.timestamp >= cutoff)

      if (filtered.length === 0 && rawPoints.length > 0) {
        filtered = [rawPoints[rawPoints.length - 1]]
      }
    }

    return filtered.map(p => ({
      timestamp: p.timestamp,
      balanceEth: p.balanceEth,
      balanceUsd: p.balanceEth * usdPrice,
    }))
  }, [rawPoints, timeRange, usdPrice, dataUpdatedAt])

  return { dataPoints, isLoading, isError }
}