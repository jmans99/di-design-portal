'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { BRANDS, BRAND_LABELS, brandFromParams, withBrand, type Brand } from '@/lib/brand'
import { cn } from '@/lib/utils'

/** The brand shown on this page, from ?brand= (or the old ?palette=giga). */
export function useBrand(): Brand {
  return brandFromParams(useSearchParams())
}

/**
 * Wraps a page that has both Digital Inclusion and Giga material. Put
 * <BrandTabs /> in the page title row and one <BrandTabsContent> per brand
 * below. The choice lives in the URL (?brand=di|giga), so links and Back work.
 */
export function BrandTabsRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  const brand = useBrand()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  return (
    <TabsPrimitive.Root
      value={brand}
      onValueChange={(value) => router.push(withBrand(pathname, params, value as Brand), { scroll: false })}
      className={className}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

/** The brand switch: a segmented control on DI 700 (docs/design/brand-and-search.md). */
export function BrandTabs({ className }: { className?: string }) {
  return (
    <TabsPrimitive.List
      aria-label="Brand"
      className={cn('inline-flex h-9 shrink-0 items-stretch rounded-full bg-primary-700 p-[3px]', className)}
    >
      {BRANDS.map((brand) => (
        <TabsPrimitive.Trigger
          key={brand}
          value={brand}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 font-sans text-sm font-semibold text-white transition-colors',
            'hover:bg-white/[.14] data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-[0_1px_2px_rgba(26,42,60,.15)]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2A3C]',
          )}
        >
          {BRAND_LABELS[brand]}
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  )
}

export function BrandTabsContent({ brand, children, className }: { brand: Brand; children: React.ReactNode; className?: string }) {
  return (
    <TabsPrimitive.Content value={brand} className={cn('focus-visible:outline-none', className)}>
      {children}
    </TabsPrimitive.Content>
  )
}

/** "Giga" next to the title of a page that only has Giga material. DI pages get no pill. */
export function BrandPill({ brand, className }: { brand: Brand; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold',
        brand === 'giga' ? 'bg-[#EEF1F4] text-ink' : 'bg-primary-50 text-primary-700',
        className,
      )}
    >
      {BRAND_LABELS[brand]}
    </span>
  )
}
