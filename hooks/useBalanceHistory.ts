/**
 * hooks/useBalanceHistory.ts
 *
 * Reconstructs the vault balance over time by replaying balance-affecting
 * contract events from the indexer, then filters the result to the
 * selected time range for the BalanceChart.
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'
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

export interface UseBalanceHistoryReturn {
  dataPoints: ChartDataPoint[]
  isLoading: boolean
  isError: boolean
}

export function useBalanceHistory(timeRange: TimeRange): UseBalanceHistoryReturn {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { usdPrice } = useEthPrice()

  // --- Layer 1: Fetch events and reconstruct chronological balance ---
  const { data: rawPoints, dataUpdatedAt, isLoading, isError } = useQuery<RawBalancePoint[]>({
    queryKey: ['balanceHistory', address, chainId],

    queryFn: async (): Promise<RawBalancePoint[]> => {
      if (!address) return []

      // Properly type the Ponder pagination wrapper structure
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
    },

    enabled: isConnected && !!address,
    refetchInterval: EVENTS_POLL_INTERVAL_MS,
    placeholderData: (prev: RawBalancePoint[] | undefined) => prev,
  })

  // --- Layer 2: Filter by range & apply fresh market price ---
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