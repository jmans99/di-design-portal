'use client'

import { Moon, Sun } from 'lucide-react'
import type { DotBackground } from '@/lib/giga-maps/abstract/layout'
import { DOT_BACKGROUNDS } from '@/lib/giga-maps/abstract/render'

const CHECKER = 'repeating-conic-gradient(#cacaca 0 25%, #ffffff 0 50%) 0 0 / 7px 7px'

/**
 * Background pill for the Abstract map preview. Same markup, classes and
 * icons as PreviewThemeToggle (components/ui/preview-panel.tsx), which stays
 * Light / Dark for the rest of the site; Navy and Transparent add a swatch
 * the size of the sun and moon icons. Phones show icons and swatches only.
 */
export function BackgroundToggle({
  value,
  onChange,
}: {
  value: DotBackground
  onChange: (value: DotBackground) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Background"
      className="flex items-center gap-0.5 rounded-full bg-toggle-track p-[3px]"
    >
      {(Object.keys(DOT_BACKGROUNDS) as DotBackground[]).map((mode) => {
        const active = value === mode
        const label = DOT_BACKGROUNDS[mode].label
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(mode)}
            className={`focus-ring flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
              active ? 'bg-thumb text-ink shadow-thumb' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {mode === 'light' ? (
              <Sun className="h-3.5 w-3.5" />
            ) : mode === 'dark' ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-line-card"
                style={{ background: DOT_BACKGROUNDS[mode].fill ?? CHECKER }}
              />
            )}
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
