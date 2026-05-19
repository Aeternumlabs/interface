/**
 * hooks/useVaultTransactions.ts
 *
 * Fetches all AeternumVault contract event logs emitted by the connected
 * wallet address and returns them as a typed TransactionEvent array for
 * the TransactionList component inside TransactionHistoryCard.
 *
 * Approach:
 *   - Uses usePublicClient() from wagmi to get the viem public client
 *   - Fetches all 11 event types in parallel via Promise.all
 *   - Each call is filtered by the connected wallet address (indexed param)
 *   - Block timestamps are batch-fetched for unique block numbers
 *   - Results are combined, sorted newest-first, and sliced to page size
 *   - Wrapped in TanStack Query (useQuery) for caching and polling
 *
 * Events fetched (all have `wallet` as the first indexed parameter):
 *   RecoveryRegistered, Deposited, Sent, Withdrawn, ActivityPinged,
 *   BackupAddressUpdated, InactivityPeriodUpdated, RecoveryExecuted,
 *   RecoveryFailed, RecoveryCancelled, RecoveryAbandoned
 *
 * Returns:
 *   transactions — TransactionEvent[] sorted newest first, capped at page size
 *   isLoading    — true on the first fetch
 *   isError      — true if the RPC call failed
 *   refetch      — manually re-fetch (called after write tx confirms)
 */

import { useQuery }        from '@tanstack/react-query'
import { parseAbiItem }    from 'viem'
import { usePublicClient, useAccount, useChainId } from 'wagmi'
import { getVaultAddress } from '@/lib/contracts'
import { EVENTS_POLL_INTERVAL_MS, TRANSACTION_PAGE_SIZE } from '@/lib/constants'
import type { TransactionEvent, TransactionType } from '@/types'

// --- Event ABI definitions ---
//
// Defined at module level so they are not re-parsed on every render.
// Each matches exactly the corresponding event signature in AeternumVault.sol.

const EV_REGISTERED     = parseAbiItem('event RecoveryRegistered(address indexed wallet, address indexed backupAddress, uint256 inactivityPeriod)')
const EV_DEPOSITED      = parseAbiItem('event Deposited(address indexed wallet, uint256 amount)')
const EV_SENT           = parseAbiItem('event Sent(address indexed wallet, address indexed to, uint256 amount)')
const EV_WITHDRAWN      = parseAbiItem('event Withdrawn(address indexed wallet, uint256 amount)')
const EV_PINGED         = parseAbiItem('event ActivityPinged(address indexed wallet, uint256 timestamp)')
const EV_BACKUP_UPDATED = parseAbiItem('event BackupAddressUpdated(address indexed wallet, address indexed newBackupAddress)')
const EV_PERIOD_UPDATED = parseAbiItem('event InactivityPeriodUpdated(address indexed wallet, uint256 newPeriod)')
const EV_EXECUTED       = parseAbiItem('event RecoveryExecuted(address indexed wallet, address indexed backupAddress, uint256 amount)')
const EV_FAILED         = parseAbiItem('event RecoveryFailed(address indexed wallet, address indexed backupAddress, uint256 amount)')
const EV_CANCELLED      = parseAbiItem('event RecoveryCancelled(address indexed wallet, uint256 refundAmount)')
const EV_ABANDONED      = parseAbiItem('event RecoveryAbandoned(address indexed wallet, address indexed backupAddress, uint256 balance)')

// --- Return type ---

export interface UseVaultTransactionsReturn {
  /** Sorted newest-first, capped at TRANSACTION_PAGE_SIZE. Empty while loading. */
  transactions: TransactionEvent[]

  /** True on the very first fetch before any data arrives. */
  isLoading: boolean

  /** True if the getLogs calls failed (e.g. RPC error or rate limit). */
  isError: boolean

  /** Manually re-fetch — call this after any write tx confirms. */
  refetch: () => void
}

// --- Hook ---

