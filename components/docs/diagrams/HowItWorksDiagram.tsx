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
 *                     today this is the Aeternum Labs keeper bot (Phase 1);
 *                     independent third-party keepers (Gelato, Chainlink CRE)
 *                     are planned as additional callers of the same
 *                     permissionless function in later phases.
 *   Backup Address — receives funds when recovery triggers
 *
 * Arrow types:
 *   ─────►  Gray solid    — standard user ↔ vault interactions
 *   ╌╌╌╌►  Purple dashed — on-chain events, indexed off-chain into the
 *                           keeper's own database (no contract call — this
 *                           represents event flow via an off-chain indexer,
 *                           not a live read of the vault)
 *   ─────►  Purple solid  — triggerRecovery (on-chain transaction, permissionless)
 *   ─────►  Green solid   — recovery transfer (triggered when timer expires)
 *
 * Note: the dashed arrow does NOT represent getTriggerableVaultsBatch() or
 * any other live call from the keeper to the vault. The Aeternum Labs
 * keeper bot's scanning path queries its own indexed database (populated
 * from on-chain events via an off-chain indexer), not the contract directly.
 * getTriggerableVaultsBatch() exists on the contract as a general-purpose
 * permissionless view function but is not part of that bot's live path —
 * see the Key Actors doc page for the full explanation. The dashed arrow
 * here represents that event-driven data flow, which is why it points
 * FROM the vault TO the keeper rather than the other way around.
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
          aria-label="Aeternum protocol flow: User interacts with AeternumVault smart contract. The vault's on-chain events are indexed off-chain into the keeper network's own database. The keeper — any external caller, in practice today the Aeternum Labs keeper bot — calls triggerRecovery on-chain when a wallet's inactivity timer has expired. ETH is then transferred to the Backup Address."
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
              first keeper (Phase 1). Gelato / Chainlink CRE keepers are
              planned as independent additions in later phases. */}
          <rect x="591" y="82" width="154" height="76" rx="10"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <text x="668" y="106" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 12, fontWeight: 700 }}>
            Permissionless
          </text>
          <text x="668" y="123" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 12, fontWeight: 700 }}>
            Keeper Network
          </text>
          <text x="668" y="141" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 10 }}>
            Aeternum Labs Bot · Phase 1
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

          {/* Arrow 3: Vault → Keeper (on-chain events, dashed) */}
          {/* Events emitted by the vault are picked up by an off-chain
              indexer and written into the keeper's own database. This is
              NOT a live call from the keeper to the contract — no gas,
              no eth_call, no getTriggerableVaultsBatch(). Direction is
              vault → keeper because data is flowing outward from events
              the vault emits, not a request the keeper is making. */}
          <path d="M 463,103 H 582"
                style={{
                  stroke: C.purple,
                  strokeWidth: 1.5,
                  strokeDasharray: '6 4',
                  fill: 'none',
                  opacity: 0.7,
                }}
                markerEnd="url(#hiw-arr-purple)" />
          <text x="527" y="84" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 10 }}>
            on-chain events
          </text>
          <text x="527" y="97" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 9 }}>
            (indexed off-chain)
          </text>

          {/* Arrow 4: Keeper → Vault (triggerRecovery, solid) */}
          {/* The only on-chain call from the keeper network to the vault.
              On-chain transaction — permissionless, no LINK required.
              "(permissionless)" made explicit on the arrow itself so the
              point survives even if this arrow is screenshotted without
              the surrounding box context. */}
          <path d="M 591,137 H 472"
                style={{ stroke: C.purple, strokeWidth: 1.5, fill: 'none' }}
                markerEnd="url(#hiw-arr-purple)" />
          <text x="531" y="150" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 10 }}>
            triggerRecovery
          </text>
          <text x="531" y="163" textAnchor="middle"
                style={{ fill: C.purple, fontSize: 9 }}>
            (on-chain)
          </text>

          {/* Arrow 5: Vault → Backup (recovery transfer, green) */}
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

          {/* Legend */}
          <g transform="translate(0, 356)">
            {/* Gray: user interaction */}
            <line x1="22" y1="7" x2="54" y2="7"
                  style={{ stroke: C.arrowGray, strokeWidth: 1.5 }} />
            <polygon points="48,4 56,7 48,10" style={{ fill: C.arrowGray }} />
            <text x="62" y="11" style={{ fill: C.muted, fontSize: 10 }}>User interaction</text>

            {/* Purple dashed: on-chain events, indexed off-chain */}
            <line x1="166" y1="7" x2="196" y2="7"
                  style={{ stroke: C.purple, strokeWidth: 1.5, strokeDasharray: '4,3', opacity: 0.8 }} />
            <polygon points="198,4 206,7 198,10" style={{ fill: C.purple }} />
            <text x="212" y="11" style={{ fill: C.muted, fontSize: 10 }}>On-chain events (indexed off-chain)</text>

            {/* Purple solid: on-chain */}
            <line x1="414" y1="7" x2="444" y2="7"
                  style={{ stroke: C.purple, strokeWidth: 1.5 }} />
            <polygon points="444,4 452,7 444,10" style={{ fill: C.purple }} />
            <text x="458" y="11" style={{ fill: C.muted, fontSize: 10 }}>triggerRecovery (on-chain)</text>

            {/* Green: recovery */}
            <line x1="614" y1="7" x2="646" y2="7"
                  style={{ stroke: C.green, strokeWidth: 2 }} />
            <polygon points="640,4 648,7 640,10" style={{ fill: C.green }} />
            <text x="654" y="11" style={{ fill: C.muted, fontSize: 10 }}>Recovery transfer</text>
          </g>

        </svg>
      </div>
    </figure>
  )
}