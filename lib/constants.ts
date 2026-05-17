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
//
// These mirror the immutable variables set in the deployed AeternumVault
// constructor. They are used in the frontend for:
//   - Form validation (period range checks before submitting the tx)
//   - PeriodSelector slider min/max bounds
//   - Display logic (showing warnings near MAX_RECOVERY_ATTEMPTS)
//
// They do NOT replace reading the live values from the contract —
// useVaultConfig() reads the real values on mount. These constants are
// used only where a contract read is not yet available (e.g. form validation
// before wallet connection) or as a fallback.

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
 * Mirrors MAX_RECOVERY_ATTEMPTS in the contract.
 * Used in VaultStatusCard to show a warning when failedRecoveryAttempts
 * is approaching this limit.
 */
export const MAX_RECOVERY_ATTEMPTS = 3

/**
 * Sepolia testnet minimum inactivity period: 10 minutes in seconds.
 * Used in the PeriodSelector when the connected chain is Sepolia,
 * so the slider lower bound matches what the contract actually enforces.
 */
export const SEPOLIA_MIN_INACTIVITY_PERIOD_SECONDS = 10 * 60       // 600

/** Sepolia maximum inactivity period: 365 days in seconds */
export const SEPOLIA_MAX_INACTIVITY_PERIOD_SECONDS = 365 * 24 * 60 * 60

// 2. --- Address constants ---

/**
 * The Ethereum zero address.
 * The contract returns this as backupAddress when a wallet is unregistered.
 * Used in isZeroAddress() and to guard rendering of backup address fields.
 */
export const ZERO_ADDRESS =
  '0x0000000000000000000000000000000000000000' as const

// 3. --- API constants ---

/**
 * CoinGecko simple price endpoint for ETH/USD.
 * Returns the current price and 24h percentage change.
 * Free tier — no API key required.
 * Used by useEthPrice() in hooks/useEthPrice.ts.
 */
export const COINGECKO_ETH_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price' +
  '?ids=ethereum&vs_currencies=usd&include_24hr_change=true'

/**
 * How long (milliseconds) to treat a fetched ETH price as fresh
 * before re-fetching. 60 seconds is a sensible balance for an MVP —
 * the price won't move meaningfully faster than this for display purposes.
 */
export const PRICE_CACHE_DURATION_MS = 60_000

/**
 * How long (milliseconds) to treat contract read data as stale.
 * Matches the staleTime set in the QueryClient in lib/wagmi.ts.
 * Exported here so individual hooks can reference a consistent value
 * if they override the global default.
 */
export const CONTRACT_STALE_TIME_MS = 4_000

// 4. --- UI constants ---

/**
 * How often (milliseconds) to poll the contract for vault state updates.
 * Used as refetchInterval in useVaultConfig() and useTimeUntilRecovery().
 * 12 seconds mirrors Ethereum's average block time — vault state only
 * changes on-chain, so polling faster than this offers no benefit.
 */
export const VAULT_POLL_INTERVAL_MS = 12_000

/**
 * How often (milliseconds) to poll for new transaction events.
 * Less frequent than vault state since events are append-only.
 */
export const EVENTS_POLL_INTERVAL_MS = 30_000

/**
 * Number of transaction events to fetch per page in TransactionList.
 * Keeping this small avoids large getLogs calls on public RPC endpoints.
 */
export const TRANSACTION_PAGE_SIZE = 20

/**
 * How many past blocks to search when fetching transaction event history.
 * ~7 days of Sepolia blocks (12s avg block time → ~50,400 blocks/week).
 * Set lower for faster initial loads on testnet.
 */
export const EVENT_HISTORY_BLOCK_RANGE = BigInt(50_400)

/**
 * The number of decimal places shown for ETH amounts throughout the app.
 * Changing this value updates all ETH displays simultaneously.
 */
export const ETH_DISPLAY_DECIMALS = 4

/**
 * The debounce delay (milliseconds) applied to address inputs in forms.
 * Prevents isValidAddress() from firing on every keystroke.
 */
export const ADDRESS_INPUT_DEBOUNCE_MS = 400

/**
 * Countdown tick interval in milliseconds.
 * 1000ms (1 second) matches the SECS unit displayed in CountdownBox.
 */
export const COUNTDOWN_TICK_MS = 1_000

// 5. --- Chain constants ---
//
// Duplicated here from config/chains.ts as plain numbers so files
// that only need a chain ID comparison (like constants-driven logic
// in hooks) do not need to import the full chain config object.

/** Ethereum mainnet chain ID */
export const MAINNET_CHAIN_ID = 1

/** Sepolia testnet chain ID */
export const SEPOLIA_CHAIN_ID = 11155111