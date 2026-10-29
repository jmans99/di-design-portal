import { IllustrationConfigurator } from '@/components/illustration-configurator'
import { PageHeader } from '@/components/page-header'
import { ILLUSTRATIONS_PAGE_BRAND } from '@/lib/illustration-registry'

export default function IllustrationsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Illustrations"
        brand={ILLUSTRATIONS_PAGE_BRAND}
        description="Choose a pictogram, pick fill or outline and color, then download in SVG, PNG, or JPEG."
      />
      <IllustrationConfigurator />
    </main>
  )
}
