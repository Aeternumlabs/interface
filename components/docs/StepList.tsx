/**
 * components/docs/StepList.tsx
 *
 * Sequential step components for the User Guide and Testnet Walkthrough.
 *
 * Two exports:
 *   StepList  — wrapper that arranges steps vertically and hides the
 *               connector line after the last step
 *   StepItem  — individual step with a numbered circle, title, and content
 *
 * Connector line:
 *   The vertical line between steps is a '.step-line' div inside each item.
 *   StepList uses the Tailwind arbitrary variant
 *   '[&>div:last-child_.step-line]:hidden' to suppress it on the last step —
 *   no JavaScript required.
 *
 * Usage in .mdx files:
 *   <StepList>
 *     <StepItem step={1} title="Connect your wallet">
 *       Open the Aeternum app and click **Connect Wallet** in the top-right
 *       corner. Select your preferred wallet from the RainbowKit modal.
 *     </StepItem>
 *
 *     <StepItem step={2} title="Switch to Sepolia">
 *       The app will prompt you to switch networks. Confirm the switch
 *       to Ethereum Sepolia in your wallet.
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
  /** Step number displayed in the circle indicator */
  step:     number
  /** Bold step heading */
  title:    string
  children: ReactNode
}

// --- StepList — wrapper ---
/**
 * Wraps a sequence of StepItem components.
 * The '[&>div:last-child_.step-line]:hidden' selector automatically hides
 * the connector line on the last step without any prop threading.
 */
export function StepList({ children }: StepListProps) {
  return (
    <div
      className={cn(
        'my-6',
        // Hide the .step-line connector inside the last step child
        '[&>div:last-child_.step-line]:hidden',
      )}
    >
      {children}
    </div>
  )
}

// --- StepItem — individual step ---
export function StepItem({ step, title, children }: StepItemProps) {
  return (
    <div className="relative flex gap-4">

      {/* Left column: circle + connector line */}
      <div className="flex flex-col items-center">

        {/* Numbered circle */}
        <div
          aria-hidden="true"
          className={cn(
            'flex size-7 shrink-0 items-center justify-center',
            'rounded-full border border-border',
            'bg-accent',
            'text-xs font-bold text-foreground',
            'select-none',
          )}
        >
          {step}
        </div>

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
