import data from '@/data/assets.json'
import type { Asset } from './types'

/** The asset index (data/assets.json, rebuilt before every build by scripts/build-asset-index.mjs). */
export const ASSETS = data as Asset[]

/** File name for a download: "unicef-digital-inclusion-black.svg". */
export const assetFilename = (asset: Asset, ext: string) => `${asset.id}.${ext}`

/** White or light artwork sits on navy; everything else on the light canvas. */
export const previewOnDark = (asset: Asset) => asset.colour === 'white'

/** Starts a download of one of the asset's files (same-origin, so the download attribute is honoured). */
export function downloadAsset(asset: Asset, format = asset.formats[0]) {
  if (!format) return
  const a = document.createElement('a')
  a.href = format.url
  a.download = assetFilename(asset, format.ext)
  document.body.appendChild(a)
  a.click()
  a.remove()
}
