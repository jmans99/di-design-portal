'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { NAV_GROUPS } from '@/lib/nav'
import { getSite } from '@/lib/site'

const SITE = getSite()

export function AppHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [atVeryTop, setAtVeryTop] = useState(true)
  const [inHeroZone, setInHeroZone] = useState(true)
  /** Mobile accordion: id of the expanded group. */
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  /** Desktop dropdown: id of the open group. */
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Record<string, HTMLElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; right: number; transition: string } | null>(null)

  const isActive = (path: string) => {
    if (path === '/logos') return pathname === '/logos'
    if (path === '/typography') return pathname === '/typography'
    return pathname === path || pathname.startsWith(path + '/')
  }

  const isGroupActive = (group: (typeof NAV_GROUPS)[number]) => group.items.some((c) => isActive(c.path))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      setOpenGroup((id) => {
        const el = id ? dropdownRefs.current[id] : null
        return el && !el.contains(t) ? null : id
      })
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const activeId = NAV_GROUPS.find(isGroupActive)?.id ?? null

    if (!activeId || !navRef.current) {
      queueMicrotask(() => setIndicator(null))
      return
    }
    const el = itemRefs.current[activeId]
    if (!el) return

    const navRect = navRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const newLeft = elRect.left - navRect.left
    const newRight = navRect.right - elRect.right

    setIndicator((prev) => {
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

  // Header over the home hero: fully transparent at the very top, glass once
  // scrolling begins, solid once the hero has scrolled past the header.
  useEffect(() => {
    const onScroll = () => {
      setAtVeryTop(window.scrollY < 10)
      const hero = document.querySelector('main > section')
      setInHeroZone(hero ? hero.getBoundingClientRect().bottom > 80 : window.scrollY < 100)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  // White logo/nav while over the hero video. Every page: transparent at the
  // very top, glass once scrolling begins (dark glass over the hero, light
  // frosted glass over normal content).
  const overHero = pathname === '/' && inHeroZone && !isMenuOpen
  const transparent = atVeryTop && !isMenuOpen

  return (
    <header
      className={`sticky top-0 z-[100] border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500 ease-out-expo ${
        isMenuOpen
          ? 'border-border bg-white backdrop-blur-0'
          : transparent
            ? 'border-transparent bg-transparent shadow-none'
            : overHero
              ? 'border-white/15 bg-white/[0.08] backdrop-blur-[10.7px] shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
              : 'border-border/70 bg-card/70 backdrop-blur-[10.7px] shadow-[0_4px_30px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6">
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/" className="flex items-center gap-4" aria-label="Brand assets home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE.headerLogo.src}
              alt={SITE.headerLogo.alt}
              className={`${SITE.headerLogo.className} w-auto transition-smooth-transform ${overHero ? 'brightness-0 invert' : ''}`}
            />
          </Link>
        </div>

        <nav ref={navRef} className="relative hidden h-full items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_GROUPS.map((group) => {
            const active = isGroupActive(group)
            const colorClass = active
              ? 'text-foreground'
              : overHero
                ? 'text-white/85 hover:text-white'
                : 'text-muted-foreground hover:text-foreground'

            if (group.items.length === 1) {
              const item = group.items[0]
              return (
                <Link
                  key={group.id}
                  href={item.path}
                  ref={(el) => {
                    itemRefs.current[group.id] = el
                  }}
                  className={`relative z-10 rounded-full px-3 py-1.5 text-sm font-[500] transition-smooth ${colorClass}`}
                >
                  {item.label}
                </Link>
              )
            }

            const open = openGroup === group.id
            return (
              <div
                key={group.id}
                className="relative z-[100]"
                ref={(el) => {
                  dropdownRefs.current[group.id] = el
                }}
              >
                <button
                  type="button"
                  ref={(el) => {
                    itemRefs.current[group.id] = el
                  }}
                  onClick={() => setOpenGroup((id) => (id === group.id ? null : group.id))}
                  className={`relative z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-[500] transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${colorClass}`}
                >
                  {group.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {open && (
                  <div className="absolute right-0 top-full z-[100] mt-3 min-w-[180px] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-stripe-lg">
                    {group.items.map((child) => (
                      <Link
                        key={child.id}
                        href={child.path}
                        onClick={() => setOpenGroup(null)}
                        className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {indicator && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 z-0 h-[2px] rounded-full bg-primary-600"
              style={{
                left: indicator.left,
                right: indicator.right,
                transition: indicator.transition,
              }}
            />
          )}
        </nav>

        <div className="lg:hidden">
          <HamburgerMenu
            fullWidth
            light={overHero}
            onOpenChange={(open) => {
              setIsMenuOpen(open)
              if (!open) setExpandedGroup(null)
            }}
          >
            {(close) => (
              <div className="flex flex-col">
                <nav className="flex flex-col divide-y divide-border">
                  {NAV_GROUPS.map((group) => {
                    if (group.items.length === 1) {
                      const item = group.items[0]
                      return (
                        <Link
                          key={group.id}
                          href={item.path}
                          onClick={close}
                          className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                        >
                          <span className="font-heading text-2xl font-medium leading-snug text-foreground">
                            {item.label}
                          </span>
                          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                        </Link>
                      )
                    }

                    const expanded = expandedGroup === group.id
                    const subId = `nav-${group.id}-sub`
                    return (
                      <div key={group.id} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setExpandedGroup((id) => (id === group.id ? null : group.id))}
                          aria-expanded={expanded}
                          aria-controls={subId}
                          className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                        >
                          <span className="font-heading text-2xl font-medium leading-snug text-foreground">
                            {group.label}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </button>
                        <div
                          id={subId}
                          role="group"
                          aria-label={group.label}
                          className={expanded ? 'flex flex-col divide-y divide-border pl-4 pb-2' : 'hidden'}
                        >
                          {group.items.map((child) => (
                            <Link
                              key={child.id}
                              href={child.path}
                              onClick={close}
                              className="group flex w-full items-center justify-between py-3 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                            >
                              <span className="text-lg font-medium text-foreground">{child.label}</span>
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
