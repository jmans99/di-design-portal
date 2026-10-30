'use client'

import { ArrowUpRight, Plus } from 'lucide-react'
import { FormatIcon } from '@/components/dot/format-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OutputType } from '@/lib/brief'
import { getFormat } from '@/lib/dot/formats'
import { externalLinkLabel } from '@/lib/external-tools'
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

/** The round send button in Dot's box and the reply bar: primary, disabled when there is no text. */
export const SEND_BUTTON =
  'focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-line-dashed disabled:text-background'

/** Formats in the + menu (docs/design/dot-home.md, 2d). Social post moved here when "Make a map" took its home tile. */
const MORE_FORMATS: OutputType[] = ['social-post', 'map', 'engagement-map', 'background', 'email-signature']

/**
 * A tile or row that starts a format: a link that opens the external builder
 * in a new tab (decks, two-pagers; lib/external-tools.ts), else a button.
 * `label` is the visible action, used for the link's accessible name.
 */
export function StartTile({
  type,
  label,
  onStart,
  className,
  children,
}: {
  type: OutputType
  label: string
  onStart: (format: OutputType) => void
  className?: string
  children: React.ReactNode
}) {
  const format = getFormat(type)
  if (format.external) {
    return (
      <a href={format.external} target="_blank" rel="noopener noreferrer" aria-label={externalLinkLabel(label, type)} className={className}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={() => onStart(type)} className={className}>
      {children}
    </button>
  )
}

/** The 14px external-link mark after a label that opens a new tab. */
export function ExternalMark({ className }: { className?: string }) {
  return <ArrowUpRight className={cn('inline-block h-3.5 w-3.5 shrink-0 align-[-1px] text-ink-muted', className)} strokeWidth={2} aria-hidden />
}

/** "Coming soon" pill: the Recommended pill's size and shape, in neutral colours. */
export function ComingSoonPill() {
  return (
    <span className="inline-flex rounded-full border border-line-card bg-pill px-2 py-px text-[11px] font-semibold text-pill-muted-foreground">
      Coming soon
    </span>
  )
}

export function RecommendedPill() {
  return (
    <span className="inline-flex rounded-full border border-pill-accent-border bg-pill px-2 py-px text-[11px] font-semibold text-link">
      Recommended
    </span>
  )
}

/** The + menu: the other formats, each to its tool. `children` is the trigger. */
export function MoreMenu({ onStart, children }: { onStart: (format: OutputType) => void; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[260px] rounded-[14px] border-line-card p-1.5 shadow-menu">
        <DropdownMenuLabel className="px-2 pb-1 pt-1.5 text-xs font-normal text-ink-muted">More formats</DropdownMenuLabel>
        {MORE_FORMATS.map((type) => {
          const format = getFormat(type)
          return (
            <DropdownMenuItem
              key={type}
              onSelect={() => onStart(type)}
              className="h-9 cursor-pointer gap-2.5 rounded-lg px-2 text-sm text-ink-secondary focus:bg-selected focus:text-ink"
            >
              <FormatIcon format={format} size={22} />
              {format.action}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The four format tiles, small, for Dot's "couldn't match" reply. */
export function SmallFormatTiles({ onStart }: { onStart: (format: OutputType) => void }) {
  const small = 'focus-ring flex h-14 items-center gap-2.5 rounded-xl border px-3 text-left text-[13px] font-semibold text-ink transition-colors'
  return (
    <div className={styles.smallTiles}>
      {(['deck', 'social-post', 'two-pager'] as const).map((type) => {
        const format = getFormat(type)
        return (
          <StartTile key={type} type={type} label={format.action} onStart={onStart} className={cn(small, 'border-line-card bg-card hover:bg-hover-soft')}>
            <FormatIcon format={format} size={22} />
            <span className="font-heading">{format.action}</span>
            {format.external && <ExternalMark className="ml-auto" />}
          </StartTile>
        )
      })}
      <MoreMenu onStart={onStart}>
        <button type="button" className={cn(small, 'border-dashed border-line-dashed bg-card font-normal text-ink-secondary hover:bg-hover-soft')}>
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-subtle">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </span>
          More
        </button>
      </MoreMenu>
    </div>
  )
}
