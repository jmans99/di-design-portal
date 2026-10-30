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
import { ThemeToggle } from '@/components/app-shell/theme-toggle'
import { SearchProvider, useSearchPalette } from '@/components/search/search-palette'
import { SIDEBAR_MENU, activeNavItem, type NavGroup, type NavItem } from '@/lib/nav'
import { dropRecent, useRecent } from '@/lib/dot/recent'
import { externalLinkLabel, inPortalDeckFlow } from '@/lib/external-tools'
import type { OutputType } from '@/lib/brief'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

const ICON_STROKE = 1.5
const SIDEBAR_WIDTH = '264px'

/**
 * Rows (docs/design/dot-home.md, section 1): 34px, 14px. Links (New chat, AI
 * skills, sub-items) use the main text colour. Selected = the side panel's
 * selected fill, main text, 600.
 */
const ROW =
  'focus-ring h-[34px] gap-2.5 rounded-lg px-2.5 text-sm text-ink hover:bg-sidebar-hover hover:text-ink active:bg-sidebar-selected active:text-ink data-[active=true]:bg-sidebar-selected data-[active=true]:font-semibold data-[active=true]:text-ink [&>svg]:size-4'
/**
 * Group titles (title, icon and chevron share the colour): --sidebar-group-title
 * when closed, the grayer --sidebar-group-title-open when open, each darker on
 * hover (app/globals.css). Closed: 34px, 14px, 500, 16px icon. Open: 28px,
 * 12px, 600, 14px icon (kept in a 16px slot, so the label and the children
 * line up). The size change animates (150ms); reduced motion turns it off
 * (app/globals.css).
 */
const GROUP_ROW = cn(
  ROW,
  'font-medium text-sidebar-group-title transition-[height,font-size,font-weight,color,background-color] duration-150 ease-[ease]',
  'hover:bg-sidebar-hover hover:text-sidebar-group-title-hover active:bg-sidebar-hover active:text-sidebar-group-title-hover',
  'data-[state=open]:h-7 data-[state=open]:text-xs data-[state=open]:font-semibold data-[state=open]:text-sidebar-group-title-open',
  'data-[state=open]:hover:bg-sidebar-hover data-[state=open]:hover:text-sidebar-group-title-open-hover data-[state=open]:active:text-sidebar-group-title-open-hover',
  '[&>svg:first-child]:transition-[width,height,margin] [&>svg:first-child]:duration-150 [&[data-state=open]>svg:first-child]:mx-px [&[data-state=open]>svg:first-child]:size-3.5',
  'group-data-[collapsible=icon]:[&>svg:first-child]:!mx-0 group-data-[collapsible=icon]:[&>svg:first-child]:!size-4',
)
const CHILD_ROW =
  'focus-ring flex h-[30px] w-full min-w-0 items-center gap-2 rounded-lg pl-9 pr-2.5 text-[13px] text-ink hover:bg-sidebar-hover data-[active=true]:bg-sidebar-selected data-[active=true]:font-semibold'
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
              className="focus-ring h-[34px] gap-2 rounded-lg border border-field-border bg-field px-2.5 text-sm text-ink-muted hover:bg-sidebar-hover hover:text-ink-muted active:bg-sidebar-selected active:text-ink-muted [&>svg]:size-4"
            >
              <Search strokeWidth={ICON_STROKE} aria-hidden />
              <span>Search</span>
              <kbd className="ml-auto rounded-md border border-line-card bg-subtle px-1.5 dark:bg-field font-sans text-[11px] leading-[18px] text-ink-muted group-data-[collapsible=icon]:hidden">
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
          {SIDEBAR_MENU.map((entry) =>
            'group' in entry ? (
              <SidebarGroupRow key={entry.group.id} group={entry.group} activeId={active?.id} onNavigate={closeOnMobile} />
            ) : (
              <SidebarMenuItem key={entry.link.id}>
                <SidebarMenuButton asChild isActive={active?.id === entry.link.id} tooltip={entry.link.label} className={ROW}>
                  <Link href={entry.link.path} onClick={closeOnMobile} aria-current={active?.id === entry.link.id ? 'page' : undefined}>
                    <entry.link.icon strokeWidth={ICON_STROKE} aria-hidden />
                    <span>{entry.link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>

        {recent.length > 0 && (
          <SidebarMenu className="group-data-[collapsible=icon]:hidden">
            <CollapsibleRow label="Recent" icon={Clock} defaultOpen={false}>
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
      <SidebarFooter className="flex-row items-center justify-between gap-2 border-t border-line-divider px-3 py-2 group-data-[collapsible=icon]:hidden">
        {/* px-2.5 lines the logo up with the row icons above. The white logo is an existing file, used in the dark theme. */}
        <Link href="/" onClick={closeOnMobile} className="focus-ring flex rounded-lg px-2.5 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.headerLogo.src} alt={SITE.headerLogo.alt} className="h-4 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.headerLogo.darkSrc} alt={SITE.headerLogo.alt} className="hidden h-4 w-auto dark:block" />
        </Link>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function SidebarGroupRow({ group, activeId, onNavigate }: { group: NavGroup; activeId?: string; onNavigate: () => void }) {
  const hasActive = group.items.some((i) => i.id === activeId)
  return (
    <CollapsibleRow label={group.label} icon={group.icon} defaultOpen={hasActive}>
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
  // Closed by default and not remembered between visits. null = follow defaultOpen (the group opens when the
  // current page moves into it); a click makes it explicit.
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
          <SidebarMenuButton tooltip={label} className={GROUP_ROW}>
            <Icon strokeWidth={ICON_STROKE} aria-hidden />
            <span className="min-w-0 truncate">{label}</span>
            {/* Right after the label (gap 6px), in the title colour. */}
            <Chevron className="-ml-1 !size-3 shrink-0 group-data-[collapsible=icon]:hidden" strokeWidth={1.75} aria-hidden />
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
      <a href={item.path} target="_blank" rel="noopener noreferrer" onClick={onNavigate} aria-label={externalLinkLabel(item.label, item.id as OutputType)} className={CHILD_ROW}>
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
      className="focus-ring -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-selected hover:text-ink"
      aria-label="Toggle side panel"
    >
      <PanelLeft className="h-[18px] w-[18px]" strokeWidth={ICON_STROKE} aria-hidden />
    </button>
  )
}
