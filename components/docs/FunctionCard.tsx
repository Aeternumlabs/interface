/**
 * components/docs/FunctionCard.tsx
 *
 * Reference card for a single AeternumVault contract function.
 * Used throughout the Contract Reference section.
 *
 * Renders:
 *   - Function name + modifier badge (payable / view / nonpayable)
 *   - Full Solidity-style signature in a monospace block
 *   - Prose description
 *   - Parameters table (name · type · description) — omitted when empty
 *   - Return value description — omitted when absent
 *   - Optional usage example in a code block
 *
 * Badge colours (using existing globals.css tokens):
 *   payable     → green  (--price-up: 142 71% 45%)
 *   view        → purple (--chart-1: 263 65% 62%)
 *   nonpayable  → neutral (--muted / --border)
 *
 * Usage in .mdx files:
 *   <FunctionCard
 *     name="register"
 *     signature="register(address backupAddress, uint256 inactivityPeriod) external payable"
 *     modifier="payable"
 *     description="Creates your vault. Provide a backup address and inactivity period in seconds."
 *     params={[
 *       { name: 'backupAddress',    type: 'address', description: 'Wallet that receives your ETH if recovery triggers.' },
 *       { name: 'inactivityPeriod', type: 'uint256', description: 'Timer duration in seconds. Min 180 days, max 3,650 days.' },
 *     ]}
 *     returns="Nothing — emits RecoveryRegistered on success."
 *     example={`// Register with a 365-day timer\nawait vault.write.register([backupAddr, 365n * 24n * 3600n])`}
 *   />
 *
 * Server component — purely presentational.
 */

import type { ReactNode } from 'react'
import { cn }             from '@/lib/utils'

// --- Types ---
export interface FunctionParam {
  /** Parameter name as it appears in the Solidity signature */
  name:        string
  /** Solidity type — e.g. 'address', 'uint256', 'bool' */
  type:        string
  /** Plain-English description of what this parameter does */
  description: string
}

export type FunctionModifier = 'payable' | 'view' | 'nonpayable'

export interface FunctionCardProps {
  /** Function name — e.g. 'register', 'getRecoveryConfig' */
  name:        string
  /** Full Solidity-style signature string */
  signature:   string
  /** Plain-English description of what the function does */
  description: string
  /** State mutability — controls the modifier badge colour */
  modifier?:   FunctionModifier
  /** Parameter definitions — renders a table when provided */
  params?:     FunctionParam[]
  /** Description of the return value — omitted for void functions */
  returns?:    string
  /** Optional code example (shown in a monospace block) */
  example?:    string
}

// --- Modifier badge configuration ---
interface BadgeConfig {
  label:        string
  containerCls: string
  textCls:      string
}

const MODIFIER_BADGE: Record<FunctionModifier, BadgeConfig> = {
  payable: {
    label:        'payable',
    // --price-up: 142 71% 45%
    containerCls: 'bg-[hsl(142_71%_45%/0.1)] border-[hsl(142_71%_45%/0.25)]',
    textCls:      'text-[hsl(142_71%_58%)]',
  },
  view: {
    label:        'view',
    // --chart-1: 263 65% 62%
    containerCls: 'bg-[hsl(263_65%_62%/0.1)] border-[hsl(263_65%_62%/0.25)]',
    textCls:      'text-[hsl(263_65%_72%)]',
  },
  nonpayable: {
    label:        'nonpayable',
    containerCls: 'bg-muted border-border',
    textCls:      'text-muted-foreground',
  },
}

// --- Sub-components ---
function ModifierBadge({ modifier }: { modifier: FunctionModifier }) {
  const config = MODIFIER_BADGE[modifier]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5',
        'text-[10px] font-semibold tracking-wide',
        config.containerCls,
        config.textCls,
      )}
    >
      {config.label}
    </span>
  )
}

function ParamsTable({ params }: { params: FunctionParam[] }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Parameters
      </p>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-border/50 bg-muted/30">
            <tr>
              {['Name', 'Type', 'Description'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {params.map((param) => (
              <tr
                key={param.name}
                className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/20"
              >
                <td className="px-4 py-3 align-top">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                    {param.name}
                  </code>
                </td>
                <td className="px-4 py-3 align-top">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-[hsl(263_65%_70%)]">
                    {param.type}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm leading-relaxed text-muted-foreground align-top">
                  {param.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReturnsRow({ returns }: { returns: string }) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Returns
      </p>
      <p className="text-sm leading-relaxed text-foreground/80">{returns}</p>
    </div>
  )
}

function ExampleBlock({ example }: { example: string }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Example
      </p>
      <pre className="overflow-x-auto rounded-lg border border-border/50 bg-[hsl(0_0%_4%)] p-4 font-mono text-xs leading-relaxed text-foreground">
        <code>{example}</code>
      </pre>
    </div>
  )
}

// --- FunctionCard ---
export function FunctionCard({
  name,
  signature,
  description,
  modifier,
  params,
  returns,
  example,
}: FunctionCardProps) {
  return (
    <div
      className={cn(
        'my-6 rounded-xl border border-border/50',
        'bg-card',
        'overflow-hidden',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-3.5">
        {modifier && <ModifierBadge modifier={modifier} />}
        <h3 className="font-mono text-base font-semibold text-foreground">
          {name}
        </h3>
      </div>

      {/* Body */}
      <div className="px-5 py-4">

        {/* Signature block */}
        <pre className="overflow-x-auto rounded-lg border border-border/40 bg-[hsl(0_0%_4%)] p-3.5 font-mono text-xs leading-relaxed text-foreground/90">
          <code>{signature}</code>
        </pre>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          {description}
        </p>

        {/* Parameters table — only when params are provided */}
        {params && params.length > 0 && (
          <ParamsTable params={params} />
        )}

        {/* Return value */}
        {returns && <ReturnsRow returns={returns} />}

        {/* Code example */}
        {example && <ExampleBlock example={example} />}

      </div>
    </div>
  )
}
