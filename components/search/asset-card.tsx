import Link from 'next/link'
import { ArrowUpRight, Download } from 'lucide-react'
import { BrandPill } from '@/components/brand/brand-tabs'
import { assetFilename, previewOnDark } from '@/lib/search/assets'
import type { Asset } from '@/lib/search/types'
import { cn } from '@/lib/utils'

const FONT_FAMILIES: Record<string, string> = { 'font-manrope': 'Manrope, sans-serif', 'font-open-sans': "'Open Sans', sans-serif" }

/**
 * The asset's image, contain-fit on navy (white artwork) or the light canvas.
 * These backgrounds show the real file, so they stay the same in both themes.
 * Fonts show a specimen.
 */
export function AssetPreview({ asset, className, padding = 'p-4' }: { asset: Asset; className?: string; padding?: string }) {
  return (
    <div className={cn('flex items-center justify-center overflow-hidden', previewOnDark(asset) ? 'bg-preview-navy' : 'bg-preview-canvas', padding, className)}>
      {asset.preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.preview} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
      ) : (
        <span aria-hidden className="text-3xl text-navy" style={{ fontFamily: FONT_FAMILIES[asset.id] }}>
          Aa
        </span>
      )}
    </div>
  )
}

/** Result card in Dot's search reply: preview, title, brand, one download per format, and the asset's page. */
export function AssetCard({ asset }: { asset: Asset }) {
  return (
    // Scroll margin keeps a focused or scrolled-to card clear of the sticky reply bar below it.
    <article className="flex min-w-0 scroll-mb-40 flex-col overflow-hidden rounded-[14px] border border-line-card bg-card [&_a]:scroll-mb-40">
      <AssetPreview asset={asset} className="aspect-[4/3] rounded-xl" padding="p-5" />
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold leading-snug text-ink">{asset.title}</h3>
          <BrandPill brand={asset.brand} />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          {asset.formats.map((format) => (
            <a
              key={format.ext}
              href={format.url}
              download={assetFilename(asset, format.ext)}
              aria-label={`Download ${asset.title} as ${format.ext.toUpperCase()}`}
              className="focus-ring inline-flex h-7 items-center gap-1 rounded-full border border-line-card px-2.5 text-xs font-semibold text-link hover:border-link/40 hover:bg-accent"
            >
              <Download className="h-3 w-3" strokeWidth={2} aria-hidden />
              {format.ext.toUpperCase()}
            </a>
          ))}
          <Link
            href={asset.page}
            className="focus-ring ml-auto inline-flex h-7 items-center gap-0.5 rounded-full px-1.5 text-xs font-semibold text-ink-secondary hover:text-ink"
          >
            Open page
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
