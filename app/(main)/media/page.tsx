import { MediaTabs } from '@/components/media-tabs'
import { PageHeader } from '@/components/page-header'

export default function MediaPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Media"
        description="Image galleries across Flickr, UNICEF, SharePoint and YouTube, and the winning stories of the Giga Photo Award."
      />
      <MediaTabs />
    </main>
  )
}
