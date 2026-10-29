'use client'

import { Plus } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import styles from './dot.module.css'

/** Formats in the + menu (docs/design/dot-home.md, 2d). */
const MORE_FORMATS: OutputType[] = ['map', 'engagement-map', 'background', 'email-signature']

export function RecommendedPill() {
  return (
    <span className="inline-flex rounded-full border border-[#DAF1FF] bg-white px-2 py-px text-[11px] font-semibold text-primary-700">
      Recommended
    </span>
  )
}

/** The + menu: the other formats, each to its tool. `children` is the trigger. */
export function MoreMenu({ onStart, children }: { onStart: (format: OutputType) => void; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[260px] rounded-[14px] border-line-card p-1.5 shadow-[0_16px_40px_rgba(26,42,60,.16)]">
        <DropdownMenuLabel className="px-2 pb-1 pt-1.5 text-xs font-normal text-ink-muted">More formats</DropdownMenuLabel>
        {MORE_FORMATS.map((type) => {
          const format = getFormat(type)
          return (
            <DropdownMenuItem
              key={type}
              onSelect={() => onStart(type)}
              className="h-9 cursor-pointer gap-2.5 rounded-lg px-2 text-sm text-ink-secondary focus:bg-[#EEF1F4] focus:text-ink"
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
          <button
            key={type}
            type="button"
            onClick={() => onStart(type)}
            className={cn(small, 'border-line-card bg-white hover:bg-[#F7F9FA]')}
          >
            <FormatIcon format={format} size={22} />
            <span className="font-heading">{format.action}</span>
          </button>
        )
      })}
      <MoreMenu onStart={onStart}>
        <button type="button" className={cn(small, 'border-dashed border-line-dashed bg-white font-normal text-ink-secondary hover:bg-[#F7F9FA]')}>
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#F2F4F6]">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </span>
          More
        </button>
      </MoreMenu>
    </div>
  )
}
