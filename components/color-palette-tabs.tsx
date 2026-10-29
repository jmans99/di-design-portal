'use client'

import { Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ColorPalette } from '@/components/color-palette'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DI_COLOR_SCALES, DI_MAIN_COLORS } from '@/lib/color-tokens'

type Palette = 'di' | 'giga'

/**
 * Colors page: "Digital Inclusion" palette (default) and the Giga
 * palette, one tab each. The tab lives in the URL (?palette=giga) so it can
 * be shared.
 */
export function ColorPaletteTabs() {
  return (
    <Suspense fallback={<PaletteTabs value="di" />}>
      <PaletteTabsFromUrl />
    </Suspense>
  )
}

function PaletteTabsFromUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const value: Palette = searchParams.get('palette') === 'giga' ? 'giga' : 'di'

  const onValueChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'giga') params.set('palette', 'giga')
    else params.delete('palette')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return <PaletteTabs value={value} onValueChange={onValueChange} />
}

function PaletteTabs({ value, onValueChange }: { value: Palette; onValueChange?: (value: string) => void }) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="mb-8">
        <TabsTrigger value="di">Digital Inclusion</TabsTrigger>
        <TabsTrigger value="giga">Giga</TabsTrigger>
      </TabsList>
      <TabsContent value="di" className="mt-0">
        <ColorPalette scales={DI_COLOR_SCALES} mainColors={DI_MAIN_COLORS} />
      </TabsContent>
      <TabsContent value="giga" className="mt-0">
        <ColorPalette />
      </TabsContent>
    </Tabs>
  )
}
