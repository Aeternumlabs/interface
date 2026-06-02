/**
 * config/site.ts
 *
 * Static site-wide configuration:
 * metadata, sidebar navigation structure, and external links.
 *
 * The sidebar navigation is defined here so the Sidebar and MobileDrawer
 * components both render from the same single source of truth.
 */

// --- Metadata ---

export const siteConfig = {
  name: 'Aeternum',
  tagline: 'Trustless smart wallet vault with automated ETH recovery.',
  description:
    'Trustless, automated funds recovery for your Ethereum assets. ' +
    'Store and transact safely, like a normal wallet, and set up an inactivity-based backup plan ' +
    'that protects your funds if you ever go dark.',
  url: 'https://aeternumvault.xyz',
  ogImage: '/og-image.png',
} as const

// --- Navigation item types ---

/**
 * A sidebar nav item that navigates to an internal route.
 */
export interface NavItemRoute {
  kind: 'route'
  label: string
  href: string
  icon: string            // icon name — matched in SidebarNavItem to the correct Lucide icon
}

/**
 * A sidebar nav item that opens a modal instead of navigating.
 * The modal value maps to ActiveModal in types/vault.ts.
 */
export interface NavItemModal {
  kind: 'modal'
  label: string
  modal: 'updateConfig' | 'withdraw' | 'cancelRecovery'
  icon: string
}

/**
 * A sidebar nav item that links to an external URL (opens in new tab).
 */
export interface NavItemExternal {
  kind: 'external'
  label: string
  href: string
  icon: string
}

export type NavItem = NavItemRoute | NavItemModal | NavItemExternal

/**
 * A group of nav items rendered together in the sidebar.
 * label is the small section heading (e.g. "explore", "Insight").
 * Unlabelled groups pass an empty string.
 */
export interface NavGroup {
  label: string
  items: NavItem[]
}

// --- Sidebar navigation ---

/**
 * Full sidebar navigation structure.
 * Matches exactly what is visible in the Figma design:
 *
 * Group 1 (unlabelled):    Vault, Activity
 * Group 2 ("explore"):     Update config, Withdraw balance, Cancel recovery
 * Group 3 ("Insight"):     Protocol, Documentation
 */
export const sidebarNavGroups: NavGroup[] = [
  {
    label: '',
    items: [
      {
        kind: 'route',
        label: 'Vault',
        href: '/vault',
        icon: 'vault',
      },
      {
        kind: 'route',
        label: 'Activity',
        href: '/vault/activity',
        icon: 'activity',
      },
    ],
  },
  {
    label: 'explore',
    items: [
      {
        kind: 'modal',
        label: 'Update config',
        modal: 'updateConfig',
        icon: 'settings',
      },
      {
        kind: 'modal',
        label: 'Withdraw balance',
        modal: 'withdraw',
        icon: 'arrowUpFromLine',
      },
      {
        kind: 'modal',
        label: 'Cancel recovery',
        modal: 'cancelRecovery',
        icon: 'x',
      },
    ],
  },
  {
    label: 'Insight',
    items: [
      {
        kind: 'external',
        label: 'Protocol',
        href: 'https://github.com/Aeternumlabs/aeternum-core',
        icon: 'globe',
      },
      {
        kind: 'external',
        label: 'Documentation',
        href: 'https://github.com/Aeternumlabs/aeternum-docs',
        icon: 'fileText',
      },
    ],
  },
]

// --- External links ---

/**
 * All external URLs used across the app.
 * Centralised here so they are easy to update in one place.
 */
export const externalLinks = {
  github: 'https://github.com/Aeternumlabs/aeternum-core',
  docs: '/docs/Aeternum-core_technical_doc.pdf',
  audit: '/audits/2026-05-04_Aeternum-core_audit.pdf',
  chainlinkAutomation: 'https://automation.chain.link',
  sepoliaFaucet: 'https://faucets.chain.link',
  coingecko: 'https://www.coingecko.com/en/coins/ethereum',
} as const

// --- Price feed ---

/**
 * CoinGecko simple price endpoint.
 * Used by useEthPrice() to fetch ETH/USD and 24h change.
 * Free tier — no API key required.
 */
export const COINGECKO_ETH_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'

/**
 * How long to cache the price before re-fetching (milliseconds).
 * 60 seconds is a reasonable balance for an MVP.
 */
export const PRICE_CACHE_DURATION_MS = 60_000