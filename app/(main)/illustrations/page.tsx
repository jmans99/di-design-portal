import { BrandTabs, BrandTabsPanel, BrandTabsRoot } from '@/components/brand/brand-tabs'
import { IllustrationConfigurator } from '@/components/illustration-configurator'
import { PageHeader } from '@/components/page-header'

/** Illustrations: All (default), Digital Inclusion (the shared General set) or Giga. The filter replaces the old Giga pill. */
export default function IllustrationsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <BrandTabsRoot withAll>
        <PageHeader
          title="Illustrations"
          description="Choose a pictogram, pick fill or outline and color, then download in SVG, PNG, or JPEG."
          actions={<BrandTabs />}
        />
        <BrandTabsPanel>
          <IllustrationConfigurator />
        </BrandTabsPanel>
      </BrandTabsRoot>
    </main>
  )
}
