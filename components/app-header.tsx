'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const guidelinesRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Record<string, HTMLElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; right: number; transition: string } | null>(null)

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const isGuidelinesActive = pathname.startsWith('/guidelines')

  // Close guidelines dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (guidelinesRef.current && !guidelinesRef.current.contains(e.target as Node)) {
        setGuidelinesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Measure active item and update sliding indicator
  useEffect(() => {
    const activeId = isGuidelinesActive
      ? 'guidelines'
      : NAV_ITEMS.find((item): item is Extract<typeof NAV_ITEMS[number], { type: 'item' }> =>
          item.type === 'item' && isActive(item.path)
        )?.id ?? null

    if (!activeId || !navRef.current) {
      setIndicator(null)
      return
    }
    const el = itemRefs.current[activeId]
    if (!el) return

    const navRect = navRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const newLeft = elRect.left - navRect.left + 8
    const newRight = navRect.right - elRect.right + 8

    setIndicator(prev => {
      if (prev === null) {
        return { left: newLeft, right: newRight, transition: 'none' }
      }
      const movingRight = newLeft > prev.left
      return {
        left: newLeft,
        right: newRight,
        transition: movingRight
          ? 'right 260ms cubic-bezier(0.16, 1, 0.3, 1), left 400ms cubic-bezier(0.16, 1, 0.3, 1) 40ms'
          : 'left 260ms cubic-bezier(0.16, 1, 0.3, 1), right 400ms cubic-bezier(0.16, 1, 0.3, 1) 40ms',
      }
    })
  }, [pathname])

  return (
    <header
      className={`sticky top-0 z-[100] border-b border-border border-t-[3px] border-t-primary transition-smooth ${
        isMenuOpen ? 'bg-white' : 'bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/" className="flex items-center gap-4" aria-label="Giga Brand Assets home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/giga-complete-horizontal.svg"
              alt="Giga"
              className="w-[180px] transition-smooth-transform"
              style={{ height: 'fit-content' }}
            />
          </Link>
        </div>

        {/* Desktop nav — visible md+ */}
        <nav ref={navRef} className="relative hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((entry) => {
            if (entry.type === 'item') {
              const active = isActive(entry.path)
              return (
                <Link
                  key={entry.id}
                  href={entry.path}
                  ref={(el) => { itemRefs.current[entry.id] = el }}
                  className={`rounded-md px-3 py-1.5 text-sm font-[500] transition-smooth ${
                    active
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {entry.label}
                </Link>
              )
            }
            // Group: Guidelines dropdown
            return (
              <div key={entry.label} className="relative z-[100]" ref={guidelinesRef}>
                <button
                  type="button"
                  ref={(el) => { itemRefs.current['guidelines'] = el }}
                  onClick={() => setGuidelinesOpen((v) => !v)}
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-[500] transition-smooth ${
                    isGuidelinesActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {entry.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${guidelinesOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {guidelinesOpen && (
                  <div className="absolute right-0 top-full z-[100] mt-3 min-w-[140px] rounded-lg border border-border bg-card py-1 shadow-lg">
                    {entry.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.path}
                        onClick={() => setGuidelinesOpen(false)}
                        className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Shared sliding indicator */}
          {indicator && (
            <span
              aria-hidden
              className="pointer-events-none absolute h-[2px] rounded-full bg-primary"
              style={{
                bottom: -17,
                left: indicator.left,
                right: indicator.right,
                transition: indicator.transition,
              }}
            />
          )}
        </nav>

        {/* Hamburger menu: below lg */}
        <div className="lg:hidden">
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
