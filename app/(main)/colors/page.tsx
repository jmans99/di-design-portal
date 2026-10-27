import { ColorPalette } from '@/components/color-palette'
import { ColorPaletteTabs } from '@/components/color-palette-tabs'
import { PageHeader } from '@/components/page-header'
import { getSite } from '@/lib/site'

export default function ColorsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Colors"
        description="Brand palette and tokens: primary blue, deep navy, neutrals, and semantic scales with hex values and usage notes."
      />
      {getSite().id === 'di' ? <ColorPaletteTabs /> : <ColorPalette />}
    </main>
  )
}
