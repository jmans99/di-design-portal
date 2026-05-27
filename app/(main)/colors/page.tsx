import { ColorPalette } from '@/components/color-palette'
import { PageHeader } from '@/components/page-header'

export default function ColorsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-12">
      <PageHeader
        title="Colors"
        description="Brand palette and tokens: primary blue, deep navy, neutrals, and semantic scales with hex values and usage notes."
      />
      <ColorPalette />
    </main>
  )
}
