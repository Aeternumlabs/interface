/**
 * lib/constants.ts
 *
 * All hard-coded constant values used across the app.
 *
 * Rule: if a value appears in more than one file, it belongs here.
 * Nothing in this file has side effects or imports from other project files.
 *
 * Grouped into:
 *   1. Contract constants    — mirrors immutable values in AeternumVault.sol
 *   2. Address constants     — well-known addresses used as sentinels
 *   3. API constants         — external data endpoints and cache settings
 *   4. UI constants          — polling intervals, pagination, display limits
 *   5. Chain constants       — chain IDs used without importing config/chains.ts
 */

// 1. --- Contract constants ---

/** Mainnet minimum inactivity period: 180 days in seconds */
export const MIN_INACTIVITY_PERIOD_SECONDS = 180 * 24 * 60 * 60   // 15_552_000

/** Mainnet maximum inactivity period: 3650 days (10 years) in seconds */
export const MAX_INACTIVITY_PERIOD_SECONDS = 3650 * 24 * 60 * 60  // 315_360_000

/** Minimum inactivity period expressed in days — used for slider bounds */
export const MIN_INACTIVITY_PERIOD_DAYS = 180

/** Maximum inactivity period expressed in days — used for slider bounds */
export const MAX_INACTIVITY_PERIOD_DAYS = 3650

/**
 * Maximum consecutive failed recovery attempts before a vault is abandoned.
 */
export const MAX_RECOVERY_ATTEMPTS = 3

/**
 * Sepolia testnet minimum inactivity period: 5 minutes in seconds.
 * Lowered from 10 minutes to support ultra-fast testing flows.
 */
export const SEPOLIA_MIN_INACTIVITY_PERIOD_SECONDS = 5 * 60        // 300

/** Sepolia maximum inactivity period: 3650 days (10 years) in seconds */
export const SEPOLIA_MAX_INACTIVITY_PERIOD_SECONDS = 3650 * 24 * 60 * 60

// 2. --- Address constants ---
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

// 3. --- API constants ---
export const COINGECKO_ETH_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'
export const PRICE_CACHE_DURATION_MS = 60_000
export const CONTRACT_STALE_TIME_MS = 4_000

// 4. --- UI constants ---
export const VAULT_POLL_INTERVAL_MS = 12_000
export const EVENTS_POLL_INTERVAL_MS = 30_000
export const TRANSACTION_PAGE_SIZE = 20
export const EVENT_HISTORY_BLOCK_RANGE = BigInt(50_400)
export const ETH_DISPLAY_DECIMALS = 4
export const ADDRESS_INPUT_DEBOUNCE_MS = 400
export const COUNTDOWN_TICK_MS = 1_000

// 5. --- Chain constants ---
export const MAINNET_CHAIN_ID = 1
export const SEPOLIA_CHAIN_ID = 11155111