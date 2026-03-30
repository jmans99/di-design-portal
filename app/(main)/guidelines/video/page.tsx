'use client'

import { useRouter } from 'next/navigation'
import { VideoBrandGuidelinesSection } from '@/components/video-brand-guidelines-section'

export default function VideoGuidelinesPage() {
  const router = useRouter()

  const handleNavigateToLogosWithVariant = (variant: string) => {
    router.push(`/logos?variant=${encodeURIComponent(variant)}`)
  }

  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      <div className="pb-6 animate-in fade-in duration-300 ease-out">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-3xl font-medium text-foreground text-balance">
            Video guidelines
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            Branding guidelines and assets for Giga video content.
          </p>
        </div>
      </div>
      <VideoBrandGuidelinesSection onNavigateToLogosWithVariant={handleNavigateToLogosWithVariant} />
    </main>
  )
}
