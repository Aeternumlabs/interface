/**
 * hooks/contracts/reads/useIsRegistered.ts
 *
 * Calls isRegistered(address) on the contract and returns a boolean.
 *
 * This is the hook that drives the ActionButtonRow toggle:
 *   false → render <RegisterButton />      (single Register pill)
 *   true  → render <VaultActions />         (Deposit | Send | Ping)
 *
 * It is intentionally kept separate from useVaultConfig so that
 * ActionButtonRow can stay lightweight — it needs one boolean, not the
 * full config struct. wagmi's React Query layer deduplicates the RPC call
 * if both hooks are mounted simultaneously on the same page.
 *
 * Returns:
 *   isRegistered — boolean, false while loading or on error
 *   isLoading    — true on first fetch
 *   isError      — true if the contract read failed
 */

import { useReadContract, useAccount, useChainId } from 'wagmi'
import { getVaultContract } from '@/lib/contracts'
import { VAULT_POLL_INTERVAL_MS } from '@/lib/constants'

// --- Return type ---

export interface UseIsRegisteredReturn {
  /**
   * True when the connected wallet has an active vault registered.
   * Defaults to false while loading, on error, or when no wallet is connected.
   * Safe to use directly in conditional renders without null checks.
   */
  isRegistered: boolean

  /** True on the first fetch before any data arrives. */
  isLoading: boolean

  /** True if the contract read threw an error. */
  isError: boolean
}

// --- Hook ---

export function useIsRegistered(): UseIsRegisteredReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const contract                 = getVaultContract(chainId)

  const { data, isLoading, isError } = useReadContract({
    ...contract,
    functionName: 'isRegistered',
    args:         [address as `0x${string}`],

    query: {
      // Disabled until the wallet is connected and contract address is known.
      enabled: isConnected && !!address && !!contract.address,

      // Poll on the same interval as useVaultConfig so the toggle stays
      // in sync with the full config state.
      refetchInterval: VAULT_POLL_INTERVAL_MS,

      // Never show a stale false while re-fetching — keep the last value.
      placeholderData: (prev: boolean | undefined) => prev,
    },
  })

  return {
    // Default to false rather than undefined so ActionButtonRow can render
    // the Register button immediately without an extra null guard.
    isRegistered: data ?? false,
    isLoading,
    isError,
  }
}