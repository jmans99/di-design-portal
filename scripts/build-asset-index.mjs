#!/usr/bin/env node
/**
 * Builds data/assets.json, the asset index used by search (Dot's box and ⌘K).
 * Runs before every build (npm "prebuild"), so the index never goes stale.
 * Rules and data model: docs/design/brand-and-search.md.
 *
 * Sources are the registries the asset pages already use (Logos, Illustrations,
 * Photo awards, Colors) plus the files in public/backgrounds,
 * public/images/video-guidelines and public/fonts. Existing files are never
 * moved or renamed. Files the pages build in the browser (logo colour
 * variants, PNG exports) are written once to public/generated/ so search can
 * offer real download links; the generated files are committed, and this
 * script only rewrites them when their source changes.
 *
 * brand, type, colour and layout are inferred from folder and file names.
 * What cannot be inferred is listed at the end of the run and can be set by
 * hand in data/assets.overrides.json ({ "<asset id>": { "brand": "di", … } }),
 * which is merged on top.
 *
 * Usage: node --experimental-strip-types scripts/build-asset-index.mjs
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logosForBrand, resolveGigaLogoPath } from '../lib/brand-registry.ts'
import { ILLUSTRATIONS } from '../lib/illustration-registry.ts'
import { PHOTO_AWARD_STORIES } from '../lib/photo-awards.ts'
import { COLOR_SCALES, DI_COLOR_SCALES, DI_MAIN_COLORS } from '../lib/color-tokens.ts'
import { colorVariantToGigaVariant, recolorGigaLogo, recolorSvg } from './lib/svg-recolor.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const OUT = join(ROOT, 'data', 'assets.json')
const OVERRIDES = join(ROOT, 'data', 'assets.overrides.json')
/** Source hash per generated PNG/JPEG, so a file is rebuilt only when its source changes (timestamps differ per checkout). */
const MANIFEST = join(ROOT, 'data', 'assets.generated.json')
const GENERATED = '/generated'

let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {
  console.warn('[assets] sharp is not available: PNG files and thumbnails are not regenerated; existing ones are kept.')
}

// --------------------------------------------------------------------------
// Inference from folder and file names

/** Folder → type (and brand, where the whole folder is one brand's material). */
const FOLDER_RULES = [
  { prefix: '/logos/', type: 'logo' },
  { prefix: `${GENERATED}/logos/`, type: 'logo' },
  { prefix: '/illustrations/', type: 'illustration', brand: 'giga' }, // lib/illustration-registry.ts: "Registry for Giga illustrations"
  { prefix: '/photo-awards/', type: 'photo', brand: 'giga' }, // the Giga Photo Award
  { prefix: '/backgrounds/', type: 'background', brand: 'di' }, // UNICEF Digital Impact lockup + "Digital Inclusion"
  { prefix: '/images/video-guidelines/', type: 'guideline', brand: 'giga' }, // Giga video guidelines
  { prefix: '/fonts/', type: 'font' },
  { prefix: `${GENERATED}/palettes/`, type: 'palette' },
]

const words = (name) => name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

function inferFromFolder(url) {
  return FOLDER_RULES.find((rule) => url.startsWith(rule.prefix)) ?? {}
}

/** "unicef-digital-inclusion-black" → di; anything named giga… → giga. */
function inferBrand(name, url) {
  const w = words(name)
  if (w.join('-').includes('digital-inclusion') || w.includes('di')) return 'di'
  if (w.some((x) => x.startsWith('giga'))) return 'giga'
  return inferFromFolder(url).brand ?? null
}

function inferColour(name) {
  const w = words(name)
  for (const c of ['black', 'white', 'blue', 'navy']) if (w.includes(c)) return c
  if (w.includes('dark')) return 'black'
  if (w.includes('light')) return 'white'
  if (w.some((x) => ['bicolor', 'bicolour', 'fill', 'full', 'colour', 'color'].includes(x))) return 'full-colour'
  return null
}

