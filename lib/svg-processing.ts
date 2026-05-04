/**
 * SVG Processing Engine
 * Handles loading, color replacement, sanitization, and export of SVG assets.
 * Supports bicolore and monochrome recoloring for the Giga main logo.
 */

import type { GigaColorVariant } from './types'

const SVG_CACHE = new Map<string, string>()

/**
 * Fetches and caches an SVG file from a given path.
 */
export async function loadSvg(path: string): Promise<string> {
  if (SVG_CACHE.has(path)) {
    return SVG_CACHE.get(path)!
  }

  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load SVG: ${path}`)
  }

  const svgText = await response.text()
  const sanitized = sanitizeSvg(svgText)
  SVG_CACHE.set(path, sanitized)
  return sanitized
}

/**
 * Sanitizes SVG to prevent script injection and unwanted elements.
 */
export function sanitizeSvg(svgContent: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  const scripts = doc.querySelectorAll('script')
  scripts.forEach((s) => s.remove())

  const allElements = doc.querySelectorAll('*')
  allElements.forEach((el) => {
    const attrs = Array.from(el.attributes)
    attrs.forEach((attr) => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name)
      }
    })
    if (
      el.hasAttribute('href') &&
      el.getAttribute('href')?.startsWith('javascript:')
    ) {
      el.removeAttribute('href')
    }
    if (
      el.hasAttribute('xlink:href') &&
      el.getAttribute('xlink:href')?.startsWith('javascript:')
    ) {
      el.removeAttribute('xlink:href')
    }
  })

  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc.documentElement)
}

/** Color values considered "dark" fills in the source SVGs */
const DARK_FILLS = new Set([
  'black',
  '#000000',
  '#000',
  '#222222',
  '#222',
  '#393939',
  '#161616',
  'currentcolor',
])

/** Color values considered "blue/brand" fills in the source SVGs */
const BRAND_FILLS = new Set(['#277aff', '#277AFF'])

/** Stroke colors that should be recolored */
const DARK_STROKES = new Set([
  'black',
  '#000000',
  '#000',
  '#222222',
  '#393939',
  '#CACACA',
  '#cacaca',
])

function isNoneFill(fill: string | null): boolean {
  return !fill || fill === 'none'
}

function isWhiteFill(fill: string | null): boolean {
  if (!fill) return false
  const lower = fill.toLowerCase().trim()
  return lower === 'white' || lower === '#ffffff' || lower === '#fff'
}

function isDarkFill(fill: string): boolean {
  return DARK_FILLS.has(fill.toLowerCase().trim())
}

function isBrandFill(fill: string): boolean {
  return BRAND_FILLS.has(fill.trim())
}

/**
 * Recolor an SVG for the Giga main logo using variant-specific logic.
 *
 * - bicolore: Keep original (blue #277AFF + dark fills)
 * - blue: Everything (blue + dark) becomes #277AFF
 * - black: Everything becomes #000000
 * - white: Everything becomes #FFFFFF
 */
export function recolorGigaLogo(
  svgContent: string,
  variant: GigaColorVariant
): string {
  if (variant === 'bicolore') {
    // Return as-is: the source SVGs are already bicolore
    return svgContent
  }

  const targetMap: Record<Exclude<GigaColorVariant, 'bicolore'>, string> = {
    blue: '#277AFF',
    black: '#000000',
    white: '#FFFFFF',
  }

  const targetColor = targetMap[variant]

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')

  // Remove white background rects (product SVGs have a <rect fill="white">
  // that acts as an opaque background — we strip it for transparent output)
  const svgRoot = doc.documentElement
  const rects = svgRoot.querySelectorAll('rect')
  rects.forEach((rect) => {
    const fill = rect.getAttribute('fill')
    if (isWhiteFill(fill)) {
      // Only remove if this rect spans the full viewBox (background rect)
      const w = rect.getAttribute('width')
      const h = rect.getAttribute('height')
      const viewBox = svgRoot.getAttribute('viewBox')
      if (viewBox && w && h) {
        const vbParts = viewBox.split(/\s+/)
        if (vbParts[2] === w && vbParts[3] === h) {
          rect.remove()
        }
      }
    }
  })

  const allElements = doc.querySelectorAll('*')

  allElements.forEach((el) => {
    const fill = el.getAttribute('fill')
    if (fill && !isNoneFill(fill) && !isWhiteFill(fill)) {
      if (isDarkFill(fill) || isBrandFill(fill)) {
        el.setAttribute('fill', targetColor)
      }
    }

    const stroke = el.getAttribute('stroke')
    if (stroke && stroke !== 'none') {
      const lower = stroke.toLowerCase().trim()
      if (DARK_STROKES.has(lower) || BRAND_FILLS.has(lower)) {
        el.setAttribute('stroke', targetColor)
      }
    }
  })

  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc.documentElement)
}

/**
 * Replaces all dark and brand (blue) fills in an SVG with the target color.
 * Used for product/event logos (simple monochrome recoloring).
 */
export function recolorSvg(svgContent: string, targetColor: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')
  const allElements = doc.querySelectorAll('*')

  allElements.forEach((el) => {
    const fill = el.getAttribute('fill')
    if (fill && !isNoneFill(fill) && !isWhiteFill(fill)) {
      if (isDarkFill(fill) || isBrandFill(fill)) {
        el.setAttribute('fill', targetColor)
      }
    }

    const stroke = el.getAttribute('stroke')
    if (stroke && stroke !== 'none') {
      const lower = stroke.toLowerCase().trim()
      if (DARK_STROKES.has(lower) || BRAND_FILLS.has(stroke.trim())) {
        el.setAttribute('stroke', targetColor)
      }
    }
  })

  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc.documentElement)
}

/**
 * Converts an SVG string to a data URL for use in <img> tags or canvas.
 */
export function svgToDataUrl(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent)
  return `data:image/svg+xml,${encoded}`
}

/**
 * Exports an SVG as a raster image (PNG or JPEG) at the given resolution.
 */
export async function exportAsRaster(
  svgContent: string,
  format: 'png' | 'jpeg',
  resolution: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth * resolution
      canvas.height = img.naturalHeight * resolution

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.scale(resolution, resolution)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        0.95
      )
    }

    img.onerror = () => reject(new Error('Failed to load SVG into image'))
    img.src = svgToDataUrl(svgContent)
  })
}

/**
 * Generates a standardized filename for the exported asset.
 */
export function generateFilename(
  brand: string,
  variant: string,
  format: string,
  resolution?: string,
  orientation?: string,
  combination?: string
): string {
  const parts = [brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')]

  if (orientation) {
    parts.push(orientation)
  }
  if (combination && combination !== 'standalone') {
    parts.push(combination)
  }

  parts.push(variant.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''))

  const resString =
    resolution && resolution !== '1x' ? `_${resolution}` : ''
  return `${parts.join('_')}${resString}.${format}`
}

/**
 * Triggers a browser download for the given blob or SVG string.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Maps a ColorVariant name to a GigaColorVariant for unified recoloring.
 * Both Giga main logo and product logos share the same four color treatments.
 */
export function colorVariantToGigaVariant(variantName: string): GigaColorVariant {
  const map: Record<string, GigaColorVariant> = {
    'Bicolor': 'bicolore',
    'Giga Blue': 'blue',
    'Black': 'black',
    'White': 'white',
    'Bicolor Positive': 'black',
    'Bicolor Negative': 'white',
  }
  return map[variantName] ?? 'bicolore'
}

export function downloadSvg(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], {
    type: 'image/svg+xml;charset=utf-8',
  })
  downloadBlob(blob, filename)
}
