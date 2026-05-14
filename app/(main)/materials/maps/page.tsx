import { MapsScreenshotGenerator } from '@/components/maps-screenshot-generator'

export default function MapsPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      <div
        className="-mx-6 -mt-10 mb-3"
        style={{ background: 'linear-gradient(180deg, hsl(214 100% 97%) 0%, hsl(210 40% 98.3%) 100%)' }}
      >
        <div className="px-6 pb-6 pt-9">
          <h1 className="font-heading text-[2.75rem] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            Maps
          </h1>
          <p className="mt-3 w-full text-[15px] leading-relaxed text-muted-foreground">
            Pick a country, preview the live Giga map, and download a clean dark
            mode PNG ready for pitch decks.
          </p>
        </div>
      </div>
      <MapsScreenshotGenerator />
    </main>
  )
}
