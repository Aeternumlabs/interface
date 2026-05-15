# Frontend interface for Aeternum protocol

## Folder structure

aeternum-frontend/
│
├── app/                                        ← Next.js App Router root
│   ├── layout.tsx                              ← Root layout: fonts, metadata, providers mount
│   ├── page.tsx                                ← Landing page
│   ├── loading.tsx                             ← Global loading UI
│   ├── error.tsx                               ← Global error boundary
│   ├── not-found.tsx                           ← 404 page
│   ├── globals.css                             ← Tailwind directives + CSS variables
│   ├── providers.tsx                           ← Client-side providers: wagmi, RainbowKit, TanStack Query
│   │
│   └── vault/                                  ← Protected app area (wallet required)
│       ├── layout.tsx                          ← Vault layout: header + network guard wrapper
│       ├── page.tsx                            ← Main vault page: shows RegisterPrompt or VaultDashboard
│       ├── loading.tsx                         ← Vault-level skeleton loading
│       └── error.tsx                           ← Vault-level error boundary
│
│
├── components/
│   │
│   ├── ui/                                     ← shadcn/ui primitives (auto-generated, do not edit)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/                                 ← App shell components
│   │   ├── Header.tsx                          ← Logo + nav links + WalletButton
│   │   ├── Footer.tsx                          ← Links, contract address, audit badge
│   │   ├── AppShell.tsx                        ← Authenticated wrapper: guards wallet connection
│   │   └── NetworkGuard.tsx                    ← Detects wrong network, prompts switch
│   │
│   ├── landing/                                ← Landing page sections (not connected state)
│   │   ├── Hero.tsx                            ← Headline, subtext, connect CTA
│   │   ├── HowItWorks.tsx                      ← Numbered step-by-step flow
│   │   ├── Features.tsx                        ← Feature cards: non-custodial, automated, free
│   │   ├── TrustModel.tsx                      ← No admin, no backdoors, no subscriptions
│   │   └── FAQ.tsx                             ← Accordion FAQ from the technical doc
│   │
│   ├── vault/                                  ← All vault UI components
│   │   │
│   │   ├── VaultDashboard.tsx                  ← Orchestrates all vault cards and action panels
│   │   ├── VaultStatusCard.tsx                 ← Active / abandoned / not registered state badge
│   │   ├── VaultBalanceCard.tsx                ← ETH balance display + deposit shortcut
│   │   ├── RecoveryTimerCard.tsx               ← Live countdown + progress bar to recovery
│   │   ├── RecoveryConfigCard.tsx              ← Backup address + inactivity period display
│   │   │
│   │   ├── register/                           ← Registration flow components
│   │   │   ├── RegisterPrompt.tsx              ← Shown when connected but not registered
│   │   │   ├── RegisterForm.tsx                ← Full register() form: backup + period + deposit
│   │   │   ├── PeriodSelector.tsx              ← Slider + manual input for inactivity period in days
│   │   │   └── BackupAddressInput.tsx          ← Address field with ENS resolution + validation
│   │   │
│   │   └── actions/                            ← One component per on-chain user action
│   │       ├── DepositForm.tsx                 ← deposit(): ETH amount input + submit
│   │       ├── SendForm.tsx                    ← send(): recipient address + amount + submit
│   │       ├── WithdrawAllButton.tsx           ← withdrawAll(): confirm dialog + execute
│   │       ├── PingButton.tsx                  ← ping(): single button + success feedback
│   │       ├── UpdateBackupForm.tsx            ← updateBackupAddress(): address input + submit
│   │       ├── UpdatePeriodForm.tsx            ← updateInactivityPeriod(): period selector + submit
│   │       └── CancelRecoveryButton.tsx        ← cancelRecovery(): destructive, double-confirm dialog
│   │
│   └── common/                                 ← Shared utility components used across the app
│       ├── WalletButton.tsx                    ← RainbowKit ConnectButton wrapper
│       ├── AddressDisplay.tsx                  ← Truncated address + copy icon + Etherscan link
│       ├── ETHAmount.tsx                       ← Formatted ETH value with currency symbol
│       ├── CountdownTimer.tsx                  ← Live countdown from a UNIX deadline (days/hrs/min/sec)
│       ├── TransactionToast.tsx                ← Pending / confirmed / failed tx notification
│       ├── LoadingState.tsx                    ← Skeleton placeholder for async content
│       ├── EmptyState.tsx                      ← Illustrated empty state for unregistered wallet
│       └── ConfirmDialog.tsx                   ← Reusable "are you sure?" modal with cancel + confirm
│
│
├── hooks/
│   │
│   ├── contracts/                              ← One hook per contract function
│   │   │
│   │   ├── reads/                              ← useReadContract wrappers (all view functions)
│   │   │   ├── useVaultConfig.ts               ← getRecoveryConfig(): full vault state
│   │   │   ├── useIsRegistered.ts              ← isRegistered(): registration status
│   │   │   ├── useIsRecoveryDue.ts             ← isRecoveryDue(): whether recovery can trigger now
│   │   │   ├── useTimeUntilRecovery.ts         ← getTimeUntilRecovery(): seconds remaining
│   │   │   ├── useTotalRegistered.ts           ← getTotalRegistered(): protocol-wide stat
│   │   │   └── useIsBackupAbandoned.ts         ← isBackupAbandoned(): validates a backup address
│   │   │
│   │   └── writes/                             ← useWriteContract wrappers (all state-changing functions)
│   │       ├── useRegister.ts                  ← register()
│   │       ├── useDeposit.ts                   ← deposit()
│   │       ├── useSend.ts                      ← send()
│   │       ├── useWithdrawAll.ts               ← withdrawAll()
│   │       ├── usePing.ts                      ← ping()
│   │       ├── useUpdateBackupAddress.ts       ← updateBackupAddress()
│   │       ├── useUpdateInactivityPeriod.ts    ← updateInactivityPeriod()
│   │       └── useCancelRecovery.ts            ← cancelRecovery()
│   │
│   └── ui/                                     ← UI behaviour hooks
│       ├── useCountdown.ts                     ← Ticks every second from a UNIX deadline
│       ├── useCopyToClipboard.ts               ← Copy text + reset after timeout
│       └── useMediaQuery.ts                    ← Responsive breakpoint detection
│
│
├── lib/                                        ← Core configuration and pure utilities
│   ├── wagmi.ts                                ← wagmi config: chains, transports, RainbowKit connectors
│   ├── contracts.ts                            ← Contract address per chainId: { 1: "0x...", 11155111: "0x..." }
│   ├── abi.ts                                  ← Full AeternumVault ABI typed as const (viem-compatible)
│   ├── utils.ts                                ← cn() for classnames, miscellaneous helpers
│   ├── formatters.ts                           ← formatEth(), formatAddress(), formatDuration(), formatTimestamp()
│   └── constants.ts                            ← MIN_INACTIVITY_PERIOD, MAX_INACTIVITY_PERIOD, SUPPORTED_CHAINS
│
│
├── types/                                      ← TypeScript type definitions
│   ├── vault.ts                                ← RecoveryConfig, VaultStatus enum, ActionState
│   └── index.ts                                ← Re-exports everything from types/
│
│
├── config/                                     ← Static app configuration
│   ├── chains.ts                               ← Mainnet + Sepolia chain objects for wagmi
│   └── site.ts                                 ← Site name, description, nav links, external URLs
│
│
├── public/                                     ← Static assets served at root
│   ├── logo.svg
│   ├── logo-dark.svg
│   ├── favicon.ico
│   └── og-image.png                            ← Open Graph image for social previews
│
│
├── .env.example                                ← NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID, etc.
├── .env.local                                  ← Local env variables (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── components.json                             ← shadcn/ui configuration
└── package.json