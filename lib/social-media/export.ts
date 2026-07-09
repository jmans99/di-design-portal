import { domToPng } from 'modern-screenshot'

export const TEMPLATE_WIDTH = 1080
export const TEMPLATE_HEIGHT = 1350

/**
 * Snapshot del nodo template a risoluzione nativa (1080x1350). Il nodo deve essere
 * renderizzato a dimensioni reali; il wrapper visivo applica un transform: scale()
 * per stare nel viewport, ma qui forziamo width/height espliciti cosi' la cattura
 * usa la dimensione vera (modern-screenshot rispetta i parametri).
 */
export async function exportTemplateToPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready
  const dataUrl = await domToPng(node, {
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
    scale: 1,
    backgroundColor: '#277AFF',
  })
  const res = await fetch(dataUrl)
  return res.blob()
}

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
