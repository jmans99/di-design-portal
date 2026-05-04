'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { MAIN_NAV_LINKS, GUIDELINES_DROPDOWN_LINKS, MATERIALS_DROPDOWN_LINKS } from '@/lib/nav'

const GUIDELINES_LABEL = 'Guidelines'
const MATERIALS_LABEL = 'Materials'
const GUIDELINES_SUB_ID = 'nav-guidelines-sub'
const MATERIALS_SUB_ID = 'nav-materials-sub'

export function AppHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [expandedGuidelines, setExpandedGuidelines] = useState(false)
  const [expandedMaterials, setExpandedMaterials] = useState(false)
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [materialsOpen, setMaterialsOpen] = useState(false)
  const guidelinesRef = useRef<HTMLDivElement>(null)
  const materialsRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<Record<string, HTMLElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; right: number; transition: string } | null>(null)

  const isActive = (path: string) => {
    if (path === '/logos') return pathname === '/logos' || pathname === '/'
    if (path === '/typography') return pathname === '/typography' || pathname === '/colors'
    return pathname === path || pathname.startsWith(path + '/')
  }

  const isGuidelinesActive = GUIDELINES_DROPDOWN_LINKS.some((c) => isActive(c.path))
  const isMaterialsActive = MATERIALS_DROPDOWN_LINKS.some((c) => isActive(c.path))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
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
        : mainActive?.id ?? null

    if (!activeId || !navRef.current) {
      queueMicrotask(() => setIndicator(null))
      return
    }
    const el = itemRefs.current[activeId]
    if (!el) return

    const navRect = navRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const newLeft = elRect.left - navRect.left + 8
    const newRight = navRect.right - elRect.right + 8

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

  return (
    <header
      className={`sticky top-0 z-[100] border-b border-border border-t-[3px] border-t-primary transition-smooth ${
        isMenuOpen ? 'bg-white' : 'bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
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

        <nav ref={navRef} className="relative hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {MAIN_NAV_LINKS.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                href={item.path}
                ref={(el) => {
                  itemRefs.current[item.id] = el
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-[500] transition-smooth ${
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <div className="relative z-[100]" ref={guidelinesRef}>
            <button
              type="button"
              ref={(el) => {
                itemRefs.current.guidelines = el
              }}
              onClick={() => {
                setGuidelinesOpen((v) => !v)
                setMaterialsOpen(false)
              }}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-[500] transition-smooth ${
                isGuidelinesActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {GUIDELINES_LABEL}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${guidelinesOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {guidelinesOpen && (
              <div className="absolute right-0 top-full z-[100] mt-3 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg">
                {GUIDELINES_DROPDOWN_LINKS.map((child) => (
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

          <div className="relative z-[100]" ref={materialsRef}>
            <button
              type="button"
              ref={(el) => {
                itemRefs.current.materials = el
              }}
              onClick={() => {
                setMaterialsOpen((v) => !v)
                setGuidelinesOpen(false)
              }}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-[500] transition-smooth ${
                isMaterialsActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {MATERIALS_LABEL}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${materialsOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {materialsOpen && (
              <div className="absolute right-0 top-full z-[100] mt-3 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg">
                {MATERIALS_DROPDOWN_LINKS.map((child) => (
                  <Link
                    key={child.id}
                    href={child.path}
                    onClick={() => setMaterialsOpen(false)}
                    className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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

        <div className="lg:hidden">
          <HamburgerMenu
            fullWidth
            onOpenChange={(open) => {
              setIsMenuOpen(open)
              if (!open) {
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
                      <span className="font-heading text-2xl font-semibold leading-snug text-foreground">
                        {item.label}
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}

                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedGuidelines((v) => !v)
                        setExpandedMaterials(false)
                      }}
                      aria-expanded={expandedGuidelines}
                      aria-controls={GUIDELINES_SUB_ID}
                      className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                    >
                      <span className="font-heading text-2xl font-semibold leading-snug text-foreground">
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
                      }}
                      aria-expanded={expandedMaterials}
                      aria-controls={MATERIALS_SUB_ID}
                      className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/60 active:scale-[0.99]"
                    >
                      <span className="font-heading text-2xl font-semibold leading-snug text-foreground">
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
