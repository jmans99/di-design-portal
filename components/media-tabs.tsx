'use client'

import { Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaSection } from '@/components/media-section'
import { PhotoAwardsGallery } from '@/components/photo-awards/photo-awards-gallery'

const TABS = [
  { id: 'galleries', label: 'Image galleries' },
  { id: 'photo-awards', label: 'Photo awards' },
] as const
type TabId = (typeof TABS)[number]['id']

/** Media has two subsections; the active one lives in `?tab=` so it can be linked. */
export function MediaTabs() {
  return (
    <Suspense fallback={<MediaSection />}>
      <MediaTabsInner />
    </Suspense>
  )
}

function MediaTabsInner() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const requested = params.get('tab')
  const value: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : 'galleries'

  return (
    <Tabs
      value={value}
      onValueChange={(v) => router.replace(v === 'galleries' ? pathname : `${pathname}?tab=${v}`, { scroll: false })}
    >
      <TabsList className="mb-8 h-auto gap-2 bg-transparent p-0">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-none transition-smooth-transform hover:bg-secondary/60 data-[state=active]:border-primary-300 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 data-[state=active]:shadow-none"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="galleries" className="mt-0">
        <MediaSection />
      </TabsContent>
      <TabsContent value="photo-awards" className="mt-0">
        <PhotoAwardsGallery />
      </TabsContent>
    </Tabs>
  )
}
