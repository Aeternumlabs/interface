/**
 * components/docs/diagrams/HowItWorksDiagram.tsx
 *
 * SVG flow diagram showing the four actors in the Aeternum protocol and
 * the directional flow of interactions between them.
 *
 * Actors:
 *   User (Wallet Owner)  — deposits, withdraws, pings
 *   AeternumVault Contract — central protocol, holds funds
 *   Keeper Network — any external caller of triggerRecovery(). In practice,
 *                     almost always the Aeternum Labs keeper bot today, with
 *                     independent third-party keepers (or any individual)
 *                     equally free to call the same permissionless function.
 *                     The keeper scans its own off-chain indexed database to
 *                     find due wallets — this is an internal step and does
 *                     not call the vault contract. Only triggerRecovery()
 *                     itself is an on-chain interaction with the vault.
 *   Backup Address — receives funds when recovery triggers
 *
 * Arrow types:
 *   ─────►  Gray solid    — standard user ↔ vault interactions
 *   ─────►  Purple solid  — triggerRecovery (on-chain transaction, permissionless)
 *   ─────►  Green solid   — recovery transfer (triggered when timer expires)
 *
 * Note: there is deliberately no arrow between the Keeper Network and the
 * vault representing an off-chain "scan" step. The keeper's scan is a query
 * against its own database (populated by an off-chain indexer), not a call
 * to the contract, so it is shown as an annotation on the keeper node itself
 * rather than a line to the vault. getTriggerableVaultsBatch() exists on the
 * contract as a general-purpose permissionless view function, but is not
 * part of the Aeternum Labs keeper bot's live scanning path — see the
 * Key Actors doc page for the full explanation.
 *
 * Colours are hardcoded HSL values derived from globals.css tokens.
 * CSS custom properties in SVG presentation attributes are unreliable
 * across some render environments, so explicit values are used here.
 *
 * Server component — no client state needed.
 * Embedded directly in MDX via <HowItWorksDiagram /> in MdxComponents.tsx.
 */

// --- Design palette (mirrors globals.css tokens exactly) ---
const C = {
  nodeBg:        'hsl(0,0%,7%)',          // --card
  nodeBgVault:   'hsl(0,0%,9%)',          // slightly elevated for visual hierarchy
  border:        'hsl(0,0%,16%)',         // --border (bumped slightly for SVG readability)
  fg:            'hsl(0,0%,91%)',         // --foreground
  muted:         'hsl(0,0%,42%)',         // --muted-foreground
  dim:           'hsl(0,0%,55%)',         // between border and muted — arrow labels
  arrowGray:     'hsl(0,0%,32%)',         // arrow stroke
  dotGrid:       'hsl(0,0%,15%)',         // subtle background dot grid
  purple:        'hsl(263,65%,62%)',      // --chart-1
  purpleDim:     'hsla(263,65%,62%,0.1)',
  purpleBorder:  'hsla(263,65%,62%,0.3)',
  purpleText:    'hsl(263,65%,72%)',
  green:         'hsl(142,71%,45%)',      // --price-up
  greenDim:      'hsla(142,71%,45%,0.1)',
  greenBorder:   'hsla(142,71%,45%,0.3)',
  greenText:     'hsl(142,71%,58%)',
} as const

