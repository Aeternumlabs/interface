/**
 * components/docs/diagrams/Phase2ArchitectureDiagram.tsx
 *
 * Flow diagram illustrating the EIP-7702 Hybrid Account architecture
 * introduced in Phase 2 of the Aeternum roadmap.
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
  purple:       'hsl(263,65%,62%)',
  purpleDim:    'hsla(263,65%,62%,0.1)',
  purpleMed:    'hsla(263,65%,62%,0.2)',
  purpleBorder: 'hsla(263,65%,62%,0.35)',
  purpleText:   'hsl(263,65%,72%)',
  green:        'hsl(142,71%,45%)',
  greenDim:     'hsla(142,71%,45%,0.1)',
  greenBorder:  'hsla(142,71%,45%,0.3)',
  greenText:    'hsl(142,71%,58%)',
} as const

export function Phase2ArchitectureDiagram() {
  return (
    <figure className="not-prose my-8 overflow-x-auto rounded-xl border border-border/50 bg-card">

      <figcaption className="border-b border-border/40 px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Phase 2 · EIP-7702 Hybrid Account Architecture
      </figcaption>

      <div className="px-4 pb-6 pt-4">
        <svg
          viewBox="0 0 820 460"
          className="mx-auto w-full max-w-3xl"
          aria-label="EIP-7702 Hybrid Account Architecture: your EOA address is unchanged and holds all assets; the AeternumRecoveryManager is linked via EIP-7702 delegation and monitors the inactivity timer; the Aeternum keeper calls getTriggerableVaultsBatch off-chain and triggerRecovery on-chain, transferring ETH and ERC-20 tokens to the Backup Address."
          role="img"
        >
          {/* --- Defs */}
          <defs>
            <pattern id="p2-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={C.dotGrid} />
            </pattern>
            <marker id="p2-gray" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.arrowGray} />
            </marker>
            <marker id="p2-purple" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.purple} />
            </marker>
            <marker id="p2-green" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.green} />
            </marker>
          </defs>

          <rect width="820" height="460" fill="url(#p2-dots)" opacity="0.4" />

          {/* --- CATEGORY LABELS */}
          <text x="83"  y="128" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            EXTERNAL WORLD
          </text>
          <text x="405" y="40" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            YOUR HYBRID ACCOUNT
          </text>
          <text x="733" y="70" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            KEEPER
          </text>
          <text x="733" y="308" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
            BENEFICIARY
          </text>

          {/* --- HYBRID ACCOUNT OUTER CONTAINER  (x=185, w=440) */}
          <rect x="183" y="48" width="444" height="296" rx="16"
                style={{ fill: 'none', stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <rect x="185" y="50" width="440" height="292" rx="15"
                style={{ fill: C.cardDark }} />

          {/* --- EOA BOX */}
          <rect x="218" y="82" width="160" height="228" rx="10"
                style={{ fill: C.card, stroke: C.border, strokeWidth: 1.5 }} />
          <path d="M 218,122 L 218,92 Q 218,82 228,82 L 368,82 Q 378,82 378,92 L 378,122 Z"
                style={{ fill: C.cardMid }} />
          <text x="298" y="108" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 13, fontWeight: 700 }}>
            ◈  Your EOA
          </text>
          <rect x="237" y="129" width="122" height="18" rx="5"
                style={{ fill: 'hsl(0,0%,8%)', stroke: C.border, strokeWidth: 1 }} />
          <text x="298" y="142" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 8.5, fontFamily: 'monospace' }}>
            0x1234…abcd
          </text>
          <text x="298" y="161" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            Unchanged address.
          </text>
          <text x="298" y="175" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            ETH + tokens live here.
          </text>
          <line x1="236" y1="185" x2="360" y2="185"
                style={{ stroke: C.border, strokeWidth: 1 }} />
          <rect x="235" y="193" width="126" height="22" rx="5"
                style={{ fill: C.greenDim, stroke: C.greenBorder, strokeWidth: 1 }} />
          <text x="298" y="208" textAnchor="middle"
                style={{ fill: C.greenText, fontSize: 9, fontWeight: 700 }}>
            ✓ No custody transfer
          </text>
          <text x="298" y="234" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            Import existing wallet
          </text>
          <text x="298" y="248" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            or create a new one
          </text>
          <rect x="235" y="260" width="126" height="22" rx="5"
                style={{ fill: C.cardMid, stroke: C.border, strokeWidth: 1 }} />
          <text x="298" y="275" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9, fontWeight: 600 }}>
            ≡ Identical to MetaMask
          </text>
          <text x="298" y="296" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5, fontStyle: 'italic' }}>
            invisible from dApps
          </text>

          {/* --- EIP-7702 DELEGATION BRIDGE */}
          <line x1="378" y1="196" x2="433" y2="196"
                style={{ stroke: C.purple, strokeWidth: 2, strokeDasharray: '5,3' }} />
          <polygon points="378,191 386,196 378,201" style={{ fill: C.purple }} />
          <polygon points="433,191 425,196 433,201" style={{ fill: C.purple }} />
          <rect x="384" y="170" width="44" height="16" rx="4"
                style={{ fill: C.purpleMed, stroke: C.purpleBorder, strokeWidth: 1 }} />
          <text x="406" y="182" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 7.5, fontWeight: 700 }}>
            EIP-7702
          </text>
          <text x="406" y="210" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            delegation
          </text>

          {/* --- ARM BOX */}
          <rect x="433" y="82" width="160" height="228" rx="10"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <path d="M 433,132 L 433,92 Q 433,82 443,82 L 583,82 Q 593,82 593,92 L 593,132 Z"
                style={{ fill: C.purpleMed }} />
          <text x="513" y="106" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 12, fontWeight: 700 }}>
            Recovery Manager
          </text>
          <text x="513" y="124" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 8 }}>
            AeternumRecoveryManager
          </text>
          <line x1="450" y1="136" x2="576" y2="136"
                style={{ stroke: C.purpleBorder, strokeWidth: 1 }} />
          <text x="513" y="152" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            Monitors inactivity timer
          </text>
          <text x="513" y="166" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            Executes recovery logic
          </text>
          <rect x="447" y="176" width="132" height="10" rx="3"
                style={{ fill: 'hsl(0,0%,8%)', stroke: C.purpleBorder, strokeWidth: 1 }} />
          <rect x="447" y="176" width="88"  height="10" rx="3"
                style={{ fill: 'hsla(263,65%,62%,0.45)' }} />
          <text x="513" y="200" textAnchor="middle" style={{ fill: C.muted, fontSize: 8.5 }}>
            Inactivity countdown
          </text>
          <rect x="445" y="208" width="136" height="22" rx="5"
                style={{ fill: 'hsla(263,65%,62%,0.08)', stroke: C.purpleBorder, strokeWidth: 1 }} />
          <text x="513" y="223" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 9, fontWeight: 700 }}>
            App open = auto-ping
          </text>
          <text x="513" y="244" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            No manual ping() needed
          </text>
          <text x="513" y="258" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            ETH + ERC-20 recovery
          </text>
          <rect x="445" y="269" width="136" height="32" rx="5"
                style={{ fill: C.cardMid, stroke: C.border, strokeWidth: 1 }} />
          <text x="513" y="282" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9, fontWeight: 600 }}>
            Multi-asset support
          </text>
          <text x="513" y="295" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8, fontStyle: 'italic' }}>
            token failures isolated
          </text>

          {/* --- STANDARD APPS BOX */}
          <rect x="10" y="138" width="145" height="120" rx="10"
                style={{ fill: C.card, stroke: C.border, strokeWidth: 1.5 }} />
          <text x="83" y="165" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 12, fontWeight: 700 }}>
            Standard Apps
          </text>
          <text x="83" y="182" textAnchor="middle" style={{ fill: C.muted, fontSize: 10 }}>
            DeFi · DEXs · NFTs
          </text>
          <text x="83" y="197" textAnchor="middle" style={{ fill: C.muted, fontSize: 10 }}>
            Wallets · Bridges
          </text>
          <rect x="22" y="209" width="122" height="20" rx="5"
                style={{ fill: C.cardMid, stroke: C.border, strokeWidth: 1 }} />
          <text x="83" y="223" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 8.5, fontWeight: 600 }}>
            Unchanged from outside
          </text>
          <text x="83" y="244" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5, fontStyle: 'italic' }}>
            invisible from dApps
          </text>

          {/* --- Arrows: Standard Apps ↔ EOA */}
          <line x1="155" y1="186" x2="217" y2="186"
                style={{ stroke: C.arrowGray, strokeWidth: 1.5 }}
                markerEnd="url(#p2-gray)" />
          <text x="186" y="178" textAnchor="middle" style={{ fill: C.dim, fontSize: 8.5 }}>
            use
          </text>
          <line x1="218" y1="210" x2="156" y2="210"
                style={{ stroke: C.arrowGray, strokeWidth: 1.5 }}
                markerEnd="url(#p2-gray)" />

          {/* --- AETERNUM KEEPER BOX */}
          <rect x="655" y="80" width="155" height="98" rx="10"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <text x="733" y="110" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 13, fontWeight: 700 }}>
            Aeternum
          </text>
          <text x="733" y="128" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 11 }}>
            Keeper
          </text>
          <text x="733" y="148" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            Polls every 12 seconds
          </text>
          <text x="733" y="164" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            permissionless · Off-chain
          </text>

          {/* --- Arrows: ARM ↔ Keeper */}
          {/* ARM → Keeper: getTriggerableVaultsBatch (off-chain, dashed) */}
          <line x1="593" y1="116" x2="654" y2="116"
                style={{ stroke: C.purple, strokeWidth: 1.5, strokeDasharray: '5,4', opacity: 0.8 }}
                markerEnd="url(#p2-purple)" />
          <text x="624" y="99" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 7.5 }}>
            Vaults Batch
          </text>
          <text x="624" y="108" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 7.5 }}>
            (off-chain)
          </text>

          {/* Keeper → ARM: triggerRecovery (on-chain, solid) */}
          <line x1="655" y1="148" x2="594" y2="148"
                style={{ stroke: C.purple, strokeWidth: 1.5 }}
                markerEnd="url(#p2-purple)" />
          <text x="624" y="162" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 7.5 }}>
            triggerRecovery
          </text>
          <text x="624" y="172" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 7.5 }}>
            (on-chain)
          </text>

          {/* --- BACKUP ADDRESS BOX */}
          <rect x="655" y="320" width="155" height="96" rx="10"
                style={{ fill: C.greenDim, stroke: C.greenBorder, strokeWidth: 1.5 }} />
          <text x="733" y="350" textAnchor="middle"
                style={{ fill: C.greenText, fontSize: 13, fontWeight: 700 }}>
            Backup Address
          </text>
          <text x="733" y="368" textAnchor="middle"
                style={{ fill: C.green, fontSize: 10 }}>
            Beneficiary
          </text>
          <text x="733" y="385" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            ETH + all ERC-20 balances
          </text>
          <text x="733" y="400" textAnchor="middle" style={{ fill: C.muted, fontSize: 9 }}>
            transferred on recovery
          </text>

          {/* --- Recovery arrow: ARM → Backup */}
          <path d="M 500,311 V 368 H 653"
                style={{ stroke: C.green, strokeWidth: 2, fill: 'none' }}
                markerEnd="url(#p2-green)" />
          <text x="525" y="384" textAnchor="start"
                style={{ fill: C.greenText, fontSize: 10, fontWeight: 600 }}>
            Recovery Transfer
          </text>
          <text x="525" y="397" textAnchor="start"
                style={{ fill: C.green, fontSize: 9 }}>
            ETH + ERC-20 tokens
          </text>

          {/* --- Bottom summary bar */}
          <line x1="15" y1="432" x2="805" y2="432"
                style={{ stroke: C.border, strokeWidth: 1 }} />
          <text x="410" y="445" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 8.5 }}>
            Phase 1: ETH deposited into vault contract  ·  Phase 2: ETH stays in your EOA  ·  EIP-7702 enables smart-contract recovery without changing your address
          </text>

        </svg>
      </div>
    </figure>
  )
}