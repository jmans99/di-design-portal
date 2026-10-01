'use client'

import { loadSvg, recolorSvg, svgToDataUrl } from '@/lib/svg-processing'

/**
 * A custom background is a Giga map (same engine as the Maps page) with the
 * Digital Impact Division lockup and two lines of copy on top. The overlay is
 * drawn by one function so the live preview and the download cannot drift.
 */

export const BACKGROUND_W = 3840
export const BACKGROUND_H = 2160

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

async function ensureFontReady() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    // Le scritte di overlay usano Noto Sans, lo stesso font dell'email
    // signature: e' gia' caricato a livello di layout.tsx ma forziamo
    // l'attesa per evitare di disegnare con il fallback sans-serif.
    await Promise.all([
      document.fonts.load('400 64px "Noto Sans"'),
      document.fonts.load('600 64px "Noto Sans"'),
    ])
  } catch {
    // Continua comunque: il canvas usera' il fallback sans-serif del browser.
  }
}

/** Lockup top left, "Digital Inclusion" top right, tagline bottom left. */
async function drawOverlay(ctx: CanvasRenderingContext2D) {
  await ensureFontReady()

  // L'SVG sorgente e' a tinta unita nera: lo ricoloriamo a bianco al volo per
  // restare in sync col logo "Unboxed" della pagina Logos senza dover mantenere
  // un secondo file statico.
  const lockupRaw = await loadSvg('/logos/unicef-digital-impact-unboxed.svg')
  const lockup = await loadImage(svgToDataUrl(recolorSvg(lockupRaw, '#ffffff')))
  const lockupH = 200
  const lockupW = lockupH * (lockup.width / lockup.height)
  ctx.drawImage(lockup, 120, 110, lockupW, lockupH)

  ctx.fillStyle = '#ffffff'
  ctx.font = '400 64px "Noto Sans", sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('Digital Inclusion', BACKGROUND_W - 120, 130)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  const lineH = 80
  ctx.fillText('For every child,', 120, BACKGROUND_H - 130 - lineH)
  ctx.fillText('digital inclusion', 120, BACKGROUND_H - 130)
}

function newCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = BACKGROUND_W
  canvas.height = BACKGROUND_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  return { canvas, ctx }
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

/** Transparent overlay laid over the live map preview. */
export async function renderBackgroundOverlay(): Promise<string> {
  const { canvas, ctx } = newCanvas()
  await drawOverlay(ctx)
  return canvas.toDataURL('image/png')
}

/** Final 4K background: the exported map with the overlay on top. */
export async function composeBackground(mapBlob: Blob): Promise<Blob> {
  const { canvas, ctx } = newCanvas()
  const mapUrl = URL.createObjectURL(mapBlob)
  try {
    const mapImg = await loadImage(mapUrl)
    ctx.drawImage(mapImg, 0, 0, BACKGROUND_W, BACKGROUND_H)
  } finally {
    URL.revokeObjectURL(mapUrl)
  }
  await drawOverlay(ctx)
  return toPng(canvas)
}
