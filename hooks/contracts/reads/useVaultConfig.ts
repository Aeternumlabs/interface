/**
 * hooks/contracts/reads/useVaultConfig.ts
 *
 * Primary vault state manager. Reads the full RecoveryConfig struct 
 * directly from the smart contract via getRecoveryConfig(address).
 *
 * This provides the balance, inactivity period, and recovery status 
 * in a single, atomic network request.
 */

import { useReadContract, useAccount, useChainId } from 'wagmi'
import { getVaultContract } from '@/lib/contracts'
import { deriveVaultStatus } from '@/lib/utils'
import { VAULT_POLL_INTERVAL_MS } from '@/lib/constants'
import type { RecoveryConfig, VaultStatus } from '@/types'

export interface UseVaultConfigReturn {
  config: RecoveryConfig | undefined
  status: VaultStatus
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

export function useVaultConfig(): UseVaultConfigReturn {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const contract = getVaultContract(chainId)

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useReadContract({
    ...contract,
    functionName: 'getRecoveryConfig',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: isConnected && !!address && !!contract.address,
      refetchInterval: VAULT_POLL_INTERVAL_MS,
      // Keep data visible during background refetch to avoid UI flicker
      placeholderData: (prev) => prev,
    },
  })

  // Wagmi returns the struct as an array or object depending on configuration.
  // We cast it directly to your RecoveryConfig type.
  const config = data as RecoveryConfig | undefined

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