# Aeternum App

Frontend interface for the Aeternum protocol.

This repository contains the dashboard for managing the Aeternum vault. It connects to an Ethereum contract, displays balances, tracks recovery status, and provides vault actions.

## Features

- Connect wallet with RainbowKit
- Register a vault with backup address and inactivity period
- Live recovery countdown timer
- Deposit, send, withdraw, ping, and cancel recovery actions
- Transaction history and balance chart
- Responsive desktop/mobile layout
- ETH/USD price feed from CoinGecko
- Styled with Tailwind CSS and shadcn/ui primitives

## Getting started

### Prerequisites

- Node.js 20+ recommended
- npm
- A WalletConnect project ID
- A Sepolia RPC provider URL (Alchemy, Infura, or similar)
- A deployed Aeternum contract address on Sepolia

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the example environment file and update the values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_ALCHEMY_RPC_URL`
- `NEXT_PUBLIC_INDEXER_URL`

### Run the application

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available scripts

- `npm run dev` — start the Next.js development server
- `npm run build` — build the app for production
- `npm run start` — serve the production build locally
- `npm run lint` — run ESLint checks

## Architecture overview

### `app/`

- `layout.tsx` — application shell, providers and metadata
- `globals.css` — global styling and theme tokens
- `icon.png` — app icon
- `providers.tsx` — `wagmi`, `RainbowKit`, and React Query providers
- `page.tsx` — root application entry
- `vault/layout.tsx` — layout grid for desktop and mobile
- `vault/page.tsx` — renders the main vault dashboard
- `vault/activity/page.tsx` — vault activity and history view
- `docs/` — documentation pages
  - `layout.tsx` — docs layout with sidebar
  - `page.tsx` — docs landing page
  - `[...slug]/page.tsx` — dynamic doc pages

### `components/`

- `components/layout/` — header, sidebar, mobile drawer, grid layout
- `components/vault/` — vault dashboard cards, actions, countdown, transactions, and modals
  - `VaultDashboard.tsx` — root vault page composition
  - `actions/` — action buttons and button row
  - `balance/` — balance display and asset rows
  - `cards/` — dashboard cards
  - `countdown/` — recovery timer
  - `modals/` — vault action modals
  - `transactions/` — transaction list and rows
- `components/chart/` — balance chart and range selector
- `components/common/` — shared UI pieces used throughout the app
- `components/ui/` — shadcn/ui primitives used by the interface
- `components/docs/` — documentation-specific components
  - `Callout.tsx` — callout boxes for docs
  - `DocsBreadcrumb.tsx` — breadcrumb navigation
  - `DocsHeader.tsx` — doc page headers
  - `DocsPageFooter.tsx` — doc page footer with navigation
  - `DocsSidebar.tsx` — sidebar navigation
  - `FunctionCard.tsx` — function reference cards
  - `MdxComponents.tsx` — MDX component mappings
  - `StepList.tsx` — step-by-step lists
  - `diagrams/` — diagram components

### `hooks/`

- `hooks/contracts/reads/` — read-only contract hooks
- `hooks/contracts/writes/` — contract write hooks for interactions
- `hooks/useEthPrice.ts` — CoinGecko price data
- `hooks/useVaultTransactions.ts` — transaction event history
- `hooks/useBalanceHistory.ts` — balance chart data
- `hooks/useCountdown.ts` — live countdown timer logic
- `hooks/useMounted.ts` — client-side hydration guard

### `graphql/`

- `graphql/queries.ts` — GraphQL query definitions for indexer/API operations

### `lib/`

- `lib/wagmi.ts` — chain and connector configuration
- `lib/contracts.ts` — contract address mapping and constants
- `lib/abi.ts` — typed vault ABI for `viem`
- `lib/utils.ts` — utility helpers and common functionality
- `lib/formatters.ts` — formatting helpers for currency, dates, and addresses
- `lib/constants.ts` — application constants and timing values
- `lib/eventLogs.ts` — event log parsing utilities
- `lib/indexer.ts` — indexer integration helpers
- `lib/docs.ts` — documentation navigation and structure

### `types/`

- `types/vault.ts` — vault contract types, transaction event shapes, countdown types
- `types/index.ts` — re-exports for convenience

### `config/`

- `config/chains.ts` — chain configuration for wagmi
- `config/site.ts` — site metadata and external links

### `content/`

- `content/docs/` — documentation content in MDX format
  - `architecture/` — architecture documentation
  - `contract-reference/` — contract API reference
  - `faq.mdx` — frequently asked questions
  - `how-it-works/` — how the protocol works
  - `introduction/` — introduction to Aeternum
  - `roadmap/` — project roadmap
  - `user-guide/` — user guides

## Folder structure

The repository is organized around a component-driven dashboard architecture.

```text
aeternum-app/
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── icon.png
│   ├── providers.tsx
│   ├── page.tsx
│   ├── docs/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [...slug]/
│   │       └── page.tsx
│   └── vault/
│       ├── layout.tsx
│       ├── page.tsx
│       └── activity/
│           └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── vault/
│   │   ├── VaultDashboard.tsx
│   │   ├── actions/
│   │   │   ├── ActionButtonRow.tsx
│   │   │   ├── DepositButton.tsx
│   │   │   ├── PingButton.tsx
│   │   │   ├── RegisterButton.tsx
│   │   │   ├── SendButton.tsx
│   │   │   └── VaultActions.tsx
│   │   ├── balance/
│   │   │   ├── AssetRow.tsx
│   │   │   └── BalanceDisplay.tsx
│   │   ├── cards/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── TopAssetsCard.tsx
│   │   │   └── VaultHistoryCard.tsx
│   │   ├── countdown/
│   │   │   ├── CountdownBox.tsx
│   │   │   └── CountdownDisplay.tsx
│   │   ├── modals/
│   │   │   ├── CancelRecoveryModal.tsx
│   │   │   ├── DepositModal.tsx
│   │   │   ├── RegisterModal.tsx
│   │   │   ├── SendModal.tsx
│   │   │   ├── UpdateConfigModal.tsx
│   │   │   └── WithdrawModal.tsx
│   │   └── transactions/
│   │       ├── EmptyTransactionState.tsx
│   │       ├── TransactionList.tsx
│   │       └── TransactionRow.tsx
│   ├── chart/
│   ├── common/
│   └── docs/
│       ├── Callout.tsx
│       ├── DocsBreadcrumb.tsx
│       ├── DocsHeader.tsx
│       ├── DocsPageFooter.tsx
│       ├── DocsSidebar.tsx
│       ├── FunctionCard.tsx
│       ├── MdxComponents.tsx
│       ├── StepList.tsx
│       └── diagrams/
│
├── graphql/
│   └── queries.ts
│
├── hooks/
│   ├── contracts/
│   │   ├── reads/
│   │   └── writes/
│   ├── useEthPrice.ts
│   ├── useMounted.ts
│   ├── useVaultTransactions.ts
│   ├── useBalanceHistory.ts
│   └── useCountdown.ts
│
├── lib/
│   ├── wagmi.ts
│   ├── contracts.ts
│   ├── abi.ts
│   ├── utils.ts
│   ├── formatters.ts
│   ├── constants.ts
│   ├── eventLogs.ts
│   ├── indexer.ts
│   └── docs.ts
│
├── types/
│   ├── vault.ts
│   └── index.ts
│
├── config/
│   ├── chains.ts
│   └── site.ts
│
├── content/
│   └── docs/
│       ├── architecture/
│       ├── contract-reference/
│       ├── faq.mdx
│       ├── how-it-works/
│       ├── introduction/
│       ├── roadmap/
│       └── user-guide/
│
├── public/
├── .env.example
├── .hintrc
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── components.json
└── package.json
```

## Notes

- Built with Next.js 16, React 19, Tailwind CSS v4, `viem`, `wagmi`, and RainbowKit.
- The countdown timer is implemented in `hooks/useCountdown.ts`.
- Contract interactions are managed using `hooks/contracts/*`.

## Contributing

To extend the app, start with the vault UI in `components/vault/`, the contract hooks in `hooks/contracts/`, and helper logic in `lib/`.
