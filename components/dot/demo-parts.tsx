'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'
import { SidePanelToggle } from '@/components/app-shell/app-shell'
import { CHIP } from '@/components/dot/conversation'
import { ComingSoonPill } from '@/components/dot/format-tiles'
import { cn } from '@/lib/utils'

/**
 * Pieces shared by the scripted demos (the deck demo and the Country pitch
 * demo; docs/design/dot-home.md): buttons, answer chips, the progress list,
 * the review rows and the top bar.
 */

export const PRIMARY_BUTTON =
  'focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50'
export const TEXT_BUTTON = 'focus-ring rounded text-[13px] font-semibold text-link hover:text-link-hover'
export const SKIP_CHIP = cn(CHIP, 'border-dashed border-line-dashed')

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** prefers-reduced-motion as React state (false on the server, so the first render matches). */
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)')
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    reducedMotion,
    () => false,
  )
}

/** Answer chips under a question, plus a dashed Skip when the question can be skipped. `pressed` shows one as picked. */
export function Chips({
  label,
  options,
  onPick,
  onSkip,
  pressed,
}: {
  label: string
  options: { value: string; label: string }[]
  onPick?: (value: string) => void
  onSkip?: () => void
  pressed?: string
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={pressed === undefined ? undefined : pressed === o.value} onClick={() => onPick?.(o.value)} className={CHIP}>
          {o.label}
        </button>
      ))}
      {onSkip && (
        <button type="button" onClick={onSkip} className={SKIP_CHIP}>
          Skip
        </button>
      )}
    </div>
  )
}

/** "Generating": the steps done so far, with a spinner on the current one (aria-live). */
export function ProgressList({ labels, finished }: { labels: string[]; finished: number }) {
  return (
    <ul aria-live="polite" aria-label="Progress" className="flex flex-col gap-2">
      {labels.map((label, i) =>
        i > finished ? null : (
          <li key={label} className="flex items-center gap-2 text-sm text-ink-secondary">
            {i < finished ? (
              <Check className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} aria-hidden />
            ) : (
              <Loader2 className="h-4 w-4 shrink-0 text-ink-muted motion-safe:animate-spin" strokeWidth={2} aria-hidden />
            )}
            {label}
            <span className="sr-only">{i < finished ? ' (done)' : ''}</span>
          </li>
        ),
      )}
    </ul>
  )
}

export type ReviewRow<K extends string> = { key: K; label: string; value: React.ReactNode; fixed?: boolean }

/** The review card: one row per answer, each with a Change link (none on a fixed row). */
export function ReviewRows<K extends string>({ rows, onChange }: { rows: ReviewRow<K>[]; onChange: (key: K) => void }) {
  return (
    <dl className="overflow-hidden rounded-2xl border border-line-card bg-card">
      {rows.map((row) => (
        <div key={row.key} className="flex items-baseline gap-3 border-b border-line-divider px-4 py-2.5 last:border-b-0">
          <dt className="w-[88px] shrink-0 text-xs text-ink-muted sm:w-[132px]">{row.label}</dt>
          <dd className="min-w-0 flex-1 break-words text-sm text-ink">{row.value}</dd>
          {row.fixed ? (
            <span aria-hidden className="w-[52px] shrink-0" />
          ) : (
            <button type="button" onClick={() => onChange(row.key)} aria-label={`Change ${row.label.toLowerCase()}`} className={cn(TEXT_BUTTON, 'shrink-0')}>
              Change
            </button>
          )}
        </div>
      ))}
    </dl>
  )
}

/** The demo top bar: side panel toggle, title, the neutral "Demo" pill and Start over. */
export function DemoTopBar({
  title,
  startOverHref = '/',
  showPill = true,
  showToggle = true,
}: {
  title: string
  startOverHref?: string
  showPill?: boolean
  showToggle?: boolean
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line-divider bg-background/90 px-4 backdrop-blur md:px-6">
      {showToggle && (
        <>
          <SidePanelToggle />
          <span aria-hidden className="h-4 w-px bg-line-divider" />
        </>
      )}
      <h1 className="truncate text-sm font-semibold text-ink">{title}</h1>
      {showPill && (
        <span className="shrink-0">
          <ComingSoonPill>Demo</ComingSoonPill>
        </span>
      )}
      {/* Leaves room for the floating Giga notice (components/giga-notice.tsx), so it never covers Start over. */}
      <Link
        href={startOverHref}
        className="focus-ring ml-auto mr-[max(0px,calc(var(--giga-notice-space,0px)_-_1rem))] shrink-0 rounded text-sm font-semibold text-link hover:text-link-hover md:mr-[max(0px,calc(var(--giga-notice-space,0px)_-_1.5rem))]"
      >
        Start over
      </Link>
    </header>
  )
}
