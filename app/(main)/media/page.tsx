import { BrandTabs, BrandTabsPanel, BrandTabsRoot } from '@/components/brand/brand-tabs'
import { MediaSection } from '@/components/media-section'
import { PageHeader } from '@/components/page-header'

export default function MediaPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <BrandTabsRoot withAll>
        <PageHeader
          title="Image galleries"
          description="Photos, videos, and visual assets across Flickr, UNICEF, SharePoint, and YouTube."
          actions={<BrandTabs />}
        />
        <BrandTabsPanel>
          <MediaSection />
        </BrandTabsPanel>
      </BrandTabsRoot>
    </main>
  )
}
