'use client'

import { useRouter } from 'next/navigation'
import { VideoBrandGuidelinesSection } from '@/components/video-brand-guidelines-section'
import { PageHeader } from '@/components/page-header'
import { getSite } from '@/lib/site'

const ORG = getSite().orgName

export default function VideoGuidelinesPage() {
  const router = useRouter()

  const handleNavigateToLogosWithVariant = (variant: string) => {
    router.push(`/logos?variant=${encodeURIComponent(variant)}`)
  }

  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Video guidelines"
        description={`Branding guidelines and assets for ${ORG} video content.`}
      />
      <VideoBrandGuidelinesSection onNavigateToLogosWithVariant={handleNavigateToLogosWithVariant} />
    </main>
  )
}
