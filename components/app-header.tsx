'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { VISIBLE_MAIN_NAV_LINKS as MAIN_NAV_LINKS, MEDIA_DROPDOWN_LINKS, GUIDELINES_DROPDOWN_LINKS, MATERIALS_DROPDOWN_LINKS } from '@/lib/nav'

const MEDIA_LABEL = 'Media'
const GUIDELINES_LABEL = 'Guidelines'
const MATERIALS_LABEL = 'Materials'
const MEDIA_SUB_ID = 'nav-media-sub'
const GUIDELINES_SUB_ID = 'nav-guidelines-sub'
const MATERIALS_SUB_ID = 'nav-materials-sub'

export function AppHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [atVeryTop, setAtVeryTop] = useState(true)
  const [inHeroZone, setInHeroZone] = useState(true)
  const [expandedMedia, setExpandedMedia] = useState(false)
  const [expandedGuidelines, setExpandedGuidelines] = useState(false)
  const [expandedMaterials, setExpandedMaterials] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [materialsOpen, setMaterialsOpen] = useState(false)
  const mediaRef = useRef<HTMLDivElement>(null)
  const guidelinesRef = useRef<HTMLDivElement>(null)
  const materialsRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Record<string, HTMLElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; right: number; transition: string } | null>(null)

  const isActive = (path: string) => {
    if (path === '/logos') return pathname === '/logos'
    if (path === '/typography') return pathname === '/typography'
    return pathname === path || pathname.startsWith(path + '/')
  }

  const isMediaActive = MEDIA_DROPDOWN_LINKS.some((c) => isActive(c.path))
  const isGuidelinesActive = GUIDELINES_DROPDOWN_LINKS.some((c) => isActive(c.path))
  const isMaterialsActive = MATERIALS_DROPDOWN_LINKS.some((c) => isActive(c.path))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (mediaRef.current && !mediaRef.current.contains(t)) setMediaOpen(false)
      if (guidelinesRef.current && !guidelinesRef.current.contains(t)) setGuidelinesOpen(false)
      if (materialsRef.current && !materialsRef.current.contains(t)) setMaterialsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const mainActive = MAIN_NAV_LINKS.find((item) => isActive(item.path))
    const activeId = isMaterialsActive
      ? 'materials'
      : isGuidelinesActive
        ? 'guidelines'
        : isMediaActive
          ? 'media'
          : mainActive?.id ?? null

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
              src="/logos/unicef-digital-impact-unboxed.svg"
              alt="UNICEF Digital Impact Division"
              className={`h-11 w-auto transition-smooth-transform ${overHero ? 'brightness-0 invert' : ''}`}
            />
          </Link>
        </div>

        <nav ref={navRef} className="relative hidden h-full items-center gap-1 lg:flex" aria-label="Main navigation">
          {MAIN_NAV_LINKS.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                href={item.path}
                ref={(el) => {
                  itemRefs.current[item.id] = el
                }}
                className={`relative z-10 rounded-full px-3 py-1.5 text-sm font-[500] transition-smooth ${
                  active
                    ? 'text-foreground'
                    : overHero
                      ? 'text-white/85 hover:text-white'
                      : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <div className="relative z-[100]" ref={mediaRef}>
            <button
              type="button"
              ref={(el) => {
                itemRefs.current.media = el
              }}
              onClick={() => {
                setMediaOpen((v) => !v)
                setGuidelinesOpen(false)
                setMaterialsOpen(false)
              }}
              className={`relative z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-[500] transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isMediaActive
                  ? 'text-foreground'
                  : overHero
                    ? 'text-white/85 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {MEDIA_LABEL}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${mediaOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {mediaOpen && (
              <div className="absolute right-0 top-full z-[100] mt-3 min-w-[170px] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-stripe-lg">
                {MEDIA_DROPDOWN_LINKS.map((child) => (
                  <Link
                    key={child.id}
                    href={child.path}
                    onClick={() => setMediaOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-[100]" ref={guidelinesRef}>
            <button
              type="button"
              ref={(el) => {
                itemRefs.current.guidelines = el
              }}
              onClick={() => {
                setGuidelinesOpen((v) => !v)
                setMaterialsOpen(false)
                setMediaOpen(false)
              }}
              className={`relative z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-[500] transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isGuidelinesActive
                  ? 'text-foreground'
                  : overHero
                    ? 'text-white/85 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {GUIDELINES_LABEL}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${guidelinesOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {guidelinesOpen && (
              <div className="absolute right-0 top-full z-[100] mt-3 min-w-[160px] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-stripe-lg">
                {GUIDELINES_DROPDOWN_LINKS.map((child) => (
                  <Link
                    key={child.id}
                    href={child.path}
                    onClick={() => setGuidelinesOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-[100]" ref={materialsRef}>
            <button
              type="button"
              ref={(el) => {
                itemRefs.current.materials = el
              }}
              onClick={() => {
                setMaterialsOpen((v) => !v)
                setGuidelinesOpen(false)
                setMediaOpen(false)
              }}
              className={`relative z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-[500] transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isMaterialsActive
                  ? 'text-foreground'
                  : overHero
                    ? 'text-white/85 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {MATERIALS_LABEL}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${materialsOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {materialsOpen && (
              <div className="absolute right-0 top-full z-[100] mt-3 min-w-[180px] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-stripe-lg">
                {MATERIALS_DROPDOWN_LINKS.map((child) => (
                  <Link
                    key={child.id}
                    href={child.path}
                    onClick={() => setMaterialsOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
              if (!open) {
                setExpandedMedia(false)
                setExpandedGuidelines(false)
                setExpandedMaterials(false)
              }
            }}
          >
            {(close) => (
              <div className="flex flex-col">
                <nav className="flex flex-col divide-y divide-border">
                  {MAIN_NAV_LINKS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={close}
                      className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                    >
                      <span className="font-heading text-2xl font-medium leading-snug text-foreground">
                        {item.label}
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}

                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedMedia((v) => !v)
                        setExpandedGuidelines(false)
                        setExpandedMaterials(false)
                      }}
                      aria-expanded={expandedMedia}
                      aria-controls={MEDIA_SUB_ID}
                      className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                    >
                      <span className="font-heading text-2xl font-medium leading-snug text-foreground">
                        {MEDIA_LABEL}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${expandedMedia ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    <div
                      id={MEDIA_SUB_ID}
                      role="group"
                      aria-label={MEDIA_LABEL}
                      className={expandedMedia ? 'flex flex-col divide-y divide-border pl-4 pb-2' : 'hidden'}
                    >
                      {MEDIA_DROPDOWN_LINKS.map((child) => (
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

                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedGuidelines((v) => !v)
                        setExpandedMaterials(false)
                        setExpandedMedia(false)
                      }}
                      aria-expanded={expandedGuidelines}
                      aria-controls={GUIDELINES_SUB_ID}
                      className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                    >
                      <span className="font-heading text-2xl font-medium leading-snug text-foreground">
                        {GUIDELINES_LABEL}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${expandedGuidelines ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    <div
                      id={GUIDELINES_SUB_ID}
                      role="group"
                      aria-label={GUIDELINES_LABEL}
                      className={expandedGuidelines ? 'flex flex-col divide-y divide-border pl-4 pb-2' : 'hidden'}
                    >
                      {GUIDELINES_DROPDOWN_LINKS.map((child) => (
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

                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedMaterials((v) => !v)
                        setExpandedGuidelines(false)
                        setExpandedMedia(false)
                      }}
                      aria-expanded={expandedMaterials}
                      aria-controls={MATERIALS_SUB_ID}
                      className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                    >
                      <span className="font-heading text-2xl font-medium leading-snug text-foreground">
                        {MATERIALS_LABEL}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${expandedMaterials ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    <div
                      id={MATERIALS_SUB_ID}
                      role="group"
                      aria-label={MATERIALS_LABEL}
                      className={expandedMaterials ? 'flex flex-col divide-y divide-border pl-4 pb-2' : 'hidden'}
                    >
                      {MATERIALS_DROPDOWN_LINKS.map((child) => (
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
                </nav>
              </div>
            )}
          </HamburgerMenu>
        </div>
      </div>
    </header>
  )
}
