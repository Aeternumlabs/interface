/**
 * config/docs-nav.ts
 *
 * Documentation navigation — single source of truth for:
 *   - The /docs sidebar (DocsSidebar.tsx)
 *   - Breadcrumbs (DocsBreadcrumb.tsx)
 *   - Prev / next page links (rendered at the bottom of every doc page)
 *   - The dynamic MDX renderer (app/docs/[...slug]/page.tsx)
 *
 * Mirrors the pattern of config/site.ts:
 *   DocsNavSection   ←→  NavGroup
 *   DocsNavItem      ←→  NavItem (route-only — no modals or externals in docs)
 *
 * Slug format:
 *   Matches content/docs/[section]/[file].mdx paths exactly.
 *   Single-page sections (e.g. FAQ) use a bare slug with no subfolder.
 *   Example: 'introduction/what-is-aeternum' → content/docs/introduction/what-is-aeternum.mdx
 *
 * Adding a new doc page:
 *   1. Add a DocsNavItem entry in the correct section below.
 *   2. Create the matching .mdx file under content/docs/.
 *   Routing, sidebar, and prev/next links update automatically.
 *
 * When /docs is live, update config/site.ts:
 *   The "Documentation" entry in sidebarNavGroups (currently kind: 'external')
 *   should change to kind: 'route' with href: '/docs' to activate
 *   the in-app docs rather than the external link.
 */

// --- Types ---
export interface DocsNavItem {
  /** Displayed in the sidebar and used as the HTML <title> for the page. */
  label: string

  /**
   * Path segments relative to /docs — must match content/docs/[...slug].mdx exactly.
   * Example: 'introduction/what-is-aeternum'
   */
  slug: string

  /**
   * One-sentence summary of the page.
   * Shown in section overview cards and on hover in the sidebar.
   */
  description?: string

  /**
   * Optional visual badge rendered next to the label in the sidebar.
   *   'new'          — recently added content
   *   'coming-soon'  — placeholder page for a future phase (roadmap items)
   */
  badge?: 'new' | 'coming-soon'
}

export interface DocsNavSection {
  /** Section heading rendered above the item list in the sidebar. */
  label: string

  /**
   * Stable string key — unique across all sections.
   * Used as the React key and as the breadcrumb parent identifier.
   */
  id: string

  items: DocsNavItem[]
}

