import { PhotoAwardsGallery } from '@/components/photo-awards/photo-awards-gallery'
import { PageHeader } from '@/components/page-header'

export default function PhotoAwardsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Photo awards"
        brand="giga"
        description="The winning stories of the 2026 Giga Photo Award, Stories on the Impact of Connectivity. The photos may be used for UNICEF advocacy purposes; for any other use, contact UNICEF for permission."
      />
      <PhotoAwardsGallery />
    </main>
  )
}
