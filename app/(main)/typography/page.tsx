import { TypographySection } from '@/components/typography-section'

export default function TypographyPage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-10">
      <div
        className="-mx-6 -mt-10 mb-3"
        style={{ background: 'linear-gradient(180deg, hsl(214 100% 97%) 0%, hsl(210 40% 98.3%) 100%)' }}
      >
        <div className="px-6 pb-6 pt-9">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
            Giga · Brand Assets
          </p>
          <h1 className="font-heading text-[2.75rem] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            Typography
          </h1>
          <p className="mt-3 w-full text-[15px] leading-relaxed text-muted-foreground">
            Two fonts only. Manrope for headings, Open Sans for everything else.
          </p>
        </div>
      </div>
      <TypographySection />
    </main>
  )
}
