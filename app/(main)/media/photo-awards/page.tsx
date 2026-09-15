import { PhotoAwardsGallery } from '@/components/photo-awards/photo-awards-gallery'
import { PageHeader } from '@/components/page-header'

export default function PhotoAwardsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Photo awards"
        description="The winning stories of the Giga Photo Award. Open a story to read it photo by photo and download the images for UNICEF advocacy use."
      />
      <PhotoAwardsGallery />
    </main>
  )
}
