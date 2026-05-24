/**
 * hooks/useBalanceHistory.ts
 *
 * Reconstructs the vault balance over time by replaying balance-affecting
 * contract events in chronological order, then filters the result to the
 * selected time range for the BalanceChart in ChartPanel.
 *
 * Events that change vault balance (fetched in this hook):
 *   Deposited(wallet, amount)                   → balance += amount
 *   Sent(wallet, to, amount)                    → balance -= amount
 *   Withdrawn(wallet, amount)                   → balance = 0
 *   RecoveryExecuted(wallet, backupAddress, amount) → balance = 0
 *   RecoveryCancelled(wallet, refundAmount)     → balance = 0
 *
 * Architecture — two-layer design:
 *   Layer 1 (useQuery):
 *     Fetches all balance-affecting events from contract genesis,
 *     reconstructs the full balance history as RawBalancePoint[],
 *     and caches the result. Time range does NOT affect this layer —
 *     the full history is fetched once and reused across range changes.
 *
 *   Layer 2 (useMemo):
 *     Filters the cached raw points to the selected time range and
 *     attaches the current ETH/USD price to each point for chart tooltips.
 *     Re-runs instantly on time range change without a new RPC call.
 *
 * USD note:
 *   Historical ETH/USD prices are not fetched (requires a paid API).
 *   All data points use the current ETH price from useEthPrice().
 *   The USD values shown in chart tooltips reflect today's price applied
 *   to historical ETH balances — acceptable for an MVP.
 *
 * Returns:
 *   dataPoints — ChartDataPoint[] filtered to the selected time range
 *   isLoading  — true on the first event fetch
 *   isError    — true if the getLogs calls failed
 */

import { useMemo }         from 'react'
import { useQuery }        from '@tanstack/react-query'
import { usePublicClient, useAccount, useChainId } from 'wagmi'
import { getVaultAddress } from '@/lib/contracts'
import {
  fetchVaultEventLogs,
  eventMatchesWallet,
  type ParsedVaultEvent,
} from '@/lib/eventLogs'
import { useEthPrice }     from './useEthPrice'
import { weiToEthNumber }  from '@/lib/utils'
import { EVENTS_POLL_INTERVAL_MS } from '@/lib/constants'
import type { ChartDataPoint, TimeRange } from '@/types'

const BALANCE_EVENT_NAMES = new Set([
  'Deposited',
  'Sent',
  'Withdrawn',
  'RecoveryExecuted',
  'RecoveryCancelled',
])

type BalanceDelta = {
  blockNumber: bigint
  logIndex:    number
  delta:       bigint
  zeroes:      boolean
}

function eventToBalanceDelta(event: ParsedVaultEvent): BalanceDelta | null {
  const blockNumber = event.blockNumber ?? 0n
  const logIndex = event.logIndex ?? 0
  const args = event.args as Record<string, unknown>

  switch (event.eventName) {
    case 'Deposited':
      return {
        blockNumber,
        logIndex,
        delta: typeof args.amount === 'bigint' ? args.amount : 0n,
        zeroes: false,
      }
    case 'Sent':
      return {
        blockNumber,
        logIndex,
        delta: typeof args.amount === 'bigint' ? -args.amount : 0n,
        zeroes: false,
      }
    case 'Withdrawn':
    case 'RecoveryExecuted':
    case 'RecoveryCancelled':
      return { blockNumber, logIndex, delta: 0n, zeroes: true }
    default:
      return null
  }
}

// --- Time range → cutoff seconds ---
//
// Maps each TimeRange label to the number of seconds to look back from now.
// null means no cutoff — show all history (ALL range).

const TIME_RANGE_SECONDS: Record<TimeRange, number | null> = {
  '1D':  86_400,
  '1W':  604_800,
  '1M':  2_592_000,
  '6M':  15_552_000,
  '1Y':  31_536_000,
  'ALL': null,
}

// --- Internal raw point type ---
//
// Stored without USD value so the USD conversion stays fresh
// when the ETH price updates — computed in useMemo, not in queryFn.

interface RawBalancePoint {
  timestamp:  number   // unix seconds
  balanceEth: number   // vault balance in ETH at this moment
}

// --- Return type ---

export interface UseBalanceHistoryReturn {
  /**
   * Balance history filtered to the selected time range.
   * Each point has timestamp, balanceEth, and balanceUsd (current price applied).
   * Empty array while loading, on error, or when no transactions exist yet.
   */
  dataPoints: ChartDataPoint[]

  /** True on the first event fetch before any data arrives. */
  isLoading: boolean

  /** True if the getLogs calls failed (e.g. RPC error or rate limit). */
  isError: boolean
}

// --- Hook ---

/**
 * @param timeRange  Selected time range from TimeRangeSelector.
 *                   Changing this filters existing cached data instantly —
 *                   no new RPC call is made on range change.
 */
