/**
 * components/docs/diagrams/KeeperArchitectureDiagram.tsx
 *
 * SVG diagram explaining the keeper bot's recovery pipeline and cycle
 * timing.
 *
 * Two sections (top to bottom):
 *
 *   1. RECOVERY PIPELINE
 *      A filter funnel, not a scan window: All Registered Wallets →
 *      DB Candidates (≤600, via getDueVaults — a query for wallets
 *      already believed due, not a positional slice of the registry)
 *      → Executed (via isRecoveryDue on-chain validation, then
 *      triggerRecovery batched ≤120/tx via Multicall3). There is no
 *      "already scanned / not yet scanned" position tracked between
 *      cycles — getDueVaults returns whatever is due right now, every
 *      time it's called.
 *
 *   2. CYCLE TIMING
 *      Two states: the cycle itself (scan, validate, execute — all
 *      back-to-back, no fixed sub-timing) and the next cycle beginning
 *      roughly 12 seconds later. That gap is the pause AFTER a cycle
 *      completes, not a fixed clock tick — it stretches if the cycle
 *      had a lot to execute. No on-chain scan state persists between
 *      cycles.
 *
 * Colors are hardcoded HSL values from globals.css tokens — CSS custom
 * properties in SVG presentation attributes can be unreliable across
 * some render environments.
 *
 * Server component — no client state needed.
 */

// --- Design palette (mirrors globals.css tokens exactly) ---
const C = {
  barBg:         'hsl(0,0%,6%)',
  border:        'hsl(0,0%,16%)',
  fg:            'hsl(0,0%,91%)',
  muted:         'hsl(0,0%,42%)',
  dim:           'hsl(0,0%,55%)',
  dotGrid:       'hsl(0,0%,15%)',
  purple:        'hsl(263,65%,62%)',   // --chart-1
  purpleDim:     'hsla(263,65%,62%,0.12)',
  purpleBorder:  'hsla(263,65%,62%,0.4)',
  purpleText:    'hsl(263,65%,72%)',
  green:         'hsl(142,71%,45%)',   // --price-up
  greenDim:      'hsla(142,71%,45%,0.12)',
  greenBorder:   'hsla(142,71%,45%,0.4)',
  greenText:     'hsl(142,71%,58%)',
} as const

