/**
 * components/docs/StepList.tsx
 *
 * Sequential step components for the User Guide and Testnet Walkthrough.
 *
 * Two exports:
 *   StepList  — wrapper that arranges steps vertically, initializes the CSS counter, 
 *                and hides the connector line after the last step.
 *   StepItem  — individual step that automatically displays its sequential number,
 *                title, and content.
 *
 * Usage in .mdx files (No 'step' prop required anymore!):
 *   <StepList>
 *     <StepItem title="Connect your wallet">
 *       Open the Aeternum app and click **Connect Wallet**.
 *     </StepItem>
 *
 *     <StepItem title="Switch to Sepolia">
 *       Confirm the switch to Ethereum Sepolia in your wallet.
 *     </StepItem>
 *   </StepList>
 *
 * Server component — no client state required.
 */

import type { ReactNode } from 'react'
import { cn }             from '@/lib/utils'

// --- Types ---
interface StepListProps {
  children: ReactNode
}

export interface StepItemProps {
  /** Optional step number override (CSS counters handle numbering automatically) */
  step?:    number
  /** Bold step heading */
  title:    string
  children: ReactNode
}

// --- StepList — wrapper ---
/**
 * Wraps a sequence of StepItem components.
 * '[counter-reset:step]' initializes an isolated CSS counter for this list.
 * '[&>div:last-child_.step-line]:hidden' automatically hides the connector line on the last step.
 */
export function StepList({ children }: StepListProps) {
  return (
    <div
      className={cn(
        'my-6 [counter-reset:step]',
        // Hide the .step-line connector inside the last step child
        '[&>div:last-child_.step-line]:hidden',
      )}
    >
      {children}
    </div>
  )
}

// --- StepItem — individual step ---
export function StepItem({ title, children }: StepItemProps) {
  return (
    <div className="relative flex gap-4">

      {/* Left column: circle + connector line */}
      <div className="flex flex-col items-center">

        {/* Numbered circle — Powered by auto-incrementing CSS counters */}
        <div
          aria-hidden="true"
          className={cn(
            'flex size-7 shrink-0 items-center justify-center',
            'rounded-full border border-border',
            'bg-accent',
            'text-xs font-bold text-foreground',
            'select-none',
            // Increment the counter and inject it as pseudo-element content
            '[counter-increment:step] before:content-[counter(step)]',
          )}
        />

        {/* Vertical connector line — hidden on last child via StepList selector */}
        <div
          className={cn(
            'step-line',          // targeted by StepList's [&>div:last-child_.step-line]:hidden
            'mt-2 w-px flex-1',
            'bg-border/40',
            'min-h-6',     // ensures line is visible even for short content
          )}
        />

      </div>

      {/* Right column: title + content */}
      <div className="min-w-0 flex-1 pb-8">

        {/* Step title */}
        <p className="pt-0.5 text-[15px] font-semibold leading-tight text-foreground">
          {title}
        </p>

        {/* Step body content */}
        <div
          className={cn(
            'mt-2 text-sm leading-relaxed text-muted-foreground',
            // Style inline elements that MDX may inject
            '[&_strong]:font-semibold [&_strong]:text-foreground',
            '[&_a]:text-[hsl(263_65%_65%)] [&_a]:underline [&_a]:underline-offset-4',
            '[&_a:hover]:text-[hsl(263_65%_75%)]',
            '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5',
            '[&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground',
            // Paragraph spacing inside step content
            '[&>p:first-child]:mt-0',
            '[&>p]:mt-2',
          )}
        >
          {children}
        </div>

      </div>
    </div>
  )
}