/** From the name, else from the image's proportions. */
function inferLayout(name, width, height) {
  const w = words(name)
  for (const l of ['horizontal', 'vertical', 'stacked', 'square']) if (w.includes(l)) return l
  if (!width || !height) return null
  const ratio = width / height
  if (ratio >= 1.6) return 'horizontal'
  if (ratio <= 0.85) return 'vertical'
  return 'square'
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const fsPath = (url) => join(PUBLIC, url)
const read = (url) => readFileSync(fsPath(url), 'utf8')

function svgSize(svg) {
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/).map(Number)
  return vb && vb.length === 4 ? { width: vb[2], height: vb[3] } : { width: null, height: null }
}

// --------------------------------------------------------------------------
// Generated files (only rewritten when the content or source changes)

let written = 0

function writeIfChanged(url, content) {
  const file = fsPath(url)
  if (existsSync(file) && readFileSync(file).equals(Buffer.from(content))) return
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
  written++
}

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
const sourceHash = (url) => createHash('sha1').update(readFileSync(fsPath(url))).digest('hex')

/** True when `url` exists and was built from the current content of `source`. */
function upToDate(url, source) {
  return existsSync(fsPath(url)) && manifest[url] === sourceHash(source)
}
const built = (url, source) => (manifest[url] = sourceHash(source))

/** PNG of an SVG, 2x and at least 1000px wide (at most 2400px). */
async function svgToPng(svgUrl, pngUrl) {
  if (!sharp || upToDate(pngUrl, svgUrl)) return existsSync(fsPath(pngUrl))
  const svg = read(svgUrl)
  const { width } = svgSize(svg)
  const target = Math.round(Math.min(2400, Math.max(1000, (width ?? 500) * 2)))
  mkdirSync(dirname(fsPath(pngUrl)), { recursive: true })
  // Render at the target size directly (density is dots per inch; SVG units are 72 per inch).
  const density = Math.max(1, Math.round((72 * target) / (width ?? 500)))
  await sharp(Buffer.from(svg), { density }).resize({ width: target }).png().toFile(fsPath(pngUrl))
  built(pngUrl, svgUrl)
  written++
  return true
}

/** A 640px JPEG preview of a large image. */
async function thumbnail(srcUrl, thumbUrl) {
  if (!sharp || upToDate(thumbUrl, srcUrl)) return existsSync(fsPath(thumbUrl)) ? thumbUrl : srcUrl
  mkdirSync(dirname(fsPath(thumbUrl)), { recursive: true })
  await sharp(fsPath(srcUrl)).resize({ width: 640 }).jpeg({ quality: 78 }).toFile(fsPath(thumbUrl))
  built(thumbUrl, srcUrl)
  written++
  return thumbUrl
}

// --------------------------------------------------------------------------
// Assets

const assets = []
const inferred = [] // { id, missing: [...] } before overrides

function add({ id, title, url, name, type, brand, colour, layout, formats, preview, page, tags = [], size = {} }) {
  if (assets.some((a) => a.id === id)) throw new Error(`[assets] duplicate id ${id}`)
  const folder = inferFromFolder(url)
  const asset = {
    id,
    title,
    type: type ?? folder.type ?? null,
    brand: brand !== undefined ? brand : inferBrand(name, url),
    colour: colour !== undefined ? colour : inferColour(name),
    layout: layout !== undefined ? layout : inferLayout(name, size.width, size.height),
    formats,
    preview,
    page,
    tags: [...new Set(tags.flatMap((t) => words(t)))],
  }
  assets.push(asset)
  return asset
}

/** Readable colour in titles. */
const COLOUR_LABEL = { 'full-colour': 'full colour', black: 'black', white: 'white', blue: 'blue', navy: 'navy' }

