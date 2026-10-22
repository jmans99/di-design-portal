import { AbstractMapGenerator } from '@/components/maps/abstract/abstract-map-generator'
import { MapsStyleLinks } from '@/components/maps/maps-style-links'
import { PageHeader } from '@/components/page-header'

export default function AbstractMapsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Maps"
        description="Pick a country, a continent or a UNICEF region, preview the live Giga map of schools and health centers, and download a clean PNG ready for pitch decks."
      />
      <div className="mb-6 flex flex-col gap-2">
        <MapsStyleLinks active="abstract" />
        <p className="text-xs text-muted-foreground">This style is new. Share feedback with the design team.</p>
      </div>
      <AbstractMapGenerator />
    </main>
  )
}