// --- Component ---
export function KeeperArchitectureDiagram() {
  return (
    <figure className="not-prose my-8 overflow-x-auto rounded-xl border border-border/50 bg-card">

      {/* Caption bar */}
      <figcaption className="border-b border-border/60 px-6 py-6 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Keeper Bot Architecture
      </figcaption>

      <div className="px-4 pb-6 pt-4">
        <svg
          viewBox="0 0 760 290"
          className="mx-auto w-full max-w-2xl"
          aria-label="Keeper bot architecture diagram. Every cycle, the keeper queries its own database via getDueVaults for up to 600 wallets it believes are currently due for recovery. It re-validates each one on-chain in a single multicall to isRecoveryDue, filtering out any stale entries. Confirmed wallets are recovered via triggerRecovery, batched up to 120 calls per transaction through Multicall3's aggregate3. There is no persistent on-chain scan position between cycles — each cycle is stateless. The next cycle begins roughly 12 seconds after the current one finishes; this gap can stretch longer if the current cycle had many recoveries to execute."
          role="img"
        >

          {/* Defs */}
          <defs>
            <pattern id="rcd-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={C.dotGrid} />
            </pattern>

            <marker id="rcd-arr-gray" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.muted} />
            </marker>
          </defs>

          {/* Dot grid background */}
          <rect width="760" height="290" fill="url(#rcd-dots)" opacity="0.4" />

          {/* --- SECTION 1 — RECOVERY PIPELINE --- */}
          <text x="30" y="24"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>
            RECOVERY PIPELINE
          </text>

          {/* Box 1: All Registered Wallets */}
          <rect x="30" y="40" width="180" height="78" rx="8"
                style={{ fill: C.barBg, stroke: C.border, strokeWidth: 1 }} />
          <text x="120" y="64" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 11, fontWeight: 700 }}>
            All Registered
          </text>
          <text x="120" y="78" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 11, fontWeight: 700 }}>
            Wallets
          </text>
          <text x="120" y="96" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            no scan position —
          </text>
          <text x="120" y="108" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            stateless between cycles
          </text>

          {/* Arrow 1 */}
          <line x1="214" y1="79" x2="266" y2="79"
                style={{ stroke: C.muted, strokeWidth: 1.5 }}
                markerEnd="url(#rcd-arr-gray)" />

          {/* Box 2: DB Candidates */}
          <rect x="270" y="40" width="200" height="78" rx="8"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <text x="370" y="64" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 11, fontWeight: 700 }}>
            DB Candidates (≤600)
          </text>
          <text x="370" y="82" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            via getDueVaults() —
          </text>
          <text x="370" y="94" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            presumed due, indexer
          </text>
          <text x="370" y="106" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            may lag slightly
          </text>

          {/* Arrow 2 */}
          <line x1="474" y1="79" x2="526" y2="79"
                style={{ stroke: C.muted, strokeWidth: 1.5 }}
                markerEnd="url(#rcd-arr-gray)" />

          {/* Box 3: Executed */}
          <rect x="530" y="40" width="200" height="78" rx="8"
                style={{ fill: C.greenDim, stroke: C.greenBorder, strokeWidth: 1.5 }} />
          <text x="630" y="64" textAnchor="middle"
                style={{ fill: C.greenText, fontSize: 11, fontWeight: 700 }}>
            Executed
          </text>
          <text x="630" y="82" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            isRecoveryDue() confirms
          </text>
          <text x="630" y="94" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            on-chain (1 multicall), then
          </text>
          <text x="630" y="106" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            ≤120 calls/tx via Multicall3
          </text>

          {/* Explanatory note */}
          <text x="380" y="134" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 10 }}>
            Stale entries (pinged, withdrawn, or already recovered) are filtered out before execution.
          </text>

          {/* Divider */}
          <line x1="30" y1="150" x2="730" y2="150"
                style={{ stroke: C.border, strokeWidth: 1 }} />

          {/* --- SECTION 2 — CYCLE TIMING --- */}
          <text x="30" y="174"
                style={{ fill: C.dim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
            CYCLE TIMING
          </text>
          <text x="730" y="174" textAnchor="end"
                style={{ fill: C.dim, fontSize: 10 }}>
            gap ≈12s after each cycle finishes
          </text>

          {/* Box A: Cycle runs */}
          <rect x="50" y="190" width="300" height="54" rx="8"
                style={{ fill: C.barBg, stroke: C.border, strokeWidth: 1 }} />
          <text x="200" y="212" textAnchor="middle"
                style={{ fill: C.fg, fontSize: 11, fontWeight: 700 }}>
            Scan → Validate → Execute
          </text>
          <text x="200" y="228" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            back-to-back within one cycle
          </text>

          {/* Arrow between cycle states */}
          <line x1="360" y1="217" x2="402" y2="217"
                style={{ stroke: C.muted, strokeWidth: 1.5 }}
                markerEnd="url(#rcd-arr-gray)" />
          <text x="381" y="207" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 10, fontWeight: 600 }}>
            ~12s
          </text>
          <text x="381" y="231" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5, fontStyle: 'italic' }}>
            longer if
          </text>
          <text x="381" y="241" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5, fontStyle: 'italic' }}>
            many ran
          </text>

          {/* Box B: Next cycle begins */}
          <rect x="410" y="190" width="300" height="54" rx="8"
                style={{ fill: C.purpleDim, stroke: C.purpleBorder, strokeWidth: 1.5 }} />
          <text x="560" y="212" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 11, fontWeight: 700 }}>
            Next Cycle Begins
          </text>
          <text x="560" y="228" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9.5 }}>
            no on-chain scan state persists
          </text>

          {/* Divider */}
          <line x1="30" y1="260" x2="730" y2="260"
                style={{ stroke: C.border, strokeWidth: 1 }} />

        </svg>
      </div>
    </figure>
  )
}