export function useVaultTransactions(): UseVaultTransactionsReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const publicClient             = usePublicClient()
  const contractAddress          = getVaultAddress(chainId)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vaultTransactions', address, chainId],

    queryFn: async (): Promise<TransactionEvent[]> => {
      if (!address || !publicClient || !contractAddress) return []

      // --- Common params shared across all getLogs calls
      const baseParams = {
        address: contractAddress,
        // fromBlock: 0n covers all history from genesis.
        // For mainnet, replace with the contract deployment block number
        // (e.g. 19_500_000n) to avoid scanning unnecessary blocks.
        fromBlock: 0n,
        toBlock:   'latest' as const,
      }

      // All events use { wallet: address } as the indexed arg filter.
      const walletFilter = { wallet: address }

      // --- Fetch all event types in parallel
      const [
        registeredLogs,
        depositedLogs,
        sentLogs,
        withdrawnLogs,
        pingedLogs,
        backupUpdatedLogs,
        periodUpdatedLogs,
        executedLogs,
        failedLogs,
        cancelledLogs,
        abandonedLogs,
      ] = await Promise.all([
        publicClient.getLogs({ ...baseParams, event: EV_REGISTERED,     args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_DEPOSITED,      args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_SENT,           args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_WITHDRAWN,      args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_PINGED,         args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_BACKUP_UPDATED, args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_PERIOD_UPDATED, args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_EXECUTED,       args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_FAILED,         args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_CANCELLED,      args: walletFilter }),
        publicClient.getLogs({ ...baseParams, event: EV_ABANDONED,      args: walletFilter }),
      ])

      // --- Tag each log with type TransactionType
      // This tells TypeScript that the collection contains valid viem logs,
      // regardless of their individual event definitions.
      type TaggedLog = {
        log: any
        type: TransactionType
      }

      const tagged: TaggedLog[] = [
        ...registeredLogs.map(log => ({ log, type: 'registered'       as TransactionType })),
        ...depositedLogs.map(log   => ({ log, type: 'deposited'       as TransactionType })),
        ...sentLogs.map(log        => ({ log, type: 'sent'            as TransactionType })),
        ...withdrawnLogs.map(log   => ({ log, type: 'withdrawn'       as TransactionType })),
        ...pingedLogs.map(log      => ({ log, type: 'pinged'          as TransactionType })),
        ...backupUpdatedLogs.map(log  => ({ log, type: 'backupUpdated'  as TransactionType })),
        ...periodUpdatedLogs.map(log  => ({ log, type: 'periodUpdated'  as TransactionType })),
        ...executedLogs.map(log    => ({ log, type: 'recoveryExecuted' as TransactionType })),
        ...failedLogs.map(log      => ({ log, type: 'recoveryFailed'   as TransactionType })),
        ...cancelledLogs.map(log   => ({ log, type: 'recoveryCancelled' as TransactionType })),
        ...abandonedLogs.map(log   => ({ log, type: 'recoveryAbandoned' as TransactionType })),
      ]

      if (tagged.length === 0) return []

      // --- Fetch block timestamps for unique block numbers
      //
      // Each log has a blockNumber. We collect unique block numbers and fetch
      // their timestamps in one parallel batch — far cheaper than fetching a
      // block per log when multiple events share the same block.
      const uniqueBlocks = [
        ...new Set(
          tagged
            .map(t => t.log.blockNumber)
            .filter((bn): bn is bigint => bn !== null)
        ),
      ]

      const blockTimestamps = new Map<bigint, number>()

      await Promise.all(
        uniqueBlocks.map(async (blockNumber) => {
          try {
            const block = await publicClient.getBlock({ blockNumber })
            blockTimestamps.set(blockNumber, Number(block.timestamp))
          } catch {
            // If a single block fetch fails, use 0 as the timestamp fallback.
            // The transaction will still appear — just without an accurate date.
            blockTimestamps.set(blockNumber, 0)
          }
        })
      )

      // --- Map each tagged log to a TransactionEvent
      const events: TransactionEvent[] = tagged.map(({ log, type }) => {
        const timestamp = log.blockNumber
          ? (blockTimestamps.get(log.blockNumber) ?? 0)
          : 0

        // Extract optional fields from event args.
        // Different events carry different args — we read defensively.
        const args = (log.args ?? {}) as Record<string, unknown>

        let amount: bigint | undefined = undefined
        let toAddress: `0x${string}` | undefined = undefined

        // Amount field — varies by event name
        if (typeof args.amount       === 'bigint') amount = args.amount
        if (typeof args.refundAmount === 'bigint') amount = args.refundAmount
        if (typeof args.balance      === 'bigint') amount = args.balance

        // Destination address — Sent uses `to`, recovery events use `backupAddress`
        if (typeof args.to            === 'string') toAddress = args.to as `0x${string}`
        if (typeof args.backupAddress === 'string' && type !== 'registered') {
          toAddress = args.backupAddress as `0x${string}`
        }

        return {
          type,
          txHash:      log.transactionHash ?? '0x0',
          blockNumber: log.blockNumber     ?? 0n,
          timestamp,
          amount,
          toAddress,
        }
      })

      // --- Sort newest first and apply page size cap
      events.sort((a, b) => {
        const diff = b.blockNumber - a.blockNumber
        if (diff > 0n) return 1
        if (diff < 0n) return -1
        return 0
      })

      return events.slice(0, TRANSACTION_PAGE_SIZE)
    },

    // Only run when fully connected with a contract address to query.
    enabled: isConnected && !!address && !!contractAddress && !!publicClient,

    // Poll every 30 seconds — events are append-only so less frequent
    // than vault state polling (12s).
    refetchInterval: EVENTS_POLL_INTERVAL_MS,

    // Keep the existing list visible while a background refetch runs so
    // the TransactionList does not flash to empty between polls.
    placeholderData: (prev: TransactionEvent[] | undefined) => prev,
  })

  return {
    transactions: data ?? [],
    isLoading,
    isError,
    refetch,
  }
}