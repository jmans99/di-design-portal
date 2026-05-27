import { MapsScreenshotGenerator } from '@/components/maps-screenshot-generator'
import { PageHeader } from '@/components/page-header'

export default function MapsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Maps"
        description="Pick a country, preview the live Giga map, and download a clean dark mode PNG ready for pitch decks."
      />
      <MapsScreenshotGenerator />
    </main>
  )
}
