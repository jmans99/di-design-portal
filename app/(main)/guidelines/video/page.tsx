'use client'

import { useRouter } from 'next/navigation'
import { VideoBrandGuidelinesSection } from '@/components/video-brand-guidelines-section'
import { PageHeader } from '@/components/page-header'

export default function VideoGuidelinesPage() {
  const router = useRouter()

  const handleNavigateToLogosWithVariant = (variant: string) => {
    router.push(`/logos?brand=giga&variant=${encodeURIComponent(variant)}`)
  }

  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Video guidelines"
        brand="giga"
        description={'Branding guidelines and assets for Giga video content.'}
      />
      <VideoBrandGuidelinesSection onNavigateToLogosWithVariant={handleNavigateToLogosWithVariant} />
    </main>
  )
}
