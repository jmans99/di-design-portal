import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Style switch of the Maps pages: two links, so each style has its own URL
 * (Map at /materials/maps, Abstract at /materials/maps/abstract).
 */
export function MapsStyleLinks({ active }: { active: 'map' | 'abstract' }) {
  return (
    <nav
      aria-label="Map style"
      className="flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1"
    >
      <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Style</span>
      <StyleLink href="/materials/maps" active={active === 'map'}>
        Map
      </StyleLink>
      <StyleLink href="/materials/maps/abstract" active={active === 'abstract'}>
        Abstract
        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase tracking-wider">
          Beta
        </Badge>
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
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-smooth-transform active:scale-[0.98]',
        active ? 'bg-primary-50 text-primary-700' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  )
}
