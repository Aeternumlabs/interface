# Frontend interface for Aeternum protocol

## Folder structure

aeternum-app/
│
├── app/
│   ├── layout.tsx                              ← Root layout: fonts, metadata, providers
│   ├── globals.css                             ← All black background, CSS variables for 
│   │                                             metallic grey + dim white tokens
│   ├── providers.tsx                           ← wagmi, RainbowKit, TanStack Query
│   ├── page.tsx                                ← Redirects to /vault
│   │
│   └── vault/
│       ├── layout.tsx                          ← 3-column grid: [Sidebar][Content][ChartPanel]
│       │                                         On mobile: collapses to single column,
│       │                                         Sidebar becomes MobileDrawer, ChartPanel hidden
│       └── page.tsx                            ← Renders VaultDashboard
│
│
├── components/
│   │
│   ├── ui/                                     ← shadcn/ui primitives (do not edit manually)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   └── tooltip.tsx
│   │
│   │
│   ├── layout/                                 ← App shell — visible on every screen
│   │   ├── Header.tsx                          ← Logo left + WalletButton right
│   │   │                                         Mobile adds hamburger icon below wallet button
│   │   ├── Sidebar.tsx                         ← Left column — desktop only (hidden on mobile)
│   │   │                                         Contains SidebarNavGroup x3
│   │   ├── SidebarNavGroup.tsx                 ← Labelled group (explore / Insight) or unlabelled
│   │   │                                         Renders a list of SidebarNavItem
│   │   ├── SidebarNavItem.tsx                  ← Single nav row: icon + label + active state highlight
│   │   │                                         Active: subtle lighter bg (Vault is active by default)
│   │   ├── MobileDrawer.tsx                    ← Hamburger slide-out — same nav items as Sidebar
│   │   │                                         Triggered by hamburger icon in Header on mobile
│   │   └── DashboardGrid.tsx                   ← 3-column layout wrapper
│   │                                             [sidebar 240px fixed] [content flex-1] [chart 340px fixed]
│   │                                             On mobile: content only, full width
│   │
│   │
│   ├── vault/                                  ← Everything inside the center content column
│   │   │
│   │   ├── VaultDashboard.tsx                  ← Stacks the three cards vertically with gap
│   │   │
│   │   ├── cards/
│   │   │   │
│   │   │   ├── BalanceCard.tsx                 ← TOP CARD (largest card, visible in both designs)
│   │   │   │                                     Two-column layout inside:
│   │   │   │                                     Left: BalanceDisplay
│   │   │   │                                     Right: CountdownDisplay
│   │   │   │                                     Full-width bottom: ActionButtonRow
│   │   │   │
│   │   │   ├── TopAssetsCard.tsx               ← MIDDLE CARD — "Top assets" heading
│   │   │   │                                     Renders one AssetRow per token
│   │   │   │                                     In MVP: only Sepolia Ether row
│   │   │   │
│   │   │   └── TransactionHistoryCard.tsx      ← BOTTOM CARD — "Transaction history" heading
│   │   │                                         Renders TransactionList or EmptyTransactionState
│   │   │
│   │   │
│   │   ├── balance/
│   │   │   ├── BalanceDisplay.tsx              ← "Total balance" label + "$22.16" large text
│   │   │   │                                     USD value from ETH balance × ETH price feed
│   │   │   └── AssetRow.tsx                    ← Single row inside Top assets card
│   │   │                                         [ETH icon] [Sepolia Ether / 0.01ETH] [$22 / ▼2.39%]
│   │   │                                         Price change colour: red if negative, green if positive
│   │   │
│   │   ├── countdown/
│   │   │   ├── CountdownDisplay.tsx            ← "Time until recovery" label + timer box
│   │   │   │                                     The dark-bg box: [256][.][7][.][32][.][22]
│   │   │   │                                     Labels below each: DAYS HRS MINS SECS
│   │   │   └── CountdownBox.tsx                ← The styled dark rectangle containing the numbers
│   │   │                                         Single unit: number on top, label below
│   │   │
│   │   ├── actions/
│   │   │   ├── ActionButtonRow.tsx             ← TOGGLE COMPONENT — sits in BalanceCard footer
│   │   │   │                                     If unregistered → renders <RegisterButton />
│   │   │   │                                     If registered   → renders <VaultActions />
│   │   │   │                                     Same horizontal line, same visual weight
│   │   │   │
│   │   │   ├── RegisterButton.tsx              ← Single pill button: "Register"
│   │   │   │                                     Opens RegisterModal on click
│   │   │   │
│   │   │   ├── VaultActions.tsx                ← Three pill buttons in a row:
│   │   │   │                                     [↓ Deposit] [↑ Send] [↻ Ping]
│   │   │   │                                     Each opens its respective modal
│   │   │   │
│   │   │   ├── DepositButton.tsx               ← "Deposit" pill with download arrow icon
│   │   │   │                                     Opens DepositModal
│   │   │   ├── SendButton.tsx                  ← "Send" pill with upload arrow icon
│   │   │   │                                     Opens SendModal
│   │   │   └── PingButton.tsx                  ← "Ping" pill with refresh/cycle icon
│   │   │                                         Calls ping() directly, no modal needed
│   │   │                                         Shows spinner while tx pending
│   │   │
│   │   ├── transactions/
│   │   │   ├── TransactionList.tsx             ← Maps transaction events to TransactionRow
│   │   │   ├── TransactionRow.tsx              ← Single tx: type icon + label + amount + timestamp
│   │   │   │                                     Types: Deposited, Sent, Withdrawn, Pinged,
│   │   │   │                                     RecoveryExecuted, RecoveryFailed, RecoveryCancelled
│   │   │   └── EmptyTransactionState.tsx       ← "No transactions yet" with subtle icon
│   │   │
│   │   └── modals/
│   │       ├── RegisterModal.tsx               ← Opens when Register button clicked
│   │       │                                     Form: backup address input + period selector
│   │       │                                     Optional ETH deposit field
│   │       │                                     Submit calls register()
│   │       │
│   │       ├── DepositModal.tsx                ← ETH amount input + current balance shown
│   │       │                                     Submit calls deposit()
│   │       │
│   │       ├── SendModal.tsx                   ← Recipient address + ETH amount input
│   │       │                                     Shows available balance
│   │       │                                     Submit calls send()
│   │       │
│   │       ├── UpdateConfigModal.tsx           ← Triggered by "Update config" in sidebar
│   │       │                                     Displays current config:
│   │       │                                     [Backup address] [Inactivity period] [Failed attempts]
│   │       │                                     Each field has an "Update" button beside it
│   │       │                                     Update backup → calls updateBackupAddress()
│   │       │                                     Update period → calls updateInactivityPeriod()
│   │       │
│   │       ├── WithdrawModal.tsx               ← Triggered by "Withdraw balance" in sidebar
│   │       │                                     Shows current balance + confirm button
│   │       │                                     Calls withdrawAll()
│   │       │
│   │       └── CancelRecoveryModal.tsx         ← Triggered by "Cancel recovery" in sidebar
│   │                                             Double confirmation — destructive action warning
│   │                                             Calls cancelRecovery()
│   │
│   │
│   ├── chart/                                  ← RIGHT PANEL — desktop only, hidden on mobile
│   │   ├── ChartPanel.tsx                      ← Outer wrapper with hidden lg:flex classes
│   │   │                                         Contains TimeRangeSelector + BalanceChart + legend
│   │   ├── TimeRangeSelector.tsx               ← Tab row: 1D | 1W | 1M | 6M | 1Y | ALL
│   │   │                                         Active tab (1W in design) has lighter text/underline
│   │   ├── BalanceChart.tsx                    ← Recharts LineChart
│   │   │                                         Single line: balance over selected time range
│   │   │                                         Metallic grey line, no fill, clean axes
│   │   └── ChartLegend.tsx                     ← "● Balance" label at bottom right of chart
│   │
│   │
│   └── common/                                 ← Reusable pieces used across multiple components
│       ├── WalletButton.tsx                    ← State 1: "Connect wallet" pill button
│       │                                         State 2: Truncated address pill (0x3288...dAD6)
│       │                                         Powered by RainbowKit ConnectButton
│       ├── AeternumLogo.tsx                    ← Geometric diamond icon + "Aeternum" wordmark
│       │                                         Used in Header and Sidebar top
│       ├── AddressDisplay.tsx                  ← Truncated address + copy icon
│       ├── ETHAmount.tsx                       ← Formats raw wei to "0.01 ETH"
│       ├── USDAmount.tsx                       ← Formats to "$22.16"
│       ├── PriceChange.tsx                     ← "▼ 2.39%" red or "▲ 1.2%" green
│       │                                         Used in AssetRow
│       ├── LoadingSkeleton.tsx                 ← Skeleton shimmer for async content
│       │                                         Used while vault data loads
│       └── ConfirmDialog.tsx                   ← Reusable "are you sure?" base
│                                                 Used by WithdrawModal and CancelRecoveryModal
│
│
├── hooks/
│   │
│   ├── contracts/
│   │   ├── reads/
│   │   │   ├── useVaultConfig.ts               ← getRecoveryConfig(): backup, period, balance, status
│   │   │   ├── useIsRegistered.ts              ← isRegistered(): drives ActionButtonRow toggle
│   │   │   └── useTimeUntilRecovery.ts         ← getTimeUntilRecovery(): feeds CountdownDisplay
│   │   │
│   │   └── writes/
│   │       ├── useRegister.ts                  ← register()
│   │       ├── useDeposit.ts                   ← deposit()
│   │       ├── useSend.ts                      ← send()
│   │       ├── useWithdrawAll.ts               ← withdrawAll()
│   │       ├── usePing.ts                      ← ping()
│   │       ├── useUpdateBackupAddress.ts        ← updateBackupAddress()
│   │       ├── useUpdateInactivityPeriod.ts     ← updateInactivityPeriod()
│   │       └── useCancelRecovery.ts             ← cancelRecovery()
│   │
│   ├── useEthPrice.ts                          ← CoinGecko ETH/USD, cached 60s
│   │                                             Returns price + 24h change percentage
│   │                                             Feeds BalanceDisplay + PriceChange + USDAmount
│   ├── useVaultTransactions.ts                 ← Reads contract event logs filtered by wallet address
│   │                                             Returns typed array for TransactionList
│   ├── useBalanceHistory.ts                    ← Aggregates past balances for BalanceChart
│   │                                             Grouped by selected time range (1D/1W/etc.)
│   └── useCountdown.ts                         ← Takes a deadline in seconds, ticks every second
│                                                 Returns { days, hours, minutes, seconds }
│                                                 Used by CountdownDisplay
│
│
├── lib/
│   ├── wagmi.ts                                ← Chains (mainnet + sepolia), RainbowKit connectors
│   ├── contracts.ts                            ← { 11155111: "0xYourSepoliaAddress" }
│   ├── abi.ts                                  ← Full AeternumVault ABI as const (typed for viem)
│   ├── utils.ts                                ← cn() classname helper
│   ├── formatters.ts                           ← formatEth(), formatUSD(), formatAddress(),
│   │                                             formatDuration(), formatTimestamp()
│   └── constants.ts                            ← MIN_INACTIVITY_PERIOD, MAX_INACTIVITY_PERIOD,
│                                                 COINGECKO_ETH_URL, SUPPORTED_CHAIN_ID
│
│
├── types/
│   ├── vault.ts                                ← RecoveryConfig, VaultStatus, TransactionEvent,
│   │                                             TimeRange ("1D"|"1W"|"1M"|"6M"|"1Y"|"ALL")
│   └── index.ts                                ← Re-exports
│
│
├── config/
│   ├── chains.ts                               ← Sepolia chain object for wagmi
│   └── site.ts                                 ← App name, external links (docs PDF, protocol stats)
│                                                 Used by Sidebar "Protocol" and "Documentation" items
│
│
├── public/
│   ├── logo.svg                                ← Geometric diamond mark
│   └── favicon.ico
│
│
├── .env.example                                ← NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
│                                                 NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS
│                                                 NEXT_PUBLIC_ALCHEMY_RPC_URL (or Infura)
├── next.config.ts
├── tailwind.config.ts                          ← Extends theme: black bg, metallic grey, dim white
├── tsconfig.json
├── components.json                             ← shadcn/ui config
└── package.json