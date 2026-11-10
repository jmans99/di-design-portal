import { PhotoAwardsGallery } from '@/components/photo-awards/photo-awards-gallery'
import { PageHeader } from '@/components/page-header'
import { PHOTO_AWARD_BRAND } from '@/lib/photo-awards'

export default function PhotoAwardsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 pb-12 pt-6">
      <PageHeader
        title="Photo awards"
        brand={PHOTO_AWARD_BRAND}
        description={
          <>
            <span className="block text-pretty">
              The winning stories of the Giga Photo Award: The Joy of Connection (2025) and The Urgency of Connectivity
              (2026), selected from more than 8,000 photographs from around the world. From families staying close
              across borders to children learning through a phone screen, these stories show how connectivity shapes
              daily life.
            </span>
            <span className="mt-2 block text-pretty text-[13px]">
              The photographs may be used for UNICEF advocacy purposes. For any other use, please contact UNICEF for
              permission. Learn more at{' '}
              <a
                href="https://gigaphotoaward.global"
                target="_blank"
                rel="noreferrer"
                className="focus-ring whitespace-nowrap rounded font-semibold text-link transition-colors hover:text-link-hover"
              >
                gigaphotoaward.global
              </a>
              .
            </span>
          </>
        }
      />
      <PhotoAwardsGallery />
    </main>
  )
}
