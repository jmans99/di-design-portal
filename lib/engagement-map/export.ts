import { domToPng } from 'modern-screenshot'

export const ENGAGEMENT_MAP_WIDTH = 1920
export const ENGAGEMENT_MAP_HEIGHT = 1080

export async function exportEngagementMapToPng(node: HTMLElement): Promise<Blob> {
  // Capturing before webfonts finish loading bakes fallback-font metrics into
  // the PNG: long country names re-wrap and rows overlap.
  await document.fonts.ready
  const dataUrl = await domToPng(node, {
    width: ENGAGEMENT_MAP_WIDTH,
    height: ENGAGEMENT_MAP_HEIGHT,
    scale: 1,
    backgroundColor: '#FFFFFF',
  })
  const res = await fetch(dataUrl)
  return res.blob()
}

export function buildEngagementMapFilename(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `giga-engagement-map-${yyyy}-${mm}.png`
}
