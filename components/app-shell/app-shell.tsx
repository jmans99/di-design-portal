'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ArrowUpRight, ChevronDown, ChevronRight, Clock, PanelLeft, Search } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { DotOrb } from '@/components/dot/dot-orb'
import { SearchProvider, useSearchPalette } from '@/components/search/search-palette'
import { AI_SKILLS_ITEM, SIDEBAR_GROUPS, activeNavItem, type NavGroup, type NavItem } from '@/lib/nav'
import { dropRecent, useRecent } from '@/lib/dot/recent'
import { externalLinkLabel, inPortalDeckFlow } from '@/lib/external-tools'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

const ICON_STROKE = 1.5
const SIDEBAR_WIDTH = '264px'

/** Rows: 34px, 14px, secondary text; selected = #EEF1F4, main text, 600 (docs/design/dot-home.md, section 1). */
const ROW =
  'focus-ring h-[34px] gap-2.5 rounded-lg px-2.5 text-sm text-ink-secondary hover:bg-[#F1F3F5] hover:text-ink data-[active=true]:bg-[#EEF1F4] data-[active=true]:font-semibold data-[active=true]:text-ink [&>svg]:size-4'
const CHILD_ROW =
  'focus-ring flex h-[30px] w-full min-w-0 items-center gap-2 rounded-lg pl-9 pr-2.5 text-[13px] text-ink-secondary hover:bg-[#F1F3F5] hover:text-ink data-[active=true]:bg-[#EEF1F4] data-[active=true]:font-semibold data-[active=true]:text-ink'
const TAG = 'ml-auto shrink-0 text-[11px] font-normal text-ink-muted'

/**
 * App shell: side panel on the left (icons only when collapsed on desktop, a
 * sheet on mobile) and the page on the right. Pages other than the home page
 * get a slim top bar with the page title; the home page draws its own.
 */
export function AppShell({ defaultOpen, children }: { defaultOpen: boolean; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen} style={{ '--sidebar-width': SIDEBAR_WIDTH } as React.CSSProperties}>
        {/* The (main) layout reads a cookie, so it renders per request and the URL is known on the server: no Suspense needed. */}
        <AppSidebar />
        <div className="relative flex min-h-svh min-w-0 flex-1 flex-col bg-background">
          {pathname !== '/' && <AppTopBar />}
          {children}
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}

