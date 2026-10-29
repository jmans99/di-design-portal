/**
 * Node port of the recolouring in lib/svg-processing.ts (recolorGigaLogo and
 * recolorSvg), on the SVG text instead of a DOM, so the asset index can ship
 * the same colour variants the Logos page builds in the browser. Keep the two
 * in step: same colour sets, same rules.
 */

const DARK_FILLS = new Set(['black', '#000000', '#000', '#222222', '#222', '#393939', '#161616', 'currentcolor'])
const BRAND_FILLS = new Set(['#277aff'])
const DARK_STROKES = new Set(['black', '#000000', '#000', '#222222', '#393939', '#cacaca'])

const isWhite = (value) => ['white', '#ffffff', '#fff'].includes(value.toLowerCase().trim())

function recolorAttributes(svg, targetColor) {
  return svg
    .replace(/\bfill="([^"]*)"/g, (match, value) => {
      const v = value.toLowerCase().trim()
      if (!v || v === 'none' || isWhite(v)) return match
      return DARK_FILLS.has(v) || BRAND_FILLS.has(v) ? `fill="${targetColor}"` : match
    })
    .replace(/\bstroke="([^"]*)"/g, (match, value) => {
      const v = value.toLowerCase().trim()
      if (v === 'none') return match
      return DARK_STROKES.has(v) || BRAND_FILLS.has(v) ? `stroke="${targetColor}"` : match
    })
}

/** Removes <rect fill="white"> elements that span the whole viewBox (opaque backgrounds). */
function stripBackgroundRects(svg) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/)
  if (!viewBox) return svg
  const [, , vbW, vbH] = viewBox
  return svg.replace(/<rect\b[^>]*\/>/g, (rect) => {
    const fill = rect.match(/\bfill="([^"]*)"/)?.[1]
    const w = rect.match(/\bwidth="([^"]*)"/)?.[1]
    const h = rect.match(/\bheight="([^"]*)"/)?.[1]
    return fill && isWhite(fill) && w === vbW && h === vbH ? '' : rect
  })
}

const GIGA_TARGETS = { blue: '#277AFF', black: '#000000', white: '#FFFFFF' }

/** Giga main logo (and other bicolour logos): 'bicolore' keeps the file; the others turn every dark and blue fill into one colour. */
export function recolorGigaLogo(svg, variant) {
  if (variant === 'bicolore') return svg
  return recolorAttributes(stripBackgroundRects(svg), GIGA_TARGETS[variant])
}

/** Monochrome logos (products, events, UNICEF): every dark and blue fill becomes the target colour. */
export function recolorSvg(svg, targetColor) {
  return recolorAttributes(svg, targetColor)
}

/** Same mapping as colorVariantToGigaVariant in lib/svg-processing.ts. */
export function colorVariantToGigaVariant(name) {
  return (
    { Bicolor: 'bicolore', 'Giga Blue': 'blue', Black: 'black', White: 'white', 'Bicolor Positive': 'black', 'Bicolor Negative': 'white' }[name] ??
    'bicolore'
  )
}
