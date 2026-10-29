import { BrandTabs, BrandTabsContent, BrandTabsRoot } from '@/components/brand/brand-tabs'
import { ColorPalette } from '@/components/color-palette'
import { PageHeader } from '@/components/page-header'
import { DI_COLOR_SCALES, DI_MAIN_COLORS } from '@/lib/color-tokens'

/** Digital Inclusion palette first (default), Giga second. ?palette=giga still opens Giga. */
export default function ColorsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <BrandTabsRoot>
        <PageHeader
          title="Colors"
          description="Brand palette and tokens: primary blue, deep navy, neutrals, and semantic scales with hex values and usage notes."
          actions={<BrandTabs />}
        />
        <BrandTabsContent brand="di">
          <ColorPalette scales={DI_COLOR_SCALES} mainColors={DI_MAIN_COLORS} />
        </BrandTabsContent>
        <BrandTabsContent brand="giga">
          <ColorPalette />
        </BrandTabsContent>
      </BrandTabsRoot>
    </main>
  )
}
