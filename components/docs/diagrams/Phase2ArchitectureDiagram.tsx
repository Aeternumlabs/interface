/**
 * components/docs/diagrams/Phase2ArchitectureDiagram.tsx
 *
 * Flow diagram illustrating the EIP-7702 Hybrid Account architecture
 * introduced in Phase 2 of the Aeternum roadmap.
 *
 * Visual story (left → centre → right):
 *
 *   [Standard Apps]  ←──►  [────────── YOUR HYBRID ACCOUNT ───────────]  ←──►  [Chainlink]
 *   DeFi · DEXs             [  ◈ Your EOA  ]─EIP-7702─[Recovery Mgr  ]              ↓
 *   Unchanged from           ETH stays here   Delegation  Monitors timer      [Backup Address]
 *   outside world            No custody xfer  ◄────────►  Auto-pings on open
 *
 * Key differentiator from Phase 1:
 *   Phase 1: ETH deposited into AeternumVault contract escrow
 *   Phase 2: ETH stays in the user's own EOA — manager sits on top via EIP-7702
 *
 * Color palette mirrors globals.css design tokens exactly (hardcoded HSL
 * values used in SVG fill/stroke attributes for cross-environment reliability).
 *
 * Server component — no client state needed.
 */

// ---------------------------------------------------------------------------
// Design palette (mirrors globals.css tokens)
// ---------------------------------------------------------------------------

