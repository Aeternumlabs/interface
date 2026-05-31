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
- `providers.tsx` — `wagmi`, `RainbowKit`, and React Query providers
- `vault/page.tsx` — renders the main vault dashboard
- `vault/layout.tsx` — layout grid for desktop and mobile
- `vault/activity/page.tsx` — vault activity and history view

### `components/`

- `components/layout/` — header, sidebar, mobile drawer, grid layout
- `components/vault/` — vault dashboard cards, actions, countdown, transactions, and modals
- `components/chart/` — balance chart and range selector
- `components/common/` — shared UI pieces used throughout the app
- `components/ui/` — shadcn/ui primitives used by the interface

### `hooks/`

- `hooks/contracts/reads/` — read-only contract hooks
- `hooks/contracts/writes/` — contract write hooks for interactions
- `hooks/useEthPrice.ts` — CoinGecko price data
- `hooks/useVaultTransactions.ts` — transaction event history
- `hooks/useBalanceHistory.ts` — balance chart data
- `hooks/useCountdown.ts` — live countdown timer logic

### `lib/`

- `lib/wagmi.ts` — chain and connector configuration
- `lib/contracts.ts` — contract address mapping and constants
- `lib/abi.ts` — typed vault ABI for `viem`
- `lib/utils.ts` — utility helpers and common functionality
- `lib/formatters.ts` — formatting helpers for currency, dates, and addresses
- `lib/constants.ts` — application constants and timing values

### `types/`

- `types/vault.ts` — vault contract types, transaction event shapes, countdown types
- `types/index.ts` — re-exports for convenience

### `config/`

- `config/chains.ts` — chain configuration for wagmi
- `config/site.ts` — site metadata and external links

## Folder structure

The repository is organized around a component-driven dashboard architecture.

```text
aeternum-app/
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── providers.tsx
│   ├── page.tsx
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
│   │   ├── cards/
│   │   ├── balance/
│   │   ├── countdown/
│   │   ├── actions/
│   │   ├── transactions/
│   │   └── modals/
│   ├── chart/
│   └── common/
│
├── hooks/
│   ├── contracts/
│   │   ├── reads/
│   │   └── writes/
│   ├── useEthPrice.ts
│   ├── useVaultTransactions.ts
│   ├── useBalanceHistory.ts
│   └── useCountdown.ts
│
├── lib/
├── types/
├── config/
├── public/
├── .env.example
├── next.config.ts
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
