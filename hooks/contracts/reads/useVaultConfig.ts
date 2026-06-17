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
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
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
  const queryClient = useQueryClient()

  // Clear cached data when wallet disconnects to revert UI to pre-connected state
  useEffect(() => {
    if (!isConnected) {
      queryClient.removeQueries({ queryKey: ['readContract', address, chainId] })
    }
  }, [isConnected, address, chainId, queryClient])

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
      staleTime: 0, // Clear data immediately when wallet disconnects
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