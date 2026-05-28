/**
 * hooks/useVaultTransactions.ts
 *
 * Fetches vault event logs for the connected wallet and returns typed
 * TransactionEvent rows for TransactionList.
 *
 * Uses a single bounded getLogs call (see lib/eventLogs.ts) instead of
 * eleven parallel scans from genesis — avoids common Alchemy / public RPC
 * failures on Sepolia.
 */

import { useQuery } from '@tanstack/react-query'
import { usePublicClient, useAccount, useChainId } from 'wagmi'
import { getVaultAddress } from '@/lib/contracts'
import {
  fetchVaultEventLogs,
  eventMatchesWallet,
  type ParsedVaultEvent,
} from '@/lib/eventLogs'
import { EVENTS_POLL_INTERVAL_MS } from '@/lib/constants' // Removed TRANSACTION_PAGE_SIZE
import type { TransactionEvent, TransactionType } from '@/types'

// --- Contract event name → TransactionType ---

const EVENT_NAME_TO_TYPE: Record<string, TransactionType> = {
  RecoveryRegistered:     'registered',
  Deposited:              'deposited',
  Sent:                   'sent',
  Withdrawn:              'withdrawn',
  ActivityPinged:         'pinged',
  BackupAddressUpdated:   'backupUpdated',
  InactivityPeriodUpdated: 'periodUpdated',
  RecoveryExecuted:       'recoveryExecuted',
  RecoveryFailed:         'recoveryFailed',
  RecoveryCancelled:      'recoveryCancelled',
  RecoveryAbandoned:      'recoveryAbandoned',
}

function mapEventToTransaction(
  event: ParsedVaultEvent,
  blockTimestamps: Map<bigint, number>,
): TransactionEvent | null {
  const type = EVENT_NAME_TO_TYPE[event.eventName]
  if (!type) return null

  const blockNumber = event.blockNumber ?? 0n
  const timestamp = blockNumber
    ? (blockTimestamps.get(blockNumber) ?? 0)
    : 0

  const args = event.args as Record<string, unknown>

  let amount: bigint | undefined
  if (typeof args.amount === 'bigint') amount = args.amount
  if (typeof args.refundAmount === 'bigint') amount = args.refundAmount
  if (typeof args.balance === 'bigint') amount = args.balance

  let toAddress: `0x${string}` | undefined
  if (typeof args.to === 'string') toAddress = args.to as `0x${string}`
  if (typeof args.backupAddress === 'string' && type !== 'registered') {
    toAddress = args.backupAddress as `0x${string}`
  }

  return {
    type,
    txHash:      event.transactionHash ?? '0x0',
    blockNumber,
    timestamp,
    amount,
    toAddress,
  }
}

// --- Return type ---

export interface UseVaultTransactionsReturn {
  transactions: TransactionEvent[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

// --- Hook ---

export function useVaultTransactions(limit?: number): UseVaultTransactionsReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const publicClient             = usePublicClient()
  const contractAddress          = getVaultAddress(chainId)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vaultTransactions', address, chainId],

    queryFn: async (): Promise<TransactionEvent[]> => {
      if (!address || !publicClient || !contractAddress) return []

      const decoded = await fetchVaultEventLogs(
        publicClient,
        contractAddress,
        chainId,
      )

      const walletEvents = decoded.filter((event) =>
        eventMatchesWallet(event, address),
      )

      if (walletEvents.length === 0) return []

      const uniqueBlocks = [
        ...new Set(
          walletEvents
            .map((e) => e.blockNumber)
            .filter((bn): bn is bigint => bn !== null && bn !== undefined),
        ),
      ]

      const blockTimestamps = new Map<bigint, number>()

      await Promise.all(
        uniqueBlocks.map(async (blockNumber) => {
          try {
            const block = await publicClient.getBlock({ blockNumber })
            blockTimestamps.set(blockNumber, Number(block.timestamp))
          } catch {
            blockTimestamps.set(blockNumber, 0)
          }
        }),
      )

      const events = walletEvents
        .map((event) => mapEventToTransaction(event, blockTimestamps))
        .filter((e): e is TransactionEvent => e !== null)

      events.sort((a, b) => {
        const diff = b.blockNumber - a.blockNumber
        if (diff > 0n) return 1
        if (diff < 0n) return -1
        return 0
      })

      // Return ALL events to cache them globally
      return events
    },

    enabled: isConnected && !!address && !!contractAddress && !!publicClient,

    refetchInterval: EVENTS_POLL_INTERVAL_MS,
    retry: 2,
    retryDelay: 2_000,

    placeholderData: (prev: TransactionEvent[] | undefined) => prev,
  })

  // Derive the sliced array based on the limit requested by the component
  const allTransactions = data ?? []
  const displayedTransactions = limit ? allTransactions.slice(0, limit) : allTransactions

  return {
    transactions: displayedTransactions,
    isLoading,
    isError,
    refetch,
  }
}