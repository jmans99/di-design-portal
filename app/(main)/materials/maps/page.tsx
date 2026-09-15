import { GigaMapGenerator } from '@/components/maps/giga-map-generator'
import { PageHeader } from '@/components/page-header'

export default function MapsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Maps"
        description="Pick a country, preview the live Giga map of schools and health centers with connectivity dots, and download a clean PNG ready for pitch decks."
      />
      <GigaMapGenerator />
    </main>
  )
}
