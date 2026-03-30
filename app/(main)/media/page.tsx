import { MediaSection } from '@/components/media-section'

export default function MediaPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      <div className="pb-6 animate-in fade-in duration-300 ease-out">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-3xl font-medium text-foreground text-balance">
            Media
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            Photos, videos, and visual assets across Flickr, UNICEF, SharePoint, and YouTube.
          </p>
        </div>
      </div>
      <MediaSection />
    </main>
  )
}
