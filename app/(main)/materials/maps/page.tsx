import { GigaMapGenerator } from '@/components/maps/giga-map-generator'
import { MapsStyleLinks } from '@/components/maps/maps-style-links'
import { PageHeader } from '@/components/page-header'
import { isRouteEnabled } from '@/lib/site'

export default function MapsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Maps"
        description="Pick a country, a continent or a UNICEF region, preview the live Giga map of schools and health centers, and download a clean PNG ready for pitch decks."
      />
      {/* The style switch only exists where the Abstract style does (DI site). */}
      {isRouteEnabled('/materials/maps/abstract') && (
        <div className="mb-6">
          <MapsStyleLinks active="map" />
        </div>
      )}
      <GigaMapGenerator />
    </main>
  )
}