function AppSidebar() {
  const pathname = usePathname()
  const newParam = useSearchParams().get('new')
  const { isMobile, setOpenMobile } = useSidebar()
  const { setOpen: setSearchOpen } = useSearchPalette()
  const recent = useRecent()
  const closeOnMobile = () => setOpenMobile(false)

  // Decks and two-pagers open the external builder now: drop old "Soon" briefs for them from Recent.
  useEffect(() => {
    if (!inPortalDeckFlow) dropRecent((item) => /^\/\?(.*&)?new=(deck|two-pager)(&|$)/.test(item.href))
  }, [])
  const active = activeNavItem(pathname, newParam)

  return (
    <Sidebar collapsible="icon">
      {isMobile && (
        <>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">{SITE.name} sections</SheetDescription>
        </>
      )}
      <SidebarHeader className="gap-[18px] px-3 pb-0 pt-5 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link href="/" onClick={closeOnMobile} aria-label="Dot home" className="focus-ring flex min-w-0 items-center gap-2.5 rounded-lg">
            <DotOrb size={28} />
            <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-heading text-sm font-semibold leading-[18px] text-ink">Welcome to Dot</span>
              <span className="text-xs leading-4 text-ink-muted">Your AI content designer</span>
            </span>
          </Link>
          {/* The one orange accent. Navy on orange: 5.25:1. */}
          <span className="shrink-0 rounded-full bg-accent-orange px-2 py-0.5 text-[11px] font-semibold leading-4 text-navy group-data-[collapsible=icon]:hidden">
            Beta
          </span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search (⌘K)"
              onClick={() => {
                closeOnMobile()
                setSearchOpen(true)
              }}
              className="focus-ring h-[34px] gap-2 rounded-lg border border-[#E6EAEE] bg-[#F3F5F7] px-2.5 text-sm text-ink-muted hover:bg-[#EEF1F4] hover:text-ink-muted [&>svg]:size-4"
            >
              <Search strokeWidth={ICON_STROKE} aria-hidden />
              <span>Search</span>
              <kbd className="ml-auto rounded-md border border-line-card bg-white px-1.5 font-sans text-[11px] leading-[18px] text-ink-muted group-data-[collapsible=icon]:hidden">
                ⌘K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-[18px] px-3 pb-5 pt-[18px] group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/' && !active} tooltip="New chat" className={ROW}>
              <Link href="/" onClick={closeOnMobile} aria-current={pathname === '/' && !active ? 'page' : undefined}>
                <DotOrb size={16} />
                <span>New chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="gap-0.5">
          {SIDEBAR_GROUPS.map((group) => (
            <SidebarGroupRow key={group.id} group={group} activeId={active?.id} onNavigate={closeOnMobile} />
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={active?.id === AI_SKILLS_ITEM.id} tooltip={AI_SKILLS_ITEM.label} className={ROW}>
              <Link href={AI_SKILLS_ITEM.path} onClick={closeOnMobile} aria-current={active?.id === AI_SKILLS_ITEM.id ? 'page' : undefined}>
                <AI_SKILLS_ITEM.icon strokeWidth={ICON_STROKE} aria-hidden />
                <span>{AI_SKILLS_ITEM.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {recent.length > 0 && (
          <SidebarMenu className="group-data-[collapsible=icon]:hidden">
            <CollapsibleRow label="Recent" icon={Clock} defaultOpen>
              {recent.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={closeOnMobile} className={CHILD_ROW} title={item.label}>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </CollapsibleRow>
          </SidebarMenu>
        )}
      </SidebarContent>

      {/* Pinned to the bottom: SidebarContent takes the free height and scrolls, so the footer never overlaps the groups. */}
      <SidebarFooter className="border-t border-line-divider p-0 px-3 group-data-[collapsible=icon]:hidden">
        <Link href="/" onClick={closeOnMobile} className="focus-ring flex rounded-lg px-2 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.headerLogo.src} alt={SITE.headerLogo.alt} className="h-6 w-auto" />
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function SidebarGroupRow({ group, activeId, onNavigate }: { group: NavGroup; activeId?: string; onNavigate: () => void }) {
  const hasActive = group.items.some((i) => i.id === activeId)
  return (
    <CollapsibleRow label={group.label} icon={group.icon} defaultOpen={group.defaultOpen || hasActive}>
      {group.items.map((item) => (
        <li key={item.id}>
          <ChildRow item={item} active={item.id === activeId} onNavigate={onNavigate} />
        </li>
      ))}
    </CollapsibleRow>
  )
}

/** A group row with a chevron; children are hidden while the side panel is collapsed to icons. */
function CollapsibleRow({
  label,
  icon: Icon,
  defaultOpen,
  children,
}: {
  label: string
  icon: NavGroup['icon']
  defaultOpen: boolean
  children: React.ReactNode
}) {
  // null = follow defaultOpen (it opens when the current page moves into the group); a click makes it explicit.
  const [userOpen, setUserOpen] = useState<boolean | null>(null)
  const open = userOpen ?? defaultOpen
  const { state, setOpen: setSidebarOpen } = useSidebar()
  const Chevron = open ? ChevronDown : ChevronRight

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={(next) => {
        // Collapsed to icons: a click on the group opens the side panel with the group open.
        if (state === 'collapsed') {
          setSidebarOpen(true)
          setUserOpen(true)
        } else setUserOpen(next)
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={label} className={ROW}>
            <Icon strokeWidth={ICON_STROKE} aria-hidden />
            <span>{label}</span>
            <Chevron className="ml-auto !size-3.5 text-ink-muted group-data-[collapsible=icon]:hidden" strokeWidth={ICON_STROKE} aria-hidden />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-0.5 flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">{children}</ul>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function ChildRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  if (item.soon) {
    return (
      <span aria-disabled className={cn(CHILD_ROW, 'cursor-default text-ink-muted hover:bg-transparent hover:text-ink-muted')}>
        <span className="truncate">{item.label}</span>
        <span className={TAG}>Soon</span>
      </span>
    )
  }
  if (item.external) {
    return (
      <a href={item.path} target="_blank" rel="noopener noreferrer" onClick={onNavigate} aria-label={externalLinkLabel(item.label)} className={CHILD_ROW}>
        <span className="truncate">{item.label}</span>
        <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />
      </a>
    )
  }
  return (
    <Link href={item.path} onClick={onNavigate} data-active={active} aria-current={active ? 'page' : undefined} className={CHILD_ROW}>
      <span className="truncate">{item.label}</span>
      {item.tag && <span className={TAG}>{item.tag}</span>}
    </Link>
  )
}

/** Slim top bar on every page but the home page: side panel toggle and page title. */
function AppTopBar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-[10.7px] md:px-6">
      <SidePanelToggle />
      <span aria-hidden className="h-4 w-px bg-border" />
      <p className="truncate font-heading text-[15px] font-medium text-foreground">{activeNavItem(pathname, null)?.label ?? ''}</p>
    </header>
  )
}

/** Opens and closes the side panel (a sheet on mobile). */
export function SidePanelToggle() {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="focus-ring -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-[#EEF1F4] hover:text-ink"
      aria-label="Toggle side panel"
    >
      <PanelLeft className="h-[18px] w-[18px]" strokeWidth={ICON_STROKE} aria-hidden />
    </button>
  )
}