const C = {
  cardDark:     'hsl(0,0%,5%)',
  card:         'hsl(0,0%,7%)',
  cardMid:      'hsl(0,0%,10%)',
  border:       'hsl(0,0%,16%)',
  fg:           'hsl(0,0%,91%)',
  muted:        'hsl(0,0%,42%)',
  dim:          'hsl(0,0%,55%)',
  dotGrid:      'hsl(0,0%,15%)',
  arrowGray:    'hsl(0,0%,32%)',
  purple:       'hsl(263,65%,62%)',    // --chart-1
  purpleDim:    'hsla(263,65%,62%,0.1)',
  purpleMed:    'hsla(263,65%,62%,0.2)',
  purpleBorder: 'hsla(263,65%,62%,0.35)',
  purpleText:   'hsl(263,65%,72%)',
  green:        'hsl(142,71%,45%)',    // --price-up
  greenDim:     'hsla(142,71%,45%,0.1)',
  greenBorder:  'hsla(142,71%,45%,0.3)',
  greenText:    'hsl(142,71%,58%)',
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Phase2ArchitectureDiagram() {
  return (
    <figure className="not-prose my-8 overflow-x-auto rounded-xl border border-border/50 bg-card">

      {/* Caption bar */}
      <figcaption className="border-b border-border/40 px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Phase 2 · EIP-7702 Hybrid Account Architecture
      </figcaption>

      <div className="px-4 pb-6 pt-4">
        <svg
          viewBox="0 0 790 444"
          className="mx-auto w-full max-w-3xl"
          aria-label="EIP-7702 Hybrid Account Architecture. Your EOA address is unchanged and holds all assets. The AeternumRecoveryManager is linked via EIP-7702 delegation, monitoring the inactivity timer silently. Chainlink Automation checks every 12 seconds and triggers recovery, transferring ETH and ERC-20 tokens to the Backup Address."
          role="img"
        >

          {/* ── Defs ──────────────────────────────────────────────── */}
          <defs>
            <pattern id="p2-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={C.dotGrid} />
            </pattern>

            {/* Gray arrowhead — standard wallet use */}
            <marker id="p2-gray" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.arrowGray} />
            </marker>

            {/* Purple arrowhead — Chainlink / delegation */}
            <marker id="p2-purple" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.purple} />
            </marker>

            {/* Green arrowhead — recovery transfer */}
            <marker id="p2-green" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.green} />
            </marker>
          </defs>

          {/* Background dot grid */}
          <rect width="790" height="444" fill="url(#p2-dots)" opacity="0.4" />


          {/* ════════════════════════════════════════════════════════
              CATEGORY LABELS (small-caps, above each column)
              ════════════════════════════════════════════════════════ */}

          <text x="80" y="128" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            EXTERNAL WORLD
          </text>
          <text x="367" y="40" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            YOUR HYBRID ACCOUNT
          </text>
          <text x="684" y="70" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            AUTOMATION
          </text>
          <text x="684" y="308" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            BENEFICIARY
          </text>


          {/* ════════════════════════════════════════════════════════
              HYBRID ACCOUNT — outer container
              Subtle purple glow border marks the logical boundary of
              the combined EOA + RecoveryManager hybrid account.
              ════════════════════════════════════════════════════════ */}

          {/* Outer glow ring */}
          <rect x="152" y="48" width="426" height="296" rx="16"
                style={{ fill: 'none', stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          {/* Container fill */}
          <rect x="154" y="50" width="422" height="292" rx="15"
                style={{ fill: C.cardDark, stroke: 'none' }} />


          {/* ════════════════════════════════════════════════════════
              EOA BOX  (left side of hybrid account)
              ════════════════════════════════════════════════════════ */}

          {/* Box */}
          <rect x="173" y="86" width="163" height="228" rx="10"
                style={{ fill: C.card, stroke: C.border, strokeWidth: 1.5 }} />

          {/* Header band */}
          <rect x="173" y="86" width="163" height="40" rx="10"
                style={{ fill: C.cardMid, stroke: 'none' }} />
          <rect x="173" y="108" width="163" height="18" rx="0"
                style={{ fill: C.cardMid, stroke: 'none' }} />
          <text x="254" y="112" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 13, fontWeight: 700 }}>
            ◈  Your EOA
          </text>

          {/* Address pill */}
          <rect x="194" y="133" width="120" height="18" rx="5"
                style={{ fill: 'hsl(0,0%,8%)', stroke: C.border, strokeWidth: 1 }} />
          <text x="254" y="146" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 8.5, fontFamily: 'monospace' }}>
            0x1234…abcd
          </text>

          {/* Same address badge */}
          <text x="254" y="168" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            Unchanged address.
          </text>
          <text x="254" y="182" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            ETH + tokens live here.
          </text>

          {/* Divider */}
          <line x1="192" y1="192" x2="316" y2="192"
                style={{ stroke: C.border, strokeWidth: 1 }} />

          {/* No custody transfer badge */}
          <rect x="192" y="200" width="124" height="22" rx="5"
                style={{ fill: C.greenDim, stroke: C.greenBorder, strokeWidth: 1 }} />
          <text x="254" y="215" textAnchor="middle"
                style={{ fill: C.greenText, fontSize: 9, fontWeight: 700 }}>
            ✓ No custody transfer
          </text>

          {/* Import/create note */}
          <text x="254" y="242" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            Import existing wallet
          </text>
          <text x="254" y="256" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            or create a new one
          </text>

          {/* MetaMask-identical badge */}
          <rect x="192" y="270" width="124" height="22" rx="5"
                style={{ fill: C.cardMid, stroke: C.border, strokeWidth: 1 }} />
          <text x="254" y="285" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9, fontWeight: 600 }}>
            ≡ Identical to MetaMask
          </text>

          {/* Bottom note */}
          <text x="254" y="302" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5, fontStyle: 'italic' }}>
            invisible from dApps
          </text>


          {/* ════════════════════════════════════════════════════════
              EIP-7702 DELEGATION BRIDGE
              Visual bridge between EOA and RecoveryManager.
              Double-headed dashed line + label pill.
              ════════════════════════════════════════════════════════ */}

          {/* Dashed line body */}
          <line x1="354" y1="200" x2="394" y2="200"
                style={{ stroke: C.purple, strokeWidth: 2, strokeDasharray: '5,3' }} />

          {/* Left arrowhead (pointing left → EOA receives delegation) */}
          <polygon points="354,195 362,200 354,205" fill={C.purple} />

          {/* Right arrowhead (pointing right → ARM receives delegation) */}
          <polygon points="394,195 386,200 394,205" fill={C.purple} />

          {/* Label pill centered on bridge */}
          <rect x="356" y="184" width="36" height="15" rx="4"
                style={{ fill: C.purpleMed, stroke: C.purpleBorder, strokeWidth: 1 }} />
          <text x="374" y="195" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 7.5, fontWeight: 700 }}>
            EIP-7702
          </text>
          <text x="374" y="218" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8 }}>
            delegation
          </text>


          {/* ════════════════════════════════════════════════════════
              RECOVERY MANAGER BOX  (right side of hybrid account)
              ════════════════════════════════════════════════════════ */}

          {/* Box */}
          <rect x="396" y="86" width="162" height="228" rx="10"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />

          {/* Header band */}
          <rect x="396" y="86" width="162" height="40" rx="10"
                style={{ fill: C.purpleMed, stroke: 'none' }} />
          <rect x="396" y="108" width="162" height="18" rx="0"
                style={{ fill: C.purpleMed, stroke: 'none' }} />
          <text x="477" y="111" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 12, fontWeight: 700 }}>
            Recovery Manager
          </text>

          {/* Contract name */}
          <text x="477" y="130" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 8 }}>
            AeternumRecoveryManager
          </text>

          {/* Divider */}
          <line x1="415" y1="140" x2="539" y2="140"
                style={{ stroke: C.purpleBorder, strokeWidth: 1 }} />

          {/* Content */}
          <text x="477" y="156" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            Monitors inactivity timer
          </text>
          <text x="477" y="170" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            Executes recovery logic
          </text>

          {/* Inactivity progress bar */}
          <rect x="415" y="182" width="124" height="10" rx="3"
                style={{ fill: 'hsl(0,0%,8%)', stroke: C.purpleBorder, strokeWidth: 1 }} />
          <rect x="415" y="182" width="82" height="10" rx="3"
                style={{ fill: 'hsla(263,65%,62%,0.45)', stroke: 'none' }} />
          <text x="477" y="206" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5 }}>
            Inactivity countdown
          </text>

          {/* Auto-ping badge */}
          <rect x="415" y="216" width="124" height="22" rx="5"
                style={{ fill: 'hsla(263,65%,62%,0.08)', stroke: C.purpleBorder, strokeWidth: 1 }} />
          <text x="477" y="231" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 9, fontWeight: 700 }}>
            App open = auto-ping ↺
          </text>

          {/* Remaining content */}
          <text x="477" y="256" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            No manual ping() needed
          </text>
          <text x="477" y="270" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            ETH + ERC-20 recovery
          </text>

          {/* Multi-asset badge */}
          <rect x="415" y="282" width="124" height="22" rx="5"
                style={{ fill: C.cardMid, stroke: C.border, strokeWidth: 1 }} />
          <text x="477" y="297" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9, fontWeight: 600 }}>
            Multi-asset support
          </text>

          {/* Bottom note */}
          <text x="477" y="306" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5, fontStyle: 'italic' }}>
            token failures isolated
          </text>


          {/* ════════════════════════════════════════════════════════
              STANDARD APPS BOX  (left, external)
              ════════════════════════════════════════════════════════ */}

          <rect x="10" y="138" width="140" height="120" rx="10"
                style={{ fill: C.card, stroke: C.border, strokeWidth: 1.5 }} />
          <text x="80" y="165" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 12, fontWeight: 700 }}>
            Standard Apps
          </text>
          <text x="80" y="182" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 10 }}>
            DeFi · DEXs · NFTs
          </text>
          <text x="80" y="197" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 10 }}>
            Wallets · Bridges
          </text>
          {/* Badge */}
          <rect x="22" y="210" width="116" height="20" rx="5"
                style={{ fill: C.cardMid, stroke: C.border, strokeWidth: 1 }} />
          <text x="80" y="224" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 8.5, fontWeight: 600 }}>
            Unchanged from outside
          </text>
          <text x="80" y="245" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5, fontStyle: 'italic' }}>
            invisible from dApps
          </text>


          {/* ── Arrows: Standard Apps ↔ EOA ────────────────────────── */}

          {/* Apps → EOA (upper) */}
          <line x1="150" y1="186" x2="165" y2="186"
                style={{ stroke: C.arrowGray, strokeWidth: 1.5 }}
                markerEnd="url(#p2-gray)" />
          <text x="157" y="178" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 8.5 }}>
            use
          </text>

          {/* EOA → Apps (lower) */}
          <line x1="165" y1="210" x2="150" y2="210"
                style={{ stroke: C.arrowGray, strokeWidth: 1.5 }}
                markerEnd="url(#p2-gray)" />


          {/* ════════════════════════════════════════════════════════
              CHAINLINK AUTOMATION BOX  (right, top)
              ════════════════════════════════════════════════════════ */}

          <rect x="592" y="80" width="186" height="98" rx="10"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <text x="685" y="110" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 13, fontWeight: 700 }}>
            Chainlink
          </text>
          <text x="685" y="128" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 11 }}>
            Automation
          </text>
          <text x="685" y="148" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            Checks every ~12 seconds
          </text>
          <text x="685" y="164" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            Decentralised · Off-chain
          </text>


          {/* ── Arrows: Recovery Manager ↔ Chainlink ───────────────── */}

          {/* ARM → Chainlink  checkUpkeep (off-chain, dashed) */}
          <line x1="558" y1="116" x2="584" y2="116"
                style={{
                  stroke: C.purple, strokeWidth: 1.5,
                  strokeDasharray: '5,4', opacity: 0.8,
                }}
                markerEnd="url(#p2-purple)" />
          <text x="571" y="107" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 8.5 }}>
            checkUpkeep
          </text>
          <text x="571" y="99" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 7.5 }}>
            (off-chain · free)
          </text>

          {/* Chainlink → ARM  performUpkeep (on-chain, solid) */}
          <line x1="584" y1="148" x2="558" y2="148"
                style={{ stroke: C.purple, strokeWidth: 1.5 }}
                markerEnd="url(#p2-purple)" />
          <text x="571" y="163" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 8.5 }}>
            performUpkeep
          </text>
          <text x="571" y="172" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 7.5 }}>
            (on-chain · costs LINK)
          </text>


          {/* ════════════════════════════════════════════════════════
              BACKUP ADDRESS BOX  (right, bottom)
              ════════════════════════════════════════════════════════ */}

          <rect x="592" y="320" width="186" height="96" rx="10"
                style={{ fill: C.greenDim, stroke: C.greenBorder, strokeWidth: 1.5 }} />
          <text x="685" y="350" textAnchor="middle"
                style={{ fill: C.greenText, fontSize: 13, fontWeight: 700 }}>
            Backup Address
          </text>
          <text x="685" y="368" textAnchor="middle"
                style={{ fill: C.green, fontSize: 10 }}>
            Beneficiary
          </text>
          <text x="685" y="385" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            ETH + all ERC-20 balances
          </text>
          <text x="685" y="400" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            transferred on recovery
          </text>


          {/* ── Recovery Arrow: ARM → Backup (L-shape, green) ──────── */}
          {/*  Path: ARM bottom-center → straight down → right to Backup */}

          <path d="M 477,314 V 368 H 584"
                style={{ stroke: C.green, strokeWidth: 2, fill: 'none' }}
                markerEnd="url(#p2-green)" />

          {/* Recovery label */}
          <text x="508" y="384" textAnchor="start"
                style={{ fill: C.greenText, fontSize: 10, fontWeight: 600 }}>
            Recovery Transfer
          </text>
          <text x="508" y="398" textAnchor="start"
                style={{ fill: C.green, fontSize: 9 }}>
            ETH + ERC-20 tokens
          </text>


          {/* ════════════════════════════════════════════════════════
              BOTTOM SUMMARY BAR
              ════════════════════════════════════════════════════════ */}

          <line x1="15" y1="428" x2="775" y2="428"
                style={{ stroke: C.border, strokeWidth: 1 }} />
          <text x="395" y="440" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5 }}>
            Phase 1: ETH deposited into vault contract  ·  Phase 2: ETH stays in your EOA  ·  EIP-7702 enables smart-contract recovery without changing your address
          </text>

        </svg>
      </div>
    </figure>
  )
}