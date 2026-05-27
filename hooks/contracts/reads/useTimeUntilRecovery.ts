/**
 * hooks/contracts/reads/useTimeUntilRecovery.ts
 *
 * Returns the Unix timestamp when recovery becomes eligible, derived from
 * the vault config rather than from a direct getTimeUntilRecovery() call.
 *
 * WHY THIS APPROACH ELIMINATES THE GLITCH
 * ─────────────────────────────────────────
 * The previous implementation called getTimeUntilRecovery() on the contract
 * and computed:
 *
 *   deadlineUnix = Math.floor(dataUpdatedAt / 1000) + Number(data)
 *
 * getTimeUntilRecovery returns (deadline - block.timestamp). block.timestamp
 * is the miner's clock, which can differ from the wall clock by ±1–2 seconds
 * per block. So even with the useMemo fix, deadlineUnix shifted by 1–2 seconds
 * on every 12-second poll — causing the visible jumps at 12 s, 24 s, 36 s …
 *
 * FIX: compute the deadline directly from the two stable on-chain values:
 *
 *   deadlineUnix = lastActivity + inactivityPeriod
 *
 * lastActivity and inactivityPeriod are stored in the contract's RecoveryConfig
 * struct. They only change when the user explicitly interacts (deposit, ping,
 * updateInactivityPeriod, etc.). They do NOT change on every block poll.
 * Between interactions the deadline is completely stable → zero poll-glitches.
 *
 * useVaultConfig already polls every 12 s, so we get the data for free and
 * avoid a second RPC call to getTimeUntilRecovery entirely.
 *
 * ZERO-DISPLAY RULES
 * ───────────────────
 * deadlineUnix = 0 (CountdownDisplay renders "0 · 0 · 0 · 0") when:
 *   • wallet not connected        (config is undefined)
 *   • vault not registered        (config.isActive = false)
 *   • vault registered, no funds  (config.balance = 0)
 *
 * "Recovery due" is shown only when the vault is active, has funds, AND
 * the deadline has genuinely passed — see CountdownDisplay.tsx.
 */

import { useMemo }         from 'react'
import { useVaultConfig }  from './useVaultConfig'

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UseTimeUntilRecoveryReturn {
  /**
   * Absolute Unix timestamp (seconds) when recovery becomes eligible.
   * 0 means "no active countdown" — see zero-display rules above.
   * Stable between user interactions (no poll-driven drift).
   */
  deadlineUnix: number

  /**
   * Seconds remaining until deadlineUnix, computed at call time.
   * Provided for convenience; CountdownDisplay uses deadlineUnix directly
   * so useCountdown can recompute this on every second tick.
   */
  secondsRemaining: number

  /** True while useVaultConfig is loading for the first time. */
  isLoading: boolean

  /** True if the underlying contract read failed. */
  isError: boolean

  /** Manually re-read vault config (called after write tx confirms). */
  refetch: () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTimeUntilRecovery(): UseTimeUntilRecoveryReturn {
  // Piggyback on useVaultConfig which is already mounted in BalanceCard.
  // TanStack Query deduplicates the underlying RPC call — no extra request.
  const { config, isLoading, isError, refetch } = useVaultConfig()

  const deadlineUnix = useMemo(() => {
    // Guard: require an active vault with a non-zero balance.
    // An active vault with zero balance will never trigger recovery
    // (the contract checks balance > 0 before executing), so we treat
    // it the same as unregistered for display purposes.
    if (
      !config         ||
      !config.isActive ||
      config.balance === 0n ||
      !config.lastActivity ||
      !config.inactivityPeriod
    ) {
      return 0
    }

    // lastActivity (uint256, seconds) + inactivityPeriod (uint256, seconds)
    // = the exact Unix timestamp when Chainlink can trigger recovery.
    // Both are stored on-chain and only change on user interaction.
    return Number(config.lastActivity) + Number(config.inactivityPeriod)
  }, [
    config?.isActive,
    config?.balance,
    config?.lastActivity,
    config?.inactivityPeriod,
  ])

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