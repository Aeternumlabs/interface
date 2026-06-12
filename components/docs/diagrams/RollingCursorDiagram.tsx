/**
 * components/docs/diagrams/RollingCursorDiagram.tsx
 *
 * SVG diagram explaining the rolling cursor architecture that allows
 * a single Chainlink upkeep to monitor any number of registered wallets.
 *
 * Four sections (top to bottom):
 *
 *   1. REGISTRY OVERVIEW
 *      Full registry bar showing past windows, current scan window,
 *      execution batch, and pending — with a cursor marker.
 *
 *   2. SCAN WINDOW DETAIL
 *      Grid of wallet squares (schematic) showing the scan window
 *      split into normal wallets (gray), due wallets (amber), and
 *      the execution batch (green). A downward arrow shows how due
 *      wallets are filtered into the execution batch.
 *
 *   3. CURSOR ADVANCE TIMELINE
 *      Four mini registry bars showing the cursor at different
 *      positions over time, connected by "≈1hr" arrows.
 *
 *   4. KEY STAT
 *      At 500,000 users — one full sweep takes ~4 days.
 *
 * Layout verified:
 *   ROW_W=625, ROW_X=68, dueCenterX=632.5, execStart=572, execEnd=693
 *   All text labels checked to fit within 760px viewBox at fontSize=9/10.
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
  barPast:       'hsl(0,0%,11%)',
  border:        'hsl(0,0%,16%)',
  fg:            'hsl(0,0%,91%)',
  muted:         'hsl(0,0%,42%)',
  dim:           'hsl(0,0%,55%)',
  dotGrid:       'hsl(0,0%,15%)',
  walletNormal:  'hsl(0,0%,17%)',
  amber:         'hsl(35,90%,55%)',    // due-for-recovery state
  amberDim:      'hsla(35,90%,55%,0.15)',
  amberText:     'hsl(35,90%,65%)',
  purple:        'hsl(263,65%,62%)',   // --chart-1
  purpleDim:     'hsla(263,65%,62%,0.12)',
  purpleBright:  'hsla(263,65%,62%,0.35)',
  purpleBorder:  'hsla(263,65%,62%,0.4)',
  purpleText:    'hsl(263,65%,72%)',
  green:         'hsl(142,71%,45%)',   // --price-up
  greenDim:      'hsla(142,71%,45%,0.15)',
  greenText:     'hsl(142,71%,58%)',
} as const

// ---Wallet grid constants (layout verified by node calculation) ---
const SQ        = 16              // wallet square size (px)
const GAP       = 5               // gap between squares
const STEP      = SQ + GAP        // = 21
const COLS      = 30              // total squares in row 1
const ROW_W     = COLS * STEP - GAP  // = 625
const ROW_X     = 68              // (760 − 625) / 2 = 67.5 → 68
const DUE_START = 24              // squares 24–29 are "due for recovery"
const ROW1_Y    = 150             // y-position of scan window wallet row
const ROW2_Y    = 200             // y-position of execution batch row

// Execution batch starts at the same x as the first due square
const EXEC_X = ROW_X + DUE_START * STEP   // = 572
// Center x of the due/exec section (used for the downward arrow)
const DUE_CENTER_X = Math.round(EXEC_X + (6 * STEP - GAP) / 2)  // = 633

// --- Timeline constants ---
const MINI_W = 40    // mini bar width
const MINI_H = 8     // mini bar height
const MINI_Y = 266   // mini bar top y

// --- Four cursor positions shown on the timeline ---
const TICKS = [
  { cx: 80,  cursorOff: 0,  label1: 'Window 0 – 4,999',     label2: 't = 0',    wrap: false },
  { cx: 260, cursorOff: 10, label1: 'Window 5,000 – 9,999',  label2: 't + 1hr',  wrap: false },
  { cx: 440, cursorOff: 20, label1: 'Window 10,000 – 14,999', label2: 't + 2hr', wrap: false },
  { cx: 620, cursorOff: 0,  label1: '↺  Wrap → Window 0',  label2: 't + Nhr',   wrap: true  },
] as const

// --- Component ---
export function RollingCursorDiagram() {
  // Pre-compute wallet square fill colors
  const row1Squares = Array.from({ length: COLS }, (_, i) => ({
    x:    ROW_X + i * STEP,
    fill: i >= DUE_START ? C.amber : C.walletNormal,
  }))

  // --- Execution batch: 6 green squares aligned directly under due squares
  const execSquares = Array.from({ length: 6 }, (_, i) => ({
    x: EXEC_X + i * STEP,
  }))

  return (
    <figure className="not-prose my-8 overflow-x-auto rounded-xl border border-border/50 bg-card">

      {/* Caption bar */}
      <figcaption className="border-b border-border/60 px-6 py-6 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Rolling Cursor Architecture
      </figcaption>

      <div className="px-4 pb-6 pt-4">
        <svg
          viewBox="0 0 760 400"
          className="mx-auto w-full max-w-2xl"
          aria-label="Rolling cursor architecture diagram. The full registry is divided into scan windows of 5,000 wallets. Chainlink checks each window off-chain via checkUpkeep. When due wallets are found, up to 50 are processed per on-chain performUpkeep transaction. The cursor advances one window per hour when idle, wrapping back to zero after the last window."
          role="img"
        >

          {/* Defs */}
          <defs>
            {/* Subtle dot grid background */}
            <pattern id="rcd-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={C.dotGrid} />
            </pattern>

            {/* Clip path — rounds outer corners of registry bar segments */}
            <clipPath id="rcd-bar-clip">
              <rect x="30" y="28" width="700" height="36" rx="5" />
            </clipPath>

            {/* Gray arrowhead */}
            <marker id="rcd-arr-gray" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.muted} />
            </marker>

            {/* Green arrowhead (due wallet filter) */}
            <marker id="rcd-arr-green" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.green} />
            </marker>

            {/* Purple arrowhead (cursor/timeline) */}
            <marker id="rcd-arr-purple" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0,0 L 8,3 L 0,6 Z" fill={C.purple} />
            </marker>
          </defs>

          {/* Dot grid background */}
          <rect width="760" height="400" fill="url(#rcd-dots)" opacity="0.4" />

          {/* --- SECTION 1 — REGISTRY OVERVIEW */}
          <text x="30" y="18"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>
            REGISTRY OVERVIEW
          </text>

          {/* Base bar */}
          <rect x="30" y="28" width="700" height="36" rx="5"
                style={{ fill: C.barBg, stroke: C.border, strokeWidth: 1 }} />

          {/* Past windows segment */}
          <rect x="30" y="28" width="212" height="36"
                style={{ fill: C.barPast }}
                clipPath="url(#rcd-bar-clip)" />

          {/* Scan window fill */}
          <rect x="242" y="28" width="140" height="36"
                style={{ fill: C.purpleDim }}
                clipPath="url(#rcd-bar-clip)" />

          {/* Execution batch fill (small bright slice at start of scan window) */}
          <rect x="242" y="28" width="14" height="36"
                style={{ fill: C.purpleBright }}
                clipPath="url(#rcd-bar-clip)" />

          {/* Scan window highlight border */}
          <rect x="241" y="25" width="142" height="42" rx="5"
                style={{ fill: 'none', stroke: C.purpleBorder, strokeWidth: 1.5 }} />

          {/* Cursor position marker — downward triangle */}
          <line x1="242" y1="64" x2="242" y2="68"
                style={{ stroke: C.purple, strokeWidth: 1.5 }} />
          <path d="M 242,68 L 251,82 L 233,82 Z"
                style={{ fill: C.purple }} />
          <text x="242" y="95" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 10, fontWeight: 600 }}>
            cursor
          </text>

          {/* Section 1 segment labels */}
          <text x="136" y="109" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 10 }}>
            Past windows
          </text>
          <text x="312" y="109" textAnchor="middle"
                style={{ fill: C.purpleText, fontSize: 10, fontWeight: 600 }}>
            Scan window (5,000)
          </text>
          <text x="249" y="121" textAnchor="middle"
                style={{ fill: C.dim, fontSize: 9 }}>
            exec. batch (≤50)
          </text>
          <text x="562" y="109" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 10 }}>
            Pending
          </text>

          {/* --- SECTION 2 — SCAN WINDOW DETAIL */}
          <text x="30" y="136"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>
            SCAN WINDOW DETAIL
          </text>
          <text x="730" y="136" textAnchor="end"
                style={{ fill: C.muted, fontSize: 9, fontStyle: 'italic' }}>
            schematic — not to scale
          </text>

          {/* Row 1: wallet squares (full scan window) */}
          {row1Squares.map((sq, i) => (
            <rect
              key={i}
              x={sq.x}
              y={ROW1_Y}
              width={SQ}
              height={SQ}
              rx={3}
              style={{ fill: sq.fill }}
            />
          ))}

          {/* Scan window bracket — spans all 30 squares */}
          <line x1={ROW_X} y1="174" x2={ROW_X + ROW_W} y2="174"
                style={{ stroke: C.muted, strokeWidth: 1 }} />
          <line x1={ROW_X} y1="168" x2={ROW_X} y2="174"
                style={{ stroke: C.muted, strokeWidth: 1 }} />
          <line x1={ROW_X + ROW_W} y1="168" x2={ROW_X + ROW_W} y2="174"
                style={{ stroke: C.muted, strokeWidth: 1 }} />
          <text x="380" y="185" textAnchor="middle"
                style={{ fill: C.muted, fontSize: 9 }}>
            checkUpkeep: scans 5,000 wallets per cycle (off-chain, no gas cost)
          </text>

          {/* Downward arrow from due wallets → execution batch */}
          <line
            x1={DUE_CENTER_X} y1="168"
            x2={DUE_CENTER_X} y2="194"
            style={{ stroke: C.green, strokeWidth: 1.5 }}
            markerEnd="url(#rcd-arr-green)"
          />
          {/* "filters due wallets" label — start-anchored safely within viewBox */}
          <text x="639" y="183" textAnchor="start"
                style={{ fill: C.greenText, fontSize: 9 }}>
            filters due wallets
          </text>

          {/* Row 2: execution batch (green squares, same x alignment as due squares) */}
          {execSquares.map((sq, i) => (
            <rect
              key={i}
              x={sq.x}
              y={ROW2_Y}
              width={SQ}
              height={SQ}
              rx={3}
              style={{ fill: C.green }}
            />
          ))}

          {/* Execution batch bracket — spans the 6 green squares */}
          <line x1={EXEC_X} y1="224" x2={EXEC_X + 6 * STEP - GAP} y2="224"
                style={{ stroke: C.green, strokeWidth: 1 }} />
          <line x1={EXEC_X} y1="218" x2={EXEC_X} y2="224"
                style={{ stroke: C.green, strokeWidth: 1 }} />
          <line x1={EXEC_X + 6 * STEP - GAP} y1="218"
                x2={EXEC_X + 6 * STEP - GAP} y2="224"
                style={{ stroke: C.green, strokeWidth: 1 }} />
          <text x="380" y="235" textAnchor="middle"
                style={{ fill: C.greenText, fontSize: 9 }}>
            performUpkeep: up to 50 wallets per on-chain transaction
          </text>

          {/* Row 2 colour legend (inline, left-aligned) */}
          <rect x="68" y="200" width={SQ} height={SQ} rx={3}
                style={{ fill: C.walletNormal }} />
          <text x="90" y="212"
                style={{ fill: C.muted, fontSize: 9 }}>
            Normal
          </text>
          <rect x="130" y="200" width={SQ} height={SQ} rx={3}
                style={{ fill: C.amber }} />
          <text x="152" y="212"
                style={{ fill: C.amberText, fontSize: 9 }}>
            Due for recovery
          </text>
          <rect x="248" y="200" width={SQ} height={SQ} rx={3}
                style={{ fill: C.green }} />
          <text x="270" y="212"
                style={{ fill: C.greenText, fontSize: 9 }}>
            Execution batch
          </text>

          {/* --- SECTION 3 — CURSOR ADVANCE TIMELINE */}
          <text x="30" y="254"
                style={{ fill: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>
            CURSOR ADVANCE TIMELINE
          </text>
          <text x="730" y="254" textAnchor="end"
                style={{ fill: C.muted, fontSize: 9 }}>
            ~1hr cooldown per advance (when no wallets are due)
          </text>

          {/* Mini registry bars with cursor position for each frame */}
          {TICKS.map((tick) => {
            const barX = tick.cx - MINI_W / 2   // left edge of mini bar

            return (
              <g key={tick.cx}>
                {/* Mini bar base */}
                <rect x={barX} y={MINI_Y} width={MINI_W} height={MINI_H} rx={2}
                      style={{ fill: C.barBg, stroke: C.border, strokeWidth: 0.8 }} />

                {/* Past fill (wallets already scanned in previous windows) */}
                {tick.cursorOff > 0 && (
                  <rect x={barX} y={MINI_Y} width={tick.cursorOff} height={MINI_H} rx={2}
                        style={{ fill: C.barPast }} />
                )}

                {/* Cursor / scan window highlight */}
                <rect
                  x={barX + tick.cursorOff}
                  y={MINI_Y}
                  width={10}
                  height={MINI_H}
                  rx={2}
                  style={{
                    fill:        tick.wrap ? C.purpleBright : C.purpleDim,
                    stroke:      C.purple,
                    strokeWidth: 0.8,
                  }}
                />

                {/* Wrap indicator symbol above cursor position */}
                {tick.wrap && (
                  <text
                    x={barX + tick.cursorOff + 5}
                    y={MINI_Y - 3}
                    textAnchor="middle"
                    style={{ fill: C.purpleText, fontSize: 9 }}
                  >
                    ↺
                  </text>
                )}

                {/* Tick mark on timeline baseline */}
                <line x1={tick.cx} y1="284" x2={tick.cx} y2="294"
                      style={{ stroke: C.dim, strokeWidth: 1 }} />

                {/* Window label */}
                <text x={tick.cx} y="308" textAnchor="middle"
                      style={{
                        fill:       tick.wrap ? C.purpleText : C.dim,
                        fontSize:   9,
                        fontWeight: tick.wrap ? 600 : 400,
                      }}>
                  {tick.label1}
                </text>

                {/* Time label */}
                <text x={tick.cx} y="321" textAnchor="middle"
                      style={{ fill: C.muted, fontSize: 9 }}>
                  {tick.label2}
                </text>
              </g>
            )
          })}

          {/* Horizontal timeline baseline */}
          <line x1="50" y1="290" x2="710" y2="290"
                style={{ stroke: C.border, strokeWidth: 1 }} />

          {/* Arrows + "≈1hr" labels between timeline frames */}
          {([0, 1, 2] as const).map((i) => {
            const fromX  = TICKS[i].cx + MINI_W / 2 + 8
            const toX    = TICKS[i + 1].cx - MINI_W / 2 - 8
            const midX   = Math.round((fromX + toX) / 2)
            const arrowY = MINI_Y + MINI_H / 2

            return (
              <g key={i}>
                <line
                  x1={fromX} y1={arrowY}
                  x2={toX - 8} y2={arrowY}
                  style={{ stroke: C.muted, strokeWidth: 1 }}
                  markerEnd="url(#rcd-arr-gray)"
                />
                <text x={midX} y={arrowY - 5} textAnchor="middle"
                      style={{ fill: C.muted, fontSize: 9 }}>
                  ≈1hr
                </text>
              </g>
            )
          })}

          {/* Divider */}
          <line x1="30" y1="350" x2="730" y2="350"
                style={{ stroke: C.border, strokeWidth: 1 }} />

        </svg>
      </div>
    </figure>
  )
}
