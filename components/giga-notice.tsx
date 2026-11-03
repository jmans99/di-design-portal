'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'di-portal:giga-notice-dismissed'
const GIGA_PORTAL_URL = 'https://giga-design-portal.vercel.app'
/** Space the card takes from the right edge, plus a 12px gap. The top bar title reads it (app-shell.tsx). */
const SPACE_VAR = '--giga-notice-space'
const TITLE_GAP = 12

function readDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

// Another tab dismissing the notice hides it here too.
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

/**
 * Floating notice, top right of every page: points people who only work on Giga
 * to the Giga design portal. Sits inside the 56px top bar (44px tall, centred).
 * The server renders nothing (counts as dismissed) and the browser shows it
 * after mount only if it wasn't dismissed, so it never flashes.
 */
export function GigaNotice() {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true)
  const [phase, setPhase] = useState<'open' | 'leaving' | 'closed'>('open')
  const visible = phase === 'leaving' || (phase === 'open' && !dismissed)
  const ref = useRef<HTMLDivElement>(null)

  // Tell the top bar how much room to leave so a long title shortens before it reaches the card.
  useEffect(() => {
    const card = ref.current
    if (!visible || !card) return
    const root = document.documentElement
    const update = () =>
      root.style.setProperty(SPACE_VAR, `${Math.ceil(root.clientWidth - card.getBoundingClientRect().left + TITLE_GAP)}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(card)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty(SPACE_VAR)
    }
  }, [visible])

  if (!visible) return null

  const hide = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Storage blocked: the notice is still hidden for this page view.
    }
    setPhase('leaving')
  }

  return (
    <div
      ref={ref}
      // Fades in on show and out on close (150ms). Reduced motion shortens both to nothing (app/globals.css).
      onAnimationEnd={() => phase === 'leaving' && setPhase('closed')}
      className={cn(
        // z-45: above the top bar (z-40), below dialogs, the mobile menu (z-50) and toasts.
        // Phone: a 36px one-line pill centred in the 56px bar (10px above and below). md and up: the 44px two-line card.
        'fixed right-3 top-2.5 z-[45] flex items-stretch rounded-lg border border-line-card bg-card font-sans shadow-tile md:right-6 md:top-1.5 md:items-start',
        'duration-150',
        phase === 'leaving' ? 'animate-out fade-out-0 fill-mode-forwards' : 'animate-in fade-in-0',
      )}
    >
      <a
        href={GIGA_PORTAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Only working on Giga? Use the Giga design portal, opens in a new tab"
        className="focus-ring group flex flex-col justify-center rounded-[11px] py-[5px] pl-3 pr-0.5 md:justify-start md:pl-3.5"
      >
        {/* Line 1 is for md and up only; phones get the one-line version below. */}
        <span className="hidden text-xs font-normal leading-[15px] text-ink-muted md:block">Only working on Giga?</span>
        <span className="flex items-center gap-1 text-[13px] font-semibold leading-4 text-ink group-hover:text-primary md:text-sm md:leading-[17px]">
          <span className="md:hidden">Giga portal</span>
          <span className="hidden md:inline">Use the Giga design portal</span>
          <ExternalLink className="size-3 shrink-0 md:size-3.5" strokeWidth={2} aria-hidden />
        </span>
      </a>
      <button
        type="button"
        onClick={hide}
        aria-label="Hide this notice"
        className="focus-ring m-px flex size-8 shrink-0 items-center justify-center rounded-md text-ink-muted hover:text-ink md:m-[5px]"
      >
        <X className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}
