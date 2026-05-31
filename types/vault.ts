/**
 * types/vault.ts
 *
 * All TypeScript types for the Aeternum vault.
 * Mirrors the AeternumVault.sol contract structs and events exactly.
 * viem returns uint256 as bigint and address as `0x${string}`.
 */

// --- Contract struct ---

/**
 * Direct mirror of the RecoveryConfig struct in AeternumVault.sol.
 * Field names and types match what wagmi/viem returns from getRecoveryConfig().
 */
export interface RecoveryConfig {
  backupAddress: `0x${string}`
  inactivityPeriod: bigint        // seconds
  lastActivity: bigint            // unix timestamp (seconds)
  balance: bigint                 // wei
  isActive: boolean
  failedRecoveryAttempts: number  // uint8 in contract
  isAbandoned: boolean
}

// --- Vault state ---

/**
 * Derived from RecoveryConfig + wallet connection state.
 * Drives what the dashboard renders in each section.
 *
 * unregistered  → wallet connected, no vault registered
 * active        → wallet connected, vault registered and active
 * abandoned     → wallet connected, vault exceeded MAX_RECOVERY_ATTEMPTS
 * loading       → contract read in flight, skeleton shown
 */
export type VaultStatus = 'unregistered' | 'active' | 'abandoned' | 'loading'

// --- Action button row ---

/**
 * Controls the toggle in BalanceCard between the Register button
 * and the Deposit / Send / Ping trio.
 *
 * register  → vault unregistered, show single Register button
 * actions   → vault registered, show Deposit + Send + Ping
 */
export type ActionButtonState = 'register' | 'actions'

// --- Countdown ---

/**
 * Returned by useCountdown().
 * Maps to the 4 display units in CountdownBox:
 * [256 DAYS] [7 HRS] [32 MINS] [22 SECS]
 */
export interface CountdownBreakdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean    // true when inactivity period has fully elapsed
}

// --- Transaction history ---

/**
 * Every contract event that can appear in the Transaction history card.
 * Sourced from contract event logs filtered by connected wallet address.
 */
export type TransactionType =
  | 'registered'           // RecoveryRegistered
  | 'deposited'            // Deposited
  | 'sent'                 // Sent
  | 'withdrawn'            // Withdrawn
  | 'pinged'               // ActivityPinged
  | 'backupUpdated'        // BackupAddressUpdated
  | 'periodUpdated'        // InactivityPeriodUpdated
  | 'recoveryExecuted'     // RecoveryExecuted
  | 'recoveryFailed'       // RecoveryFailed
  | 'recoveryCancelled'    // RecoveryCancelled
  | 'recoveryAbandoned'    // RecoveryAbandoned

export interface TransactionEvent {
  id: string                    // Unique identifier from indexer (hash-logIndex)
  type: TransactionType
  txHash?: `0x${string}`        // Optional: Not returned by default Ponder setup
  blockNumber: bigint
  timestamp: number | bigint    // Accepts Ponder's bigint or traditional unix number
  amount?: bigint               // wei — present on deposited / sent / withdrawn / recoveryExecuted
  toAddress?: `0x${string}`     // present on sent / recoveryExecuted
}

// --- Balance chart ---

/**
 * Time range options for the chart panel selector.
 * Matches the tab labels visible in the desktop design: 1D | 1W | 1M | 6M | 1Y | ALL
 */
export type TimeRange = '1D' | '1W' | '1M' | '6M' | '1Y' | 'ALL'

/**
 * Single data point fed into BalanceChart (Recharts LineChart).
 * balanceEth is used as the Y axis value.
 * balanceUsd is shown in the tooltip.
 */
export interface ChartDataPoint {
  timestamp: number       // unix seconds — X axis
  balanceEth: number      // converted from wei for chart rendering
  balanceUsd: number      // balanceEth × ETH/USD price at that timestamp
}

// --- ETH price feed ---

/**
 * Returned by useEthPrice().
 * Sourced from CoinGecko simple price endpoint, cached for 60 seconds.
 * Drives USDAmount and PriceChange components.
 */
export interface EthPriceData {
  usdPrice: number        // current ETH/USD price
  change24h: number       // 24h percentage change — negative = red, positive = green
}

// --- Top assets ---

/**
 * Single row in the Top assets card.
 * MVP: only one entry (Sepolia Ether / ETH).
 * Designed to extend to ERC-20 tokens in Phase 2.
 */
export interface AssetEntry {
  symbol: string           // e.g. "ETH"
  name: string             // e.g. "Sepolia Ether"
  balanceRaw: bigint       // wei
  balanceFormatted: string // e.g. "0.01"
  usdValue: number         // balanceFormatted × usdPrice
  change24h: number        // from price feed
  iconUrl?: string         // token icon — defaults to ETH logo for MVP
}

// --- Modal state ---

/**
 * Which modal is currently open.
 * null means no modal is open.
 * Driven by sidebar nav item clicks and action button clicks.
 */
export type ActiveModal =
  | 'register'
  | 'deposit'
  | 'send'
  | 'updateConfig'
  | 'withdraw'
  | 'cancelRecovery'
  | null