/** Logo name in titles, so "Digital Inclusion logo, black, horizontal". */
function logoName(asset, version) {
  if (asset.brandName === 'UNICEF Digital Inclusion') return 'Digital Inclusion logo'
  if (asset.brandName === 'UNICEF Digital Impact') return `UNICEF Digital Impact Division logo${version ? ` (${version.label.toLowerCase()})` : ''}`
  return `${asset.brandName} logo`
}

function logoTags(asset) {
  const tags = [asset.brandName, asset.assetType === 'logo' ? '' : asset.assetType]
  if (asset.assetType === 'product') tags.push(asset.brandName.replace(/^Giga/, ''), 'product')
  if (asset.assetType === 'event') tags.push('event')
  if (asset.brandName.startsWith('UNICEF')) tags.push('unicef')
  return tags.filter(Boolean)
}

/**
 * One logo variant as the Logos page offers it: the file itself when the page
 * uses it as is, else a recoloured copy in public/generated/logos/. PNG next to it.
 */
async function addLogoVariant({ asset, version, src, variantName, recolor, title, tags = [] }) {
  const original = read(src)
  let svgUrl = src
  if (recolor) {
    const svg = recolor === 'giga' ? recolorGigaLogo(original, colorVariantToGigaVariant(variantName)) : recolorSvg(original, recolor)
    if (svg !== original) {
      svgUrl = `${GENERATED}/logos/${basename(src, '.svg')}-${slug(variantName)}.svg`
      writeIfChanged(svgUrl, svg)
    }
  }
  const id = basename(svgUrl, '.svg')
  const pngUrl = `${GENERATED}/logos/${id}.png`
  const hasPng = await svgToPng(svgUrl, pngUrl)
  const name = `${id} ${variantName}`
  const colour = inferColour(name)
  const layout = inferLayout(basename(src, '.svg'), ...Object.values(svgSize(original)))
  add({
    id,
    title: [title ?? logoName(asset, version), colour && COLOUR_LABEL[colour], layout].filter(Boolean).join(', '),
    url: svgUrl,
    name,
    // Brand from the source file only: a colour name such as "Giga Blue" says nothing about the brand.
    brand: inferBrand(basename(src, '.svg'), src),
    colour,
    layout,
    formats: [{ ext: 'svg', url: svgUrl }, ...(hasPng ? [{ ext: 'png', url: pngUrl }] : [])],
    preview: svgUrl,
    page: `/logos?brand=${asset.brand}`,
    tags: [...logoTags(asset), ...tags, variantName],
  })
}

// Logos: every brand, version and colour the Logos page offers, in the order of
// its Digital Inclusion and Giga tabs (search keeps this order for ties).
for (const asset of [...logosForBrand('di'), ...logosForBrand('giga')]) {
  if (asset.isGigaMainLogo) {
    for (const orientation of ['horizontal', 'vertical']) {
      for (const combination of ['standalone', 'unicef-itu']) {
        for (const variant of asset.allowedColorVariants) {
          await addLogoVariant({
            asset,
            src: resolveGigaLogoPath(orientation, combination),
            variantName: variant.name,
            recolor: 'giga',
            title: combination === 'unicef-itu' ? 'Giga logo with UNICEF and ITU' : 'Giga logo',
            tags: combination === 'unicef-itu' ? ['unicef', 'itu', 'partnership', 'lockup'] : ['main'],
          })
        }
      }
    }
    continue
  }
  for (const version of asset.versions ?? [null]) {
    const v = version ?? asset
    const bicolor = v.allowedColorVariants.some((c) => c.secondaryHex != null || c.name === 'Bicolor')
    for (const variant of v.allowedColorVariants) {
      const mapped = v.svgPathByColorName?.[variant.name]
      await addLogoVariant({
        asset,
        version,
        src: mapped ?? v.svgPath,
        variantName: variant.name,
        recolor: mapped ? null : bicolor ? 'giga' : variant.hex,
        tags: version ? [version.label] : [],
      })
    }
  }
}

