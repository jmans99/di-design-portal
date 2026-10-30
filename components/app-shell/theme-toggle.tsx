'use client'

import { useRef, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'system', label: 'System theme', icon: Monitor },
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
] as const

const noop = () => () => {}

/**
 * Theme switch in the side panel footer: a segmented control of three round
 * buttons (System, Light, Dark). A radio group: arrow keys move the choice,
 * Tab enters on the selected button (docs/design/dot-home.md, "Theme").
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  // The saved theme is only known in the browser: select nothing until then, so the server markup matches.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  const current = mounted ? (theme ?? 'system') : null
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (from: number, step: number) => {
    const next = (from + step + OPTIONS.length) % OPTIONS.length
    setTheme(OPTIONS[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Theme" className={cn('inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-subtle p-[3px]', className)}>
      {OPTIONS.map(({ value, label, icon: Icon }, i) => {
        const checked = current === value
        return (
          <button
            key={value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            // Roving tab stop: only the selected button (or the first, before the theme is known) is in the tab order.
            tabIndex={checked || (current === null && i === 0) ? 0 : -1}
            onClick={() => setTheme(value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                move(i, 1)
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                move(i, -1)
              }
            }}
            className={cn(
              'focus-ring flex h-[26px] w-[26px] items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink',
              checked && 'bg-thumb text-ink shadow-thumb',
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
