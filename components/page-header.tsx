import type { AssetBrand } from '@/lib/brand'
import { BrandPill } from '@/components/brand/brand-tabs'
import styles from './page-header.module.css'

/**
 * Shared page intro: Manrope headline with tight tracking, one muted line.
 * `brand="giga"` adds the Giga pill (Giga-only pages) and `brand="both"` the
 * "DI + Giga" pill (shared material, e.g. Typography); `actions` goes on the
 * right of the title row, e.g. <BrandTabs /> on pages with both brands.
 * See DESIGN.md and docs/design/brand-and-search.md.
 */
export function PageHeader({
  title,
  description,
  brand,
  actions,
}: {
  title: string
  description?: string
  /** "giga" and "both" show a pill; Digital Inclusion is the default and gets none. */
  brand?: AssetBrand
  actions?: React.ReactNode
}) {
  return (
    <div className={`mb-10 ${styles.header}`}>
      <div className={styles.titleRow}>
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.03em] text-foreground text-balance">
            {title}
          </h1>
          {brand && brand !== 'di' && <BrandPill brand={brand} />}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
