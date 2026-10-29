import { cn } from '@/lib/utils'

const ORB_BACKGROUND =
  'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D9FFF0 18%, #6EF2C4 46%, #22B99A 68%, #0B6E5C 100%)'
const ORB_SHADOW = '0 6px 18px rgba(34,185,154,.35), inset 0 -3px 8px rgba(11,110,92,.35)'

/** Dot, the portal's assistant: a green orb. Sizes of 28px and up get the soft shadow. */
export function DotOrb({ size, className }: { size: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{ width: size, height: size, background: ORB_BACKGROUND, boxShadow: size >= 28 ? ORB_SHADOW : undefined }}
    />
  )
}
