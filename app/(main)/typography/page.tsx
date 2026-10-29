import { TypographySection } from '@/components/typography-section'
import { PageHeader } from '@/components/page-header'

export default function TypographyPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Typography"
        brand="both"
        description="Manrope for headings, Open Sans for body: scales, weights, and usage across digital and print."
      />
      <TypographySection />
    </main>
  )
}
