'use client'

import { createContext, useContext } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  BRANDS,
  BRAND_FILTERS,
  BRAND_FILTER_LABELS,
  BRAND_LABELS,
  brandFilterFromParams,
  brandFromParams,
  withBrand,
  type AssetBrand,
  type Brand,
  type BrandFilter,
} from '@/lib/brand'
import { cn } from '@/lib/utils'

/** The brand shown on a two-tab page (Colors), from ?brand= (or the old ?palette=giga). */
export function useBrand(): Brand {
  return brandFromParams(useSearchParams())
}

/** The brand filter on a page with "All" (Logos, Illustrations, Image galleries): ?brand=all|di|giga, All by default. */
export function useBrandFilter(): BrandFilter {
  return brandFilterFromParams(useSearchParams())
}

const BrandTabsContext = createContext<{ withAll: boolean; value: BrandFilter }>({ withAll: false, value: 'di' })

/**
 * Wraps a page with Digital Inclusion and Giga material. Put <BrandTabs /> in
 * the page title row. The choice lives in the URL, so links and Back work.
 * - Two tabs (Colors): one <BrandTabsContent> per brand below.
 * - `withAll` adds "All" first (the default) and makes the control a filter:
 *   put the page in one <BrandTabsPanel>, which reads useBrandFilter(). The
 *   panel stays mounted when the filter changes, so the page keeps its state.
 */
export function BrandTabsRoot({ children, className, withAll = false }: { children: React.ReactNode; className?: string; withAll?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const value: BrandFilter = withAll ? brandFilterFromParams(params) : brandFromParams(params)
  return (
    <BrandTabsContext.Provider value={{ withAll, value }}>
      <TabsPrimitive.Root
        value={value}
        onValueChange={(next) => router.push(withBrand(pathname, params, next as BrandFilter), { scroll: false })}
        className={className}
      >
        {children}
      </TabsPrimitive.Root>
    </BrandTabsContext.Provider>
  )
}

/** The brand switch: a segmented control on DI 700 (docs/design/brand-and-search.md). All, Digital Inclusion, Giga with `withAll`. */
export function BrandTabs({ className }: { className?: string }) {
  const { withAll } = useContext(BrandTabsContext)
  const options: BrandFilter[] = withAll ? BRAND_FILTERS : BRANDS
  return (
    <TabsPrimitive.List
      aria-label={withAll ? 'Brand filter' : 'Brand'}
      className={cn('inline-flex h-8 shrink-0 items-stretch gap-0.5 rounded-full bg-toggle-track p-[3px]', className)}
    >
      {options.map((brand) => (
        <TabsPrimitive.Trigger
          key={brand}
          value={brand}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3.5 font-sans text-[13px] font-semibold text-ink-secondary transition-colors',
            // Same quiet track and white thumb as the theme toggle in the side panel.
            'hover:text-ink data-[state=active]:bg-thumb data-[state=active]:text-ink data-[state=active]:shadow-thumb',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          )}
        >
          {BRAND_FILTER_LABELS[brand]}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  )
}

/** One brand's content on a two-tab page (Colors). */
export function BrandTabsContent({ brand, children, className }: { brand: Brand; children: React.ReactNode; className?: string }) {
  return (
    <TabsPrimitive.Content value={brand} className={cn('focus-visible:outline-none', className)}>
      {children}
    </TabsPrimitive.Content>
  )
}

/** The content of a filter page (`withAll`): one panel, labelled by the current filter, that keeps its state. */
export function BrandTabsPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { value } = useContext(BrandTabsContext)
  return (
    <TabsPrimitive.Content value={value} className={cn('focus-visible:outline-none', className)}>
      {children}
    </TabsPrimitive.Content>
  )
}

const PILL_COLOURS: Record<AssetBrand, string> = {
  di: 'bg-accent text-link',
  giga: 'bg-selected text-ink',
  both: 'bg-subtle text-ink-secondary',
}

/**
 * Brand pill: "Giga" or "DI + Giga" next to the title of a Giga-only or shared
 * page (DI pages get none), and on every search result.
 */
export function BrandPill({ brand, className }: { brand: AssetBrand; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold',
        PILL_COLOURS[brand],
        className,
      )}
    >
      {BRAND_LABELS[brand]}
    </span>
  )
}
