import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'

/** Placeholder until the DI guidelines are ready. */
export default function BrandGuidelinesPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <Badge variant="secondary" className="mb-4 font-medium">
        Coming soon
      </Badge>
      <PageHeader
        title="DI guidelines"
        description="The Digital Inclusion brand guidelines are being prepared."
      />
    </main>
  )
}
