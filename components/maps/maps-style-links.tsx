import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Style switch of the Maps pages, in the look of the brand tabs: two links, so each style has its own URL
 * (Map at /materials/maps, Abstract at /materials/maps/abstract).
 */
export function MapsStyleLinks({ active }: { active: 'map' | 'abstract' }) {
  return (
    <nav
      aria-label="Map style"
      className="flex h-8 w-fit items-stretch gap-0.5 rounded-full bg-toggle-track p-[3px]"
    >
      <StyleLink href="/materials/maps" active={active === 'map'}>
        Map
      </StyleLink>
      <StyleLink href="/materials/maps/abstract" active={active === 'abstract'}>
        Abstract
        <span className="rounded-full border border-line-card bg-pill px-1.5 text-[11px] font-semibold leading-4 text-pill-muted-foreground">
          Beta
        </span>
      </StyleLink>
    </nav>
  )
}

function StyleLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'focus-ring inline-flex items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors',
        active ? 'bg-thumb text-ink shadow-thumb' : 'text-ink-secondary hover:text-ink',
      )}
    >
      {children}
    </Link>
  )
}
