/**
 * hooks/contracts/reads/useTimeUntilRecovery.ts
 *
 * Calls getTimeUntilRecovery(address) on the contract and returns the
 * seconds remaining before recovery can be triggered.
 *
 * This hook provides the seed value for the live countdown in CountdownDisplay.
 * The contract returns a uint256 snapshot of seconds remaining at read time.
 * * To prevent the countdown from shifting or resetting on component re-renders,
 * the `deadlineUnix` timestamp is anchored to TanStack Query's `dataUpdatedAt` 
 * value rather than a moving `Date.now()`. This ensures a perfectly stable 
 * timestamp between block-polling intervals.
 *
 * The actual tick-by-tick countdown is handled separately by useCountdown(),
 * which takes this stable deadline timestamp and decrements locally every second —
 * so the UI stays live between contract polls without hammering the RPC.
 *
 * How CountdownDisplay consumes this:
 * 1. useTimeUntilRecovery()  →  secondsRemaining (snapshot from contract)
 * 2. useTimeUntilRecovery()  →  deadlineUnix (anchored smoothly via dataUpdatedAt)
 * 3. useCountdown(deadline)  →  ticks every second, feeds CountdownBox units
 *
 * Returns:
 * secondsRemaining — number of seconds until recovery, 0 if already due
 * deadlineUnix     — stable absolute unix timestamp when recovery triggers
 * isLoading        — true on first fetch
 * isError          — true if the contract read failed
 * refetch          — manually re-read (e.g. after a ping transaction confirms)
 */

// hooks/contracts/reads/useTimeUntilRecovery.ts

import { useReadContract, useAccount, useChainId } from 'wagmi'
import { getVaultContract } from '@/lib/contracts'
import { VAULT_POLL_INTERVAL_MS } from '@/lib/constants'

export interface UseTimeUntilRecoveryReturn {
  secondsRemaining: number
  deadlineUnix: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useTimeUntilRecovery(): UseTimeUntilRecoveryReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const contract                 = getVaultContract(chainId)

  // 1. Destructure dataUpdatedAt (timestamp in ms when the RPC response arrived)
  const { data, dataUpdatedAt, isLoading, isError, refetch } = useReadContract({
    ...contract,
    functionName: 'getTimeUntilRecovery',
    args:         [address as `0x${string}`],

    query: {
      enabled: isConnected && !!address && !!contract.address,
      refetchInterval: VAULT_POLL_INTERVAL_MS,
      placeholderData: (prev: bigint | undefined) => prev,
    },
  })

  const secondsRemaining = data !== undefined ? Number(data) : 0

  // 2. Change Math.floor(Date.now() / 1000) to use dataUpdatedAt instead
  const deadlineUnix = secondsRemaining > 0 && dataUpdatedAt > 0
    ? Math.floor(dataUpdatedAt / 1000) + secondsRemaining
    : 0

  return {
    secondsRemaining,
    deadlineUnix,
    isLoading,
    isError,
    refetch,
  }
}