// Illustrations: fill, outline white and outline blue are separate files.
const CATEGORY_TAGS = { pillars: ['pillar', 'pictogram'], general: ['general', 'pictogram'], 'giga-meter': ['giga meter', 'gigameter'] }
for (const ill of ILLUSTRATIONS) {
  const variants = ill.path
    ? [{ url: ill.path, label: null, name: `${ill.id} full-colour` }]
    : [
        { url: ill.fillPath, label: 'fill', name: `${ill.id} fill` },
        { url: ill.outlines.white, label: 'outline', name: basename(ill.outlines.white, '.svg') },
        { url: ill.outlines.blue, label: 'outline', name: basename(ill.outlines.blue, '.svg') },
      ]
  for (const variant of variants) {
    const colour = inferColour(variant.name)
    add({
      id: `illustration-${slug(variant.name)}`,
      title: [`${ill.label} illustration`, variant.label, variant.label === 'outline' && colour].filter(Boolean).join(', '),
      url: variant.url,
      name: variant.name,
      layout: null,
      formats: [{ ext: 'svg', url: variant.url }],
      preview: variant.url,
      page: '/illustrations',
      tags: [ill.label, ...(ill.keywords ?? []), ...CATEGORY_TAGS[ill.category], variant.label ?? ''],
    })
  }
}

// Photos: the Giga Photo Award stories.
for (const story of PHOTO_AWARD_STORIES) {
  story.images.forEach((image, i) => {
    const n = story.images.length > 1 ? `, photo ${i + 1} of ${story.images.length}` : ''
    add({
      id: `photo-${story.slug}-${String(i + 1).padStart(2, '0')}`,
      title: `${story.title}${n}`,
      url: image.src,
      name: story.slug,
      colour: null,
      size: { width: image.width, height: image.height },
      formats: [{ ext: extname(image.src).slice(1), url: image.src }],
      preview: image.thumb,
      page: '/media/photo-awards',
      tags: [story.photographer, story.location, 'photo award', 'giga photo award', 'connectivity'],
    })
  })
}

// Virtual backgrounds (the standard presets on the Backgrounds page).
for (const file of readdirSync(join(PUBLIC, 'backgrounds')).filter((f) => f.endsWith('.png')).sort()) {
  const url = `/backgrounds/${file}`
  const [, number, shade] = file.match(/map-0?(\d+)-(dark|light)/) ?? []
  add({
    id: `background-${basename(file, '.png')}`,
    title: `Virtual background, standard ${number}, ${shade}`,
    url,
    name: basename(file, '.png'),
    size: { width: 3840, height: 2160 },
    formats: [{ ext: 'png', url }],
    preview: await thumbnail(url, `${GENERATED}/thumbs/background-${basename(file, '.png')}.jpg`),
    page: '/materials/backgrounds',
    tags: ['virtual background', 'teams', 'zoom', 'meet', 'video call', 'map', '4k'],
  })
}

// Video guideline examples.
for (const file of readdirSync(join(PUBLIC, 'images', 'video-guidelines')).filter((f) => f.endsWith('.png')).sort()) {
  const url = `/images/video-guidelines/${file}`
  const label = basename(file, '.png').replace(/-(\d+)-(\d+)$/, ' $1:$2').replace(/-/g, ' ')
  add({
    id: `guideline-video-${basename(file, '.png')}`,
    title: `Video guideline, ${label}`,
    url,
    name: basename(file, '.png'),
    colour: null,
    layout: null,
    formats: [{ ext: 'png', url }],
    preview: await thumbnail(url, `${GENERATED}/thumbs/guideline-video-${basename(file, '.png')}.jpg`),
    page: '/guidelines/video',
    tags: ['video', 'guidelines', label],
  })
}

