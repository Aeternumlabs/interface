/**
 * hooks/contracts/reads/useTimeUntilRecovery.ts
 *
 * Derives the absolute timestamp when recovery becomes eligible.
 * Eliminates countdown drift by calculating directly from stable config parameters.
 */

import { useMemo } from 'react'
import { useVaultConfig } from './useVaultConfig'

export interface UseTimeUntilRecoveryReturn {
  deadlineUnix: number
  secondsRemaining: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useTimeUntilRecovery(): UseTimeUntilRecoveryReturn {
  const { config, isLoading, isError, refetch } = useVaultConfig()

  // Pull primitives out first to satisfy the linter and prevent object-reference re-runs
  const isActive = config?.isActive
  const lastActivity = config?.lastActivity
  const inactivityPeriod = config?.inactivityPeriod
  const balance = config?.balance

  const deadlineUnix = useMemo(() => {
    // Check the individual extracted primitives
    if (!isActive || !lastActivity || !inactivityPeriod || !balance) {
      return 0
    }

    return Number(lastActivity) + Number(inactivityPeriod)
  }, [isActive, lastActivity, inactivityPeriod, balance])

  const secondsRemaining =
    deadlineUnix > 0
      ? Math.max(0, deadlineUnix - Math.floor(Date.now() / 1000))
      : 0

  return {
    deadlineUnix,
    secondsRemaining,
    isLoading,
    isError,
    refetch,
  }
}