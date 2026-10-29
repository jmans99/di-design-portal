/** Decorative CSS art for Dot's tiles (docs/design/dot-home.md, 2c and 3b). All aria-hidden. */

const FROST = 'linear-gradient(150deg, rgba(255,255,255,.85), rgba(255,255,255,.35))'

/** Three overlapping slide cards. Base size 64x44; `scale` grows them (120x84 ≈ 1.875). */
export function SlidesArt({ scale = 1 }: { scale?: number }) {
  const w = 64 * scale
  const h = 44 * scale
  const r = 8 * scale
  const card = { width: w, height: h, borderRadius: r } as const
  return (
    <span aria-hidden className="relative block shrink-0" style={{ width: w * 1.55, height: h * 1.45 }}>
      <span
        className="absolute"
        style={{ ...card, left: 0, top: h * 0.08, background: 'linear-gradient(160deg,#82D3FF,#01689D)', transform: 'rotate(-9deg)' }}
      />
      <span
        className="absolute border border-white backdrop-blur-[2px]"
        style={{ ...card, left: w * 0.27, top: h * 0.22, background: `${FROST}, rgba(0,174,239,.35)`, transform: 'rotate(-3deg)' }}
      />
      <span
        className="absolute flex flex-col justify-end gap-[3px] border border-white p-[8%] backdrop-blur-[2px]"
        style={{ ...card, left: w * 0.55, top: h * 0.4, background: `${FROST}, rgba(130,211,255,.45)`, transform: 'rotate(5deg)' }}
      >
        <span className="block h-[3px] w-1/2 rounded-full bg-[#01689D]/70" style={{ height: 3 * scale }} />
        <span className="block h-[3px] w-1/3 rounded-full bg-[#01689D]/40" style={{ height: 3 * scale }} />
      </span>
    </span>
  )
}

/** Mini slides for the DI Master deck tile: a cover across two rows, then four content slides. */
export function MasterDeckArt() {
  const slide = 'rounded-[5px] border border-[#DAF1FF] bg-white p-1.5'
  return (
    <span aria-hidden className="grid shrink-0 gap-1.5" style={{ gridTemplateColumns: '76px 52px 52px', gridTemplateRows: '38px 38px' }}>
      <span className="row-span-2 flex flex-col justify-end gap-1 rounded-[6px] bg-gradient-to-b from-[#00AEEF] to-[#01689D] p-2">
        <span className="block h-1 w-3/4 rounded-full bg-white" />
        <span className="block h-1 w-1/2 rounded-full bg-white/70" />
      </span>
      {/* Palette strip */}
      <span className={`${slide} flex items-end gap-0.5`}>
        {['#0F4772', '#01689D', '#00AEEF', '#82D3FF'].map((c) => (
          <span key={c} className="block h-3 flex-1 rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
      </span>
      {/* Two text lines */}
      <span className={`${slide} flex flex-col justify-center gap-1`}>
        <span className="block h-[3px] w-full rounded-full bg-[#1A2A3C]/60" />
        <span className="block h-[3px] w-2/3 rounded-full bg-[#82D3FF]" />
      </span>
      {/* Three-bar chart */}
      <span className={`${slide} flex items-end justify-center gap-1`}>
        {[40, 70, 100].map((h, i) => (
          <span key={h} className="block w-2 rounded-t-[2px]" style={{ height: `${h}%`, backgroundColor: ['#B5E4FF', '#49BCF6', '#01689D'][i] }} />
        ))}
      </span>
      {/* 2x2 cards */}
      <span className={`${slide} grid grid-cols-2 gap-[3px]`}>
        {['#DAF1FF', '#82D3FF', '#00AEEF', '#01689D'].map((c) => (
          <span key={c} className="block rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
      </span>
    </span>
  )
}

export function SocialPostArt() {
  return (
    <span aria-hidden className="flex h-10 w-[34px] shrink-0 flex-col justify-end gap-1 rounded-md bg-[#EC6A8C] p-1.5">
      <span className="block h-[3px] w-full rounded-full bg-white" />
      <span className="block h-[3px] w-2/3 rounded-full bg-white/80" />
    </span>
  )
}

export function TwoPagerArt() {
  return (
    <span aria-hidden className="flex h-[42px] w-8 shrink-0 flex-col gap-[3px] rounded-[4px] border border-[#C9CEFF] bg-white p-1.5">
      <span className="block h-[3px] w-full rounded-full bg-[#7E8CFF]" />
      <span className="block h-[3px] w-full rounded-full bg-[#C9CEFF]" />
      <span className="block h-[3px] w-2/3 rounded-full bg-[#C9CEFF]" />
      <span className="block h-[3px] w-full rounded-full bg-[#C9CEFF]" />
    </span>
  )
}

/** Three small blue blocks (Partnership deck, on navy). */
export function PartnershipArt() {
  return (
    <span aria-hidden className="flex shrink-0 gap-1">
      {['#00AEEF', '#49BCF6', '#82D3FF'].map((c) => (
        <span key={c} className="block h-3.5 w-3.5 rounded-[4px]" style={{ backgroundColor: c }} />
      ))}
    </span>
  )
}

/** Two short bars (Government briefing). */
export function BriefingArt() {
  return (
    <span aria-hidden className="flex shrink-0 flex-col items-end gap-1">
      <span className="block h-1.5 w-7 rounded-full bg-[#01689D]" />
      <span className="block h-1.5 w-4 rounded-full bg-[#01689D]/50" />
    </span>
  )
}
