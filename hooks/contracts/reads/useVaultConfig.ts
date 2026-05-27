/**
 * hooks/contracts/reads/useVaultConfig.ts
 *
 * Reads the full RecoveryConfig struct for the connected wallet
 * by calling getRecoveryConfig(address) on the contract.
 *
 * This is the primary data hook for the dashboard. Current consumers
 * include BalanceCard, TopAssetsCard, and the vault modals that display
 * current config state (UpdateConfigModal, WithdrawModal, DepositModal,
 * SendModal, CancelRecoveryModal).
 *
 * Returns:
 *   config   — raw RecoveryConfig from the contract, undefined while loading
 *   status   — derived VaultStatus ('loading' | 'unregistered' | 'active' | 'abandoned')
 *   isLoading — true on the first fetch before any data arrives
 *   isFetching — true on any background refetch (data already exists)
 *   isError   — true if the contract read failed
 *   refetch   — manually trigger a re-read (called after write tx confirms)
 */

import { useReadContract, useAccount, useChainId } from 'wagmi'
import { getVaultContract } from '@/lib/contracts'
import { deriveVaultStatus } from '@/lib/utils'
import { VAULT_POLL_INTERVAL_MS } from '@/lib/constants'
import type { RecoveryConfig, VaultStatus } from '@/types'

// --- Return type ---

export interface UseVaultConfigReturn {
  /** Raw RecoveryConfig returned by the contract. Undefined while loading. */
  config: RecoveryConfig | undefined

  /**
   * Derived vault state, safe to switch on in components.
   *
   *   'loading'      — first fetch in flight, no data yet
   *   'unregistered' — wallet connected, no vault registered
   *   'active'       — vault registered and being monitored
   *   'abandoned'    — vault exceeded MAX_RECOVERY_ATTEMPTS
   */
  status: VaultStatus

  /** True only on the very first fetch. Use isFetching for background refetches. */
  isLoading: boolean

  /** True on any refetch, including background polls. */
  isFetching: boolean

  /** True if the contract read threw an error. */
  isError: boolean

  /** Manually refetch — call this after a write transaction confirms. */
  refetch: () => void
}

// --- Hook ---

export function useVaultConfig(): UseVaultConfigReturn {
  const { address, isConnected } = useAccount()
  const chainId                  = useChainId()
  const contract                 = getVaultContract(chainId)

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useReadContract({
    ...contract,
    functionName: 'getRecoveryConfig',

    // args must always be a fixed-length tuple matching the ABI signature.
    // We pass the connected address; the query is disabled when it is absent
    // so this cast is safe — wagmi will not call the contract without args.
    args: [address as `0x${string}`],

    query: {
      // Do not fire until a wallet is connected and we have a contract address.
      // Without this guard, wagmi attempts the read with undefined args and
      // logs a console error on every page load before the user connects.
      enabled: isConnected && !!address && !!contract.address,

      // Poll every ~12 seconds (one Ethereum block).
      // Vault state only changes when a transaction is mined, so polling
      // faster than block time offers no benefit.
      refetchInterval: VAULT_POLL_INTERVAL_MS,

      // Keep the last known data visible while a background refetch runs.
      // This prevents the UI from flickering to a loading skeleton on every poll.
      placeholderData: (prev: RecoveryConfig | undefined) => prev,
    },
  })

  // wagmi infers data as the ABI tuple type. We cast to RecoveryConfig which
  // mirrors the struct field-for-field. If the ABI ever changes, TypeScript
  // will surface the mismatch here.
  const config = data as RecoveryConfig | undefined

  // Derive a clean status enum so components never repeat boolean logic.
  const status: VaultStatus = isLoading
    ? 'loading'
    : config
    ? deriveVaultStatus(config)
    : 'unregistered'

  return {
    config,
    status,
    isLoading,
    isFetching,
    isError,
    refetch,
  }
}