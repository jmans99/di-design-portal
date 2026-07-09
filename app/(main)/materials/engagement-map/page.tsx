import { EngagementMapStudio } from '@/components/engagement-map/map-studio'
import { PageHeader } from '@/components/page-header'

export const metadata = {
  title: 'Engagement map — Brand asset generator',
}

export default function EngagementMapPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Engagement map"
        description="World map of countries engaged with Giga and countries with early interest, generated live from the engagement tracker. PNG export is 1920×1080, ready for presentations."
      />
      <EngagementMapStudio />
    </main>
  )
}
