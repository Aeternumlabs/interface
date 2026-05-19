/**
 * hooks/useEthPrice.ts
 *
 * Fetches the current ETH/USD price and 24h change percentage from
 * CoinGecko's free simple price endpoint — no API key required.
 *
 * Feeds three components:
 *   BalanceDisplay    — converts vault balance from ETH to "$22.16"
 *   USDAmount         — any ETH → USD conversion across the app
 *   PriceChange       — the "▼ 2.39%" indicator in TopAssetsCard
 *
 * Caching:
 *   The result is cached for PRICE_CACHE_DURATION_MS (60 seconds).
 *   TanStack Query handles deduplication — if BalanceDisplay and
 *   TopAssetsCard both mount simultaneously, only one HTTP request
 *   is made and both components receive the same cached value.
 *
 * Error behaviour:
 *   On fetch failure (rate limit, network error), isError is true
 *   and priceData is undefined. Components should gracefully handle
 *   this by hiding the USD value rather than showing "$0.00".
 *
 * Returns:
 *   priceData — { usdPrice, change24h } or undefined while loading
 *   usdPrice  — convenience accessor, 0 when priceData is undefined
 *   change24h — convenience accessor, 0 when priceData is undefined
 *   isLoading — true on the first fetch before any data arrives
 *   isError   — true if the fetch failed
 */

import { useQuery }                       from '@tanstack/react-query'
import { COINGECKO_ETH_PRICE_URL, PRICE_CACHE_DURATION_MS } from '@/lib/constants'
import type { EthPriceData }              from '@/types'

// --- CoinGecko response shape ---

interface CoinGeckoResponse {
  ethereum: {
    usd:              number
    usd_24h_change:   number
  }
}

// --- Return type ---

export interface UseEthPriceReturn {
  /** Full price object. Undefined while loading or on error. */
  priceData: EthPriceData | undefined

  /**
   * Current ETH/USD price as a plain number.
   * Returns 0 while loading or on error so callers can use it in
   * arithmetic without null guards: `weiToEthNumber(balance) * usdPrice`
   */
  usdPrice: number

  /**
   * 24h price change percentage (negative = price fell).
   * Returns 0 while loading or on error.
   * Used by PriceChange component to render "▼ 2.39%" in red.
   */
  change24h: number

  /** True on the first fetch before any data arrives. */
  isLoading: boolean

  /** True if the CoinGecko request failed. */
  isError: boolean
}

// --- Hook ---

export function useEthPrice(): UseEthPriceReturn {
  const { data, isLoading, isError } = useQuery<EthPriceData>({
    // Static key — this query is global, not per-wallet.
    // Every component that calls useEthPrice() shares the same cache entry.
    queryKey: ['ethPrice'],

    queryFn: async (): Promise<EthPriceData> => {
      const response = await fetch(COINGECKO_ETH_PRICE_URL)

      if (!response.ok) {
        throw new Error(
          `CoinGecko fetch failed: ${response.status} ${response.statusText}`
        )
      }

      const json = (await response.json()) as CoinGeckoResponse

      return {
        usdPrice:  json.ethereum.usd,
        change24h: json.ethereum.usd_24h_change,
      }
    },

    // Treat the price as fresh for PRICE_CACHE_DURATION_MS.
    // No RPC calls involved — a 60-second cache is more than adequate.
    staleTime:       PRICE_CACHE_DURATION_MS,
    refetchInterval: PRICE_CACHE_DURATION_MS,

    // Retry twice on failure before settling into isError state.
    // CoinGecko's free tier occasionally rate-limits — a brief retry
    // is usually sufficient.
    retry:      2,
    retryDelay: 3_000,

    // Keep the previous price visible between refetches so the USD
    // balance does not flicker to $0.00 on every 60-second refresh.
    placeholderData: (prev: EthPriceData | undefined) => prev,
  })

  return {
    priceData: data,
    usdPrice:  data?.usdPrice  ?? 0,
    change24h: data?.change24h ?? 0,
    isLoading,
    isError,
  }
}