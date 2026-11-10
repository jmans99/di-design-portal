import type { AssetBrand } from '@/lib/brand'
import { BrandPill } from '@/components/brand/brand-tabs'
import { cn } from '@/lib/utils'
import styles from './page-header.module.css'

/**
 * Shared page intro: the home page's headline (Manrope 600, 28px, -0.02em) and
 * one line of secondary text.
 * `brand="giga"` adds the Giga pill (Giga-only pages) and `brand="both"` the
 * "DI + Giga" pill (shared material, e.g. Typography); `actions` goes on the
 * right of the title row, e.g. <BrandTabs /> on pages with both brands.
 * See DESIGN.md and docs/design/brand-and-search.md.
 */
export function PageHeader({
  title,
  description,
  descriptionClassName,
  brand,
  actions,
}: {
  title: string
  description?: React.ReactNode
  /** Overrides the description's measure, e.g. to lay a long intro out across the page. */
  descriptionClassName?: string
  /** "giga" and "both" show a pill; Digital Inclusion is the default and gets none. */
  brand?: AssetBrand
  actions?: React.ReactNode
}) {
  return (
    <div className={`mb-10 ${styles.header}`}>
      <div className={styles.titleRow}>
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink text-balance">
            {title}
          </h1>
          {brand && brand !== 'di' && <BrandPill brand={brand} />}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {description ? (
        <p className={cn('mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-secondary', descriptionClassName)}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
