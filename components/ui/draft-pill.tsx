import { cn } from '@/lib/utils'

/**
 * Small "Draft" pill for content that is still being worked on (the Knowledge
 * section in the side panel and in search). One component so every Draft pill
 * looks the same. Same neutral pill tokens as "Coming soon" (components/dot/format-tiles.tsx),
 * but lighter: outline, 11px, medium weight, sentence case.
 */
export function DraftPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-line-card bg-pill px-1.5 py-px text-[11px] font-medium leading-4 text-pill-muted-foreground',
        className,
      )}
    >
      Draft
    </span>
  )
}
