/**
 * Shared page intro: Manrope 600 headline with tight tracking, one muted line.
 * Left-aligned, on the canvas. See DESIGN.md.
 */
export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <h1 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.03em] text-foreground text-balance">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
