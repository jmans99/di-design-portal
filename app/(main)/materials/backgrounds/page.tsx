import { BackgroundsPicker } from '@/components/backgrounds-picker'
import { PageHeader } from '@/components/page-header'

export default function BackgroundsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-12">
      <PageHeader
        title="Backgrounds"
        description="Branded virtual backgrounds for Microsoft Teams, Zoom, and Google Meet. Pick a ready-made world map, or generate a custom one for the country of your choice. Output is 4K (3840 × 2160), 16:9."
      />
      <BackgroundsPicker />
    </main>
  )
}
