'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { HamburgerMenu } from '@/components/HamburgerMenu'

const NAV_ITEMS: Array<
  | { type: 'item'; id: string; path: string; label: string; description?: string }
  | { type: 'group'; label: string; description?: string; children: { id: string; path: string; label: string }[] }
> = [
  { type: 'item', id: 'logos', path: '/logos', label: 'Logos', description: 'Download and explore logo variants.' },
  { type: 'item', id: 'illustrations', path: '/illustrations', label: 'Illustrations', description: 'Pictograms in fill or outline, multiple formats.' },
  { type: 'item', id: 'media', path: '/media', label: 'Media', description: 'Photo and video libraries for partners.' },
  { type: 'item', id: 'colors', path: '/colors', label: 'Colors', description: 'Brand palette and tokens.' },
  { type: 'item', id: 'typography', path: '/typography', label: 'Typography', description: 'Type scale and usage.' },
  {
    type: 'group',
    label: 'Guidelines',
    description: 'Video and print guidelines.',
    children: [{ id: 'video-guidelines', path: '/guidelines/video', label: 'Video' }],
  },
]

const GUIDELINES_SUB_ID = 'nav-guidelines-sub'

export function AppHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [expandedGuidelines, setExpandedGuidelines] = useState(false)

  const isActive = (path: string) => {
    if (path === '/logos') return pathname === '/logos' || pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border transition-smooth ${
        isMenuOpen ? 'bg-white' : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/logos" className="flex items-center gap-4" aria-label="Giga Brand Assets home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/giga-complete-horizontal.svg"
              alt="Giga"
              className="w-[180px] transition-smooth-transform md:w-[220px]"
              style={{ height: 'fit-content' }}
            />
          </Link>
          <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />
          <Badge
            variant="secondary"
            className="hidden shrink-0 rounded border-0 [background:unset] p-0 text-sm font-semibold text-accent-foreground sm:inline-flex"
          >
            Brand Assets
          </Badge>
        </div>

        {/* Hamburger menu: all screen sizes */}
        <div>
          <HamburgerMenu fullWidth onOpenChange={(open) => { setIsMenuOpen(open); if (!open) setExpandedGuidelines(false) }}>
            {(close) => (
              <div className="flex flex-col">
                <nav className="flex flex-col divide-y divide-border">
                  {NAV_ITEMS.map((entry) => {
                    if (entry.type === 'item') {
                      return (
                        <Link
                          key={entry.id}
                          href={entry.path}
                          onClick={close}
                          className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                        >
                          <span className="font-heading text-2xl font-semibold leading-snug text-foreground">
                            {entry.label}
                          </span>
                          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                        </Link>
                      )
                    }
                    return (
                      <div key={entry.label} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setExpandedGuidelines((v) => !v)}
                          aria-expanded={expandedGuidelines}
                          aria-controls={GUIDELINES_SUB_ID}
                          className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                        >
                          <span className="font-heading text-2xl font-semibold leading-snug text-foreground">
                            {entry.label}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${expandedGuidelines ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </button>
                        <div
                          id={GUIDELINES_SUB_ID}
                          role="group"
                          aria-label={entry.label}
                          className={expandedGuidelines ? 'flex flex-col divide-y divide-border pl-4 pb-2' : 'hidden'}
                        >
                          {entry.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.path}
                              onClick={close}
                              className="group flex w-full items-center justify-between py-3 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                            >
                              <span className="text-lg font-medium text-foreground">
                                {child.label}
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </nav>
              </div>
            )}
          </HamburgerMenu>
        </div>
      </div>
    </header>
  )
}