export function useBalanceHistory(timeRange: TimeRange): UseBalanceHistoryReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const publicClient             = usePublicClient()
  const contractAddress          = getVaultAddress(chainId)

  // Current ETH/USD price — applied to all historical points.
  // When the price updates (every 60s), useMemo recomputes balanceUsd
  // for all points without a new getLogs fetch.
  const { usdPrice } = useEthPrice()

  // --- Layer 1: fetch and reconstruct full balance history
  //
  // queryKey excludes timeRange deliberately — the full event history is
  // fetched once and reused when the user switches between 1D, 1W, etc.

  const { data: rawPoints, isLoading, isError } = useQuery<RawBalancePoint[]>({
    queryKey: ['balanceHistory', address, chainId],

    queryFn: async (): Promise<RawBalancePoint[]> => {
      if (!address || !publicClient || !contractAddress) return []

      const decoded = await fetchVaultEventLogs(
        publicClient,
        contractAddress,
        chainId,
      )

      const allDeltas = decoded
        .filter(
          (event) =>
            BALANCE_EVENT_NAMES.has(event.eventName) &&
            eventMatchesWallet(event, address),
        )
        .map(eventToBalanceDelta)
        .filter((d): d is BalanceDelta => d !== null)

      if (allDeltas.length === 0) return []

      allDeltas.sort((a, b) => {
        const blockDiff = a.blockNumber - b.blockNumber
        if (blockDiff > 0n) return 1
        if (blockDiff < 0n) return -1
        return a.logIndex - b.logIndex
      })

      // --- Fetch timestamps for unique block numbers
      //
      // Multiple events in the same block share a timestamp.
      // Fetching each unique block once rather than once per event
      // minimises RPC calls when transactions cluster in few blocks.

      const uniqueBlocks = [
        ...new Set(
          allDeltas
            .map(d => d.blockNumber)
            .filter((bn): bn is bigint => bn > 0n)
        ),
      ]

      const blockTimestamps = new Map<bigint, number>()

      await Promise.all(
        uniqueBlocks.map(async (blockNumber) => {
          try {
            const block = await publicClient.getBlock({ blockNumber })
            blockTimestamps.set(blockNumber, Number(block.timestamp))
          } catch {
            // If a block fetch fails, fall back to 0.
            // The point still appears in the chart — just without an
            // accurate timestamp. Acceptable for MVP.
            blockTimestamps.set(blockNumber, 0)
          }
        })
      )

      // --- Walk events and compute running balance

      let runningBalance = 0n
      const points: RawBalancePoint[] = []

      for (const delta of allDeltas) {
        if (delta.zeroes) {
          runningBalance = 0n
        } else {
          runningBalance += delta.delta
          // Guard against underflow — should never happen if contract is correct,
          // but prevents negative balances from appearing in the chart.
          if (runningBalance < 0n) runningBalance = 0n
        }

        const timestamp = blockTimestamps.get(delta.blockNumber) ?? 0

        points.push({
          timestamp,
          balanceEth: weiToEthNumber(runningBalance),
        })
      }

      // Add a "now" data point using the last known balance.
      // This extends the chart line to the right edge of the viewport
      // so it does not appear to stop in the middle of the time axis.
      if (points.length > 0) {
        points.push({
          timestamp:  Math.floor(Date.now() / 1000),
          balanceEth: points[points.length - 1].balanceEth,
        })
      }

      return points
    },

    enabled: isConnected && !!address && !!contractAddress && !!publicClient,

    // Poll less frequently than vault state — balance history only
    // changes when a new transaction is mined.
    refetchInterval: EVENTS_POLL_INTERVAL_MS,
    retry: 2,
    retryDelay: 2_000,

    // Hold the previous result while a background refetch runs so the
    // chart does not flash to empty on every 30-second refresh.
    placeholderData: (prev: RawBalancePoint[] | undefined) => prev,
  })

  // --- Layer 2: filter by time range + attach USD price
  //
  // Runs instantly on range change — no RPC call.
  // Also re-runs when usdPrice updates so tooltip USD values stay accurate.

  const dataPoints = useMemo((): ChartDataPoint[] => {
    if (!rawPoints || rawPoints.length === 0) return []

    const rangeSeconds = TIME_RANGE_SECONDS[timeRange]
    let filtered: RawBalancePoint[]

    if (rangeSeconds === null) {
      // ALL — no time cutoff
      filtered = rawPoints
    } else {
      const cutoff = Math.floor(Date.now() / 1000) - rangeSeconds
      filtered = rawPoints.filter(p => p.timestamp >= cutoff)

      // If the selected range predates all recorded events, fall back to
      // showing the most recent known balance as a single starting point
      // rather than leaving the chart completely empty.
      if (filtered.length === 0 && rawPoints.length > 0) {
        filtered = [rawPoints[rawPoints.length - 1]]
      }
    }

    // Attach current ETH/USD price to each point for chart tooltips.
    return filtered.map(p => ({
      timestamp:  p.timestamp,
      balanceEth: p.balanceEth,
      balanceUsd: p.balanceEth * usdPrice,
    }))
  }, [rawPoints, timeRange, usdPrice])

  return { dataPoints, isLoading, isError }
}