// --- Component ---
export function HowItWorksDiagram() {
  return (
    <figure className="not-prose my-8 overflow-x-auto rounded-xl border border-border/50 bg-card">

      {/* Caption bar */}
      <figcaption className="border-b border-border/40 px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Protocol Flow — How Aeternum Works
      </figcaption>

      <div className="px-4 pb-6 pt-4">
        <svg
          viewBox="0 0 760 390"
          className="mx-auto w-full max-w-2xl"
          aria-label="Aeternum protocol flow: User interacts with AeternumVault smart contract. The keeper network — any external caller, in practice almost always the Aeternum Labs keeper bot — scans its own off-chain database to find wallets due for recovery, then calls triggerRecovery on-chain when the inactivity timer has expired. ETH is then transferred to the Backup Address."
          role="img"
        >

          {/* Defs: dot grid + arrowhead markers */}
          <defs>
            {/* Subtle dot grid background */}
            <pattern id="hiw-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={C.dotGrid} />
            </pattern>

            {/* Gray arrowhead (user ↔ vault interactions) */}
            <marker id="hiw-arr-gray" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.arrowGray} />
            </marker>

            {/* Purple arrowhead (keeper) */}
            <marker id="hiw-arr-purple" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.purple} />
            </marker>

            {/* Green arrowhead (recovery transfer) */}
            <marker id="hiw-arr-green" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.green} />
            </marker>
          </defs>

          {/* Background dot grid */}
          <rect width="760" height="390" fill="url(#hiw-dots)" opacity="0.5" />

          {/* Category labels (above nodes) */}
          <text x="93"  y="72" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            VAULT OWNER
          </text>
          <text x="380" y="72" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em' }}>
            PROTOCOL
          </text>
          <text x="668" y="72" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em' }}>
            KEEPER NETWORK
          </text>

          {/* Node: User */}
          <rect x="15" y="82" width="155" height="76" rx="10"
                style={{ fill: C.nodeBg, stroke: C.border, strokeWidth: 1.5 }} />
          <text x="93" y="113" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 13, fontWeight: 700 }}>
            User
          </text>
          <text x="93" y="131" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 11 }}>
            Wallet Owner
          </text>

          {/* Node: AeternumVault (highlighted as central actor) */}
          <rect x="297" y="82" width="166" height="76" rx="10"
                style={{ fill: C.nodeBgVault, stroke: 'hsl(0,0%,22%)', strokeWidth: 1.5 }} />
          {/* Small decorative diamond — matches app nav icon */}
          <text x="380" y="106" textAnchor="middle"
                style={{ fill: 'hsl(0,0%,40%)', fontSize: 11 }}>
            ◈
          </text>
          <text x="380" y="122" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 13, fontWeight: 700 }}>
            AeternumVault
          </text>
          <text x="380" y="139" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 10 }}>
            Smart Contract
          </text>

          {/* Node: Keeper Network */}
          {/* Represents the category of caller, not a single privileged actor.
              Any address may call triggerRecovery(); Aeternum Labs runs the
              first keeper today. */}
          <rect x="591" y="82" width="154" height="76" rx="10"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <text x="668" y="108" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 12, fontWeight: 700 }}>
            Any external caller:
          </text>
          <text x="668" y="122" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 10, opacity: 0.9 }}>
            • Aeternum Labs Bot
          </text>
          <text x="656" y="136" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 10, opacity: 0.9 }}>
            • Any individual
          </text>

          {/* Keeper scan annotation — deliberately NOT an arrow to the vault.
              The scan is a query against the keeper's own off-chain database,
              not a contract call, so it's shown as a note on the keeper node
              itself rather than an interaction line. */}
          <text x="668" y="176" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 10, opacity: 1 }}>
            scans its own indexed DB
          </text>
          <text x="668" y="188" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 10 }}>
            off-chain — no contract call
          </text>

          {/* Node: Backup Address */}
          <rect x="297" y="256" width="166" height="76" rx="10"
                style={{ fill: C.greenDim, stroke: C.greenBorder, strokeWidth: 1.5 }} />
          <text x="380" y="290" textAnchor="middle"
                style={{ fill: C.greenText, fontSize: 13, fontWeight: 700 }}>
            Backup Address
          </text>
          <text x="380" y="308" textAnchor="middle"
                style={{ fill: C.green, fontSize: 11 }}>
            Beneficiary
          </text>

          {/* Arrow 1: User → Vault (deposit / register / ping) */}
          <path d="M 170,103 H 288"
                style={{ stroke: C.arrowGray, strokeWidth: 1.5, fill: 'none' }}
                markerEnd="url(#hiw-arr-gray)" />
          <text x="229" y="94" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 10 }}>
            register · deposit · ping
          </text>

          {/* Arrow 2: Vault → User (withdraw / send) */}
          <path d="M 297,137 H 178"
                style={{ stroke: C.arrowGray, strokeWidth: 1.5, fill: 'none' }}
                markerEnd="url(#hiw-arr-gray)" />
          <text x="237" y="155" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 10 }}>
            withdraw · send
          </text>

          {/* Arrow 3: Keeper → Vault (triggerRecovery, solid) */}
          <path d="M 591,137 H 472"
                style={{ stroke: C.purple, strokeWidth: 1.5, fill: 'none' }}
                markerEnd="url(#hiw-arr-purple)" />
          <text x="531" y="150" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 10 }}>
            triggerRecovery
          </text>
          <text x="531" y="163" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 10 }}>
            (on-chain)
          </text>

          {/* Arrow 4: Vault → Backup (recovery transfer, green) */}
          {/* Fires when inactivity period has fully elapsed */}
          <path d="M 380,158 V 247"
                style={{ stroke: C.green, strokeWidth: 2, fill: 'none' }}
                markerEnd="url(#hiw-arr-green)" />

          {/* Recovery label — positioned to the right of the vertical arrow */}
          <text x="392" y="196" textAnchor="start"
                style={{ fill: C.greenText, fontSize: 11, fontWeight: 600 }}>
            Recovery Transfer
          </text>
          <text x="392" y="212" textAnchor="start"
                style={{ fill: C.green, fontSize: 10 }}>
            when timer expires
          </text>

        </svg>
      </div>
    </figure>
  )
}