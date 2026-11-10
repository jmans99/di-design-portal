'use client'

import type { ReactNode } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PreviewTheme = 'light' | 'dark'

/**
 * The canonical preview surface used across the site (Logos, Illustrations, ...).
 * A bordered, rounded card with optional floating controls in the top-right and
 * centered content. No "Live Preview" heading: the box speaks for itself.
 * The canvas shows the real file, so it is white (or near-black with `dark`)
 * in both site themes.
 */
export function PreviewPanel({
  children,
  controls,
  dark = false,
  className,
  contentClassName,
}: {
  children: ReactNode
  controls?: ReactNode
  dark?: boolean
  className?: string
  contentClassName?: string
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border transition-smooth lg:min-h-[400px]',
        dark ? 'border-preview-dark-border bg-preview-dark' : 'border-line-card bg-preview-light',
        className,
      )}
    >
      {controls ? <div className="absolute right-4 top-4 z-10">{controls}</div> : null}
      <div className={cn('flex w-full items-center justify-center p-12', contentClassName)}>
        {children}
      </div>
    </div>
  )
}

/** Floating Light / Dark segmented pill, sits inside a PreviewPanel's controls slot. */
export function PreviewThemeToggle({
  value,
  onChange,
}: {
  value: PreviewTheme
  onChange: (value: PreviewTheme) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-toggle-track p-[3px]">
      {(['light', 'dark'] as const).map((mode) => {
        const Icon = mode === 'light' ? Sun : Moon
        const active = value === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={active}
            className={`focus-ring flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
              active ? 'bg-thumb text-ink shadow-thumb' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {mode}
          </button>
        )
      })}
    </div>
  )
}