// Fonts on the Typography page. Shared by both brands, so the brand comes from the overrides.
for (const [family, file, role] of [
  ['Manrope', 'manrope-var-normal-latin.woff2', 'headings'],
  ['Open Sans', 'open-sans-var-normal-latin.woff2', 'body text'],
]) {
  const url = `/fonts/${file}`
  add({
    id: `font-${slug(family)}`,
    title: `${family} font`,
    url,
    name: slug(family),
    colour: null,
    layout: null,
    formats: [{ ext: 'woff2', url }],
    preview: null,
    page: '/typography',
    tags: [family, role, 'google fonts'],
  })
}

// Palettes on the Colors page, with a swatch sheet as preview and download.
function swatchSvg(colours) {
  const w = 80
  const rects = colours.map((hex, i) => `<rect x="${i * w}" y="0" width="${w}" height="240" fill="${hex}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${colours.length * w}" height="240" viewBox="0 0 ${colours.length * w} 240">${rects}</svg>\n`
}
for (const [brand, title, scales, main] of [
  ['di', 'Digital Inclusion palette', DI_COLOR_SCALES, DI_MAIN_COLORS],
  ['giga', 'Giga palette', COLOR_SCALES, []],
]) {
  const primary = scales[0]?.tokens.map((t) => t.hex) ?? []
  const url = `${GENERATED}/palettes/${brand}-palette.svg`
  writeIfChanged(url, swatchSvg(primary))
  add({
    id: `palette-${brand}`,
    title,
    url,
    name: `${brand} palette`,
    brand,
    colour: null,
    layout: null,
    formats: [{ ext: 'svg', url }],
    preview: url,
    page: `/colors?brand=${brand}`,
    tags: [...scales.map((s) => s.name), ...main.map((m) => m.name ?? ''), ...primary, 'tokens', 'swatches'],
  })
}

// --------------------------------------------------------------------------
// Overrides, report, write

for (const a of assets) {
  const missing = ['brand', 'type'].filter((k) => !a[k])
  if (!a.colour && ['logo', 'illustration'].includes(a.type)) missing.push('colour')
  if (missing.length) inferred.push({ id: a.id, title: a.title, missing })
}

const overrides = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf8')) : {}
for (const [id, patch] of Object.entries(overrides)) {
  if (id.startsWith('$')) continue // "$comment" and other notes
  const asset = assets.find((a) => a.id === id)
  if (!asset) {
    console.warn(`[assets] override for unknown asset "${id}" ignored`)
    continue
  }
  Object.assign(asset, patch)
}

const manifestJson = JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n'
if (!existsSync(MANIFEST) || readFileSync(MANIFEST, 'utf8') !== manifestJson) writeFileSync(MANIFEST, manifestJson)

const json = JSON.stringify(assets, null, 2) + '\n'
const changed = !existsSync(OUT) || readFileSync(OUT, 'utf8') !== json
if (changed) writeFileSync(OUT, json)

const stillMissing = inferred.filter(({ id, missing }) => missing.some((k) => !assets.find((a) => a.id === id)[k]))
const byType = Object.entries(assets.reduce((m, a) => ({ ...m, [a.type]: (m[a.type] ?? 0) + 1 }), {}))
console.log(
  `[assets] ${assets.length} assets (${byType.map(([t, n]) => `${n} ${t}`).join(', ')}), ${written} generated files written, index ${changed ? 'updated' : 'unchanged'}` +
    ` (${createHash('sha1').update(json).digest('hex').slice(0, 8)}).`,
)
if (inferred.length) {
  console.log(`[assets] ${inferred.length} assets needed data/assets.overrides.json (could not infer from names):`)
  for (const { id, missing } of inferred) {
    const fixed = !stillMissing.some((s) => s.id === id)
    console.log(`  ${fixed ? '✓' : '✗'} ${id}: ${missing.join(', ')}${fixed ? ' (set in overrides)' : ''}`)
  }
}
if (stillMissing.length) console.warn(`[assets] ${stillMissing.length} assets still miss a brand, type or colour.`)