// --- Navigation tree ---
export const docsNavSections: DocsNavSection[] = [
  // --- Introduction
  {
    id: 'introduction',
    label: 'Introduction',
    items: [
      {
        label: 'What is Aeternum',
        slug: 'introduction/what-is-aeternum',
        description:
          'Protocol overview, core value proposition, and how Aeternum differs from existing wallet recovery solutions.',
      },
      {
        label: 'Quick Start',
        slug: 'introduction/quick-start',
        description:
          'Connect your wallet, register a vault, and run your first recovery test on Sepolia in under five minutes.',
      },
    ],
  },

  // --- How It Works
  {
    id: 'how-it-works',
    label: 'How It Works',
    items: [
      {
        label: 'The Vault',
        slug: 'how-it-works/the-vault',
        description:
          'How your ETH is stored, how vault isolation works, and what operations you can perform.',
      },
      {
        label: 'Inactivity Timer',
        slug: 'how-it-works/inactivity-timer',
        description:
          'How the timer starts, which interactions reset it, and how it determines when recovery triggers.',
      },
      {
        label: 'Automatic Recovery',
        slug: 'how-it-works/automatic-recovery',
        description:
          'The full recovery lifecycle — trigger conditions, failed transfer handling, and vault abandonment.',
      },
      {
        label: 'Key Actors',
        slug: 'how-it-works/key-actors',
        description:
          'The roles of the vault owner, backup address, Chainlink Automation network, and the Chainlink forwarder.',
      },
    ],
  },

  // --- Architecture
  {
    id: 'architecture',
    label: 'Architecture',
    items: [
      {
        label: 'Smart Contract',
        slug: 'architecture/smart-contract',
        description:
          'Single-contract design, the registry data structure, and per-vault isolation guarantees.',
      },
      {
        label: 'Rolling Cursor',
        slug: 'architecture/rolling-cursor',
        description:
          'How one Chainlink upkeep job monitors any number of registered wallets indefinitely without splitting jobs.',
      },
      {
        label: 'Chainlink Integration',
        slug: 'architecture/chainlink-integration',
        description:
          'checkUpkeep, performUpkeep, stale data safety pattern, and step-by-step upkeep registration.',
      },
      {
        label: 'Security Design',
        slug: 'architecture/security',
        description:
          'Reentrancy protection, forwarder access control, CEI pattern, and the immutable contract guarantee.',
      },
    ],
  },

  // --- User Guide
  {
    id: 'user-guide',
    label: 'User Guide',
    items: [
      {
        label: 'Connect Wallet',
        slug: 'user-guide/connect-wallet',
        description:
          'Supported wallets, how to connect via RainbowKit, and switching to the Sepolia test network.',
      },
      {
        label: 'Register Your Vault',
        slug: 'user-guide/register-vault',
        description:
          'Choosing a backup address, setting your inactivity period, and completing registration on-chain.',
      },
      {
        label: 'Vault Actions',
        slug: 'user-guide/vault-actions',
        description:
          'Deposit, send, withdraw, ping, update config, and cancel recovery — every action explained.',
      },
      {
        label: 'Testnet Walkthrough',
        slug: 'user-guide/testnet-walkthrough',
        description:
          'End-to-end Sepolia test: connect, register with a 5-minute timer, fund your vault, and watch automatic recovery execute.',
        badge: 'new',
      },
    ],
  },

  // --- Contract Reference
  {
    id: 'contract-reference',
    label: 'Contract Reference',
    items: [
      {
        label: 'User Functions',
        slug: 'contract-reference/user-functions',
        description:
          'All write functions — register, deposit, send, withdrawAll, ping, updateBackupAddress, updateInactivityPeriod, cancelRecovery.',
      },
      {
        label: 'Read Functions',
        slug: 'contract-reference/read-functions',
        description:
          'All view functions — isRegistered, getRecoveryConfig, isRecoveryDue, getTimeUntilRecovery, and more.',
      },
      {
        label: 'Events',
        slug: 'contract-reference/events',
        description:
          'Full event log reference for frontends, indexers, and on-chain monitoring tools.',
      },
      {
        label: 'Immutable Limits',
        slug: 'contract-reference/immutable-limits',
        description:
          'Protocol constants — minimum and maximum inactivity periods, scan window size, execution batch cap, and retry limit.',
      },
    ],
  },

  // --- Roadmap
  {
    id: 'roadmap',
    label: 'Roadmap',
    items: [
      {
        label: 'Incentivized Testnet',
        slug: 'roadmap/incentivized-testnet',
        description:
          'A structured, rewarded testing phase on Sepolia — validating the protocol under realistic multi-user load before mainnet deployment.',
        badge: 'coming-soon',
      },
      {
        label: 'Phase 1 — Mainnet Deployment',
        slug: 'roadmap/phase-1-mainnet-deployment',
        description:
          'The prerequisites, deployment sequence, and operational changes when AeternumVault goes live on Ethereum mainnet with real ETH.',
        badge: 'coming-soon',
      },
      {
        label: 'Phase 2 — Hybrid Wallet',
        slug: 'roadmap/phase-2-hybrid-wallet',
        description:
          'EIP-7702 hybrid accounts, multi-asset recovery, and passive activity detection — no manual pings required.',
        badge: 'coming-soon',
      },
      {
        label: 'Phase 3 — Multichain',
        slug: 'roadmap/phase-3-multichain',
        description:
          'Independent deployments on Base, Arbitrum One, Optimism, BNB Chain, Polygon, and zkSync.',
        badge: 'coming-soon',
      },
      {
        label: 'Phase 4 — Financial Primitive',
        slug: 'roadmap/phase-4-financial-primitive',
        description:
          'Self-custodial yield automation, programmable disbursements, and enterprise APIs — everything built on the recovery foundation.',
        badge: 'coming-soon',
      },
    ],
  },

  // --- FAQ
  {
    id: 'faq',
    label: 'FAQ',
    items: [
      {
        label: 'Frequently Asked Questions',
        slug: 'faq',
        description:
          'Common questions about custody guarantees, fees, Chainlink reliability, upgradeability, and the forwarder.',
      },
    ],
  },
] as const satisfies DocsNavSection[]

// Derived helpers
// Used by the MDX renderer, breadcrumbs, and prev/next navigation.
/**
 * Flat ordered list of every doc item across all sections.
 * Preserves the same top-to-bottom order as the sidebar.
 * Used to compute prev/next page links.
 */
export const docsNavFlat: DocsNavItem[] = docsNavSections.flatMap(
  (section) => section.items
)

/**
 * The slug of the first page in the nav tree.
 * app/docs/page.tsx redirects here so /docs always lands on a real page.
 */
export const docsDefaultSlug = docsNavSections[0].items[0].slug
// → 'introduction/what-is-aeternum'

/**
 * Looks up a DocsNavItem by its slug.
 * Returns undefined when the slug has no matching registered entry —
 * the dynamic renderer uses this to trigger a 404.
 */
export function findDocsBySlug(slug: string): DocsNavItem | undefined {
  return docsNavFlat.find((item) => item.slug === slug)
}

/**
 * Returns the section that contains the given slug.
 * Used by DocsBreadcrumb to render the parent section name.
 */
export function findSectionBySlug(slug: string): DocsNavSection | undefined {
  return docsNavSections.find((section) =>
    section.items.some((item) => item.slug === slug)
  )
}

/**
 * Returns the previous and next items relative to the given slug
 * in flat navigation order.
 *
 * Used to render the prev/next footer on every doc page.
 *
 * Example:
 *   getAdjacentDocs('how-it-works/inactivity-timer')
 *   → { prev: { slug: 'how-it-works/the-vault', … }, next: { slug: 'how-it-works/automatic-recovery', … } }
 */
export function getAdjacentDocs(slug: string): {
  prev: DocsNavItem | undefined
  next: DocsNavItem | undefined
} {
  const index = docsNavFlat.findIndex((item) => item.slug === slug)
  if (index === -1) return { prev: undefined, next: undefined }
  return {
    prev: index > 0 ? docsNavFlat[index - 1] : undefined,
    next: index < docsNavFlat.length - 1 ? docsNavFlat[index + 1] : undefined,
  }
}