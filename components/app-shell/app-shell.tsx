'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeft } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { SIDEBAR_GROUPS, type NavItem } from '@/lib/nav'
import { SITE } from '@/lib/site'

/** DI uses thin outline icons. */
const ICON_STROKE = 1.5

function isActive(pathname: string, path: string) {
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(path + '/')
}

/** Top bar title: the side panel item for the current page (longest matching path). */
function pageTitle(pathname: string) {
  const items = SIDEBAR_GROUPS.flatMap((group) => group.items).filter((item) => !item.soon && isActive(pathname, item.path))
  return items.sort((a, b) => b.path.length - a.path.length)[0]?.label ?? ''
}

/**
 * App shell: side panel on the left (icons
 * only when collapsed on desktop, a sheet on mobile), a slim top bar with the
 * page title and a Beta badge, and the page on the right.
 */
export function AppShell({ defaultOpen, children }: { defaultOpen: boolean; children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div className="relative flex min-h-svh min-w-0 flex-1 flex-col bg-background">
        <AppTopBar />
        {children}
      </div>
    </SidebarProvider>
  )
}

function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const closeOnMobile = () => setOpenMobile(false)

  return (
    <Sidebar collapsible="icon">
      {isMobile && (
        <>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">{SITE.name} sections</SheetDescription>
        </>
      )}
      <SidebarHeader className="h-14 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Link href="/" onClick={closeOnMobile} aria-label={`${SITE.name} home`} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SITE.headerLogo.src}
            alt={SITE.headerLogo.alt}
            className="h-5 w-auto group-data-[collapsible=icon]:hidden"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="pb-4">
        {SIDEBAR_GROUPS.map((group) => (
          <SidebarGroup key={group.id} className="py-1">
            {/* One-item groups (Home, AI skills) are plain items without a label. */}
            {group.items.length > 1 && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarItem key={item.id} item={item} active={isActive(pathname, item.path)} onNavigate={closeOnMobile} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function SidebarItem({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon

  if (item.soon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-disabled
          tabIndex={-1}
          tooltip={`${item.label} (soon)`}
          className="cursor-default text-muted-foreground hover:bg-transparent hover:text-muted-foreground aria-disabled:opacity-100"
        >
          <Icon strokeWidth={ICON_STROKE} aria-hidden />
          <span>{item.label}</span>
        </SidebarMenuButton>
        <SidebarMenuBadge className="text-[11px] font-normal text-muted-foreground">Soon</SidebarMenuBadge>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.label} className="data-[active=true]:text-primary-800">
        <Link href={item.path} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
          <Icon strokeWidth={ICON_STROKE} aria-hidden />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppTopBar() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-[10.7px] md:px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Toggle side panel"
      >
        <PanelLeft className="h-[18px] w-[18px]" strokeWidth={ICON_STROKE} aria-hidden />
      </button>
      <span aria-hidden className="h-4 w-px bg-border" />
      <p className="truncate font-heading text-[15px] font-medium text-foreground">{pageTitle(pathname)}</p>
      {/* The one orange accent on every screen. Navy on orange: 5.25:1. */}
      <span className="ml-auto inline-flex items-center rounded-full bg-accent-orange px-2.5 py-0.5 text-xs font-medium text-navy">
        Beta
      </span>
    </header>
  )
}
