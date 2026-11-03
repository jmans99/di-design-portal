import { cn } from '@/lib/utils'
import styles from './dot-orb.module.css'

const ORB_BACKGROUND =
  'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D9FFF0 18%, #6EF2C4 46%, #22B99A 68%, #0B6E5C 100%)'
const ORB_DROP_SHADOW = '0 6px 18px rgba(34,185,154,.35)'
const ORB_SHADOW = `${ORB_DROP_SHADOW}, inset 0 -3px 8px rgba(11,110,92,.35)`

/**
 * Dot, the portal's assistant: a green orb. Sizes of 28px and up get the soft
 * shadow. `animated` (the home heading only) uses dot-orb.module.css: the UN
 * Deck Builder's generate sphere in Dot's greens, soft pieces of colour
 * wandering inside a round pane of glass, breathing and floating, no shadow.
 * Reduced motion shows it at rest.
 */
export function DotOrb({ size, animated = false, className }: { size: number; animated?: boolean; className?: string }) {
  if (animated) {
    return (
      <span
        aria-hidden
        data-animated=""
        className={cn(styles.wrap, className)}
        style={{ width: size, height: size, ['--dot-size' as string]: `${size}px` }}
      >
        <span className={styles.orb}>
          <span className={styles.mint} />
          <span className={styles.white} />
          <span className={styles.glass} />
        </span>
      </span>
    )
  }
  const look = { background: ORB_BACKGROUND, boxShadow: size >= 28 ? ORB_SHADOW : undefined }
  return <span aria-hidden className={cn('inline-block shrink-0 rounded-full', className)} style={{ width: size, height: size, ...look }} />
}
