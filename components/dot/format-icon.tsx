import type { Format } from '@/lib/dot/formats'
import { cn } from '@/lib/utils'

/** A format's icon on a square in the format colour (white glyph). */
export function FormatIcon({ format, size = 22, className }: { format: Pick<Format, 'icon' | 'color'>; size?: number; className?: string }) {
  const Icon = format.icon
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-md text-white', className)}
      style={{ width: size, height: size, backgroundColor: format.color }}
    >
      <Icon style={{ width: Math.round(size * 0.6), height: Math.round(size * 0.6) }} strokeWidth={2} />
    </span>
  )
}
