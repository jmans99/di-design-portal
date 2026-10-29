/**
 * Builds the Photo Awards gallery from the raw export folder + the captions
 * CSV (Google Sheet "Giga Photo Award: Stories on the Impact of Connectivity").
 *
 *   node tools/photo-awards/build.mjs "~/Downloads/Giga Asset Accelerator"
 *
 * Writes:
 *   public/photo-awards/<story>/<nn>.jpg        display + download, 2400px long edge
 *   public/photo-awards/<story>/<nn>-thumb.jpg  grid thumbnail, 800px
 *   lib/photo-awards.ts                         typed data (GENERATED)
 *
 * Story order and source folders are declared in STORIES below: the sheet
 * groups rows by story (blank rows between them, DONNA repeats its title on
 * every row) and each story's rows follow the numbered files in its folder.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SRC = process.argv[2]?.replace(/^~/, process.env.HOME) ?? path.join(process.env.HOME, 'Downloads/Giga Asset Accelerator')
const ROOT = path.resolve(import.meta.dirname, '../..')
const OUT = path.join(ROOT, 'public/photo-awards')
const CSV = path.join(import.meta.dirname, 'captions.csv')
const FULL_EDGE = 2400
const THUMB_EDGE = 800

// sheet title -> source (file or folder) + slug + award rank from the folder prefix
const STORIES = [
  { match: /^Sudan$/i, slug: 'sudan', source: '2_faiz Abubakr Mohamed -  - 1 - Faiz  suadn - 137a87e8-2668-4e2b-853a-3774232e5651.jpg', rank: 2 },
  { match: /^A Completely Normal Day$/i, slug: 'a-completely-normal-day', source: '3_Antti Yrjönen -  - 2 - A Completely Normal Day - 7d40b591-bd6a-4ed9-ad02-f39234da5bed.jpg', rank: 3 },
  { match: /^Inside prison/i, slug: 'inside-prison', source: '1_Magali Druscovich - Inside prison- “The Phone Is Everything”', rank: 1 },
  { match: /^Energy Paradox$/i, slug: 'energy-paradox', source: '3_Francis Ogunyemi - ENERGY PARADOX', rank: 3 },
  { match: /^Internet Cafes$/i, slug: 'internet-cafes', source: '2_ Place Ammar  Abubaker  -  - 3 - Internet Cafes - ee342384-0121-4d0d-ac98-30f01578f035.jpg', rank: 2 },
  { match: /^DONNA/i, slug: 'donna', source: 'DONNA- technology as the only way to strengthen family relationships through a life of exile ', rank: null },
]

/* ---------- CSV (RFC 4180, multi-line quoted fields) ---------- */
function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = '' }
    else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

const clean = (s) => s.replace(/​/g, '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

/** Split one sheet cell into its labelled parts. */
function parseCell(raw) {
  const text = clean(raw)
  const get = (label, stopAt) => {
    const m = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${stopAt})\\s*:|$)`, 'i').exec(text)
    return m ? clean(m[1]) : ''
  }
  return {
    title: get('Title', 'Photographer|Location|Project Description|Caption').split('\n')[0],
    photographer: get('Photographer', 'Title|Location|Project Description|Caption').split('\n')[0],
    location: get('Location', 'Title|Photographer|Project Description|Caption').split('\n')[0],
    description: get('Project Description', 'Title|Photographer|Location|Caption'),
    caption: get('Caption', 'Title|Photographer|Location|Project Description'),
  }
}

const rows = parseCsv(fs.readFileSync(CSV, 'utf8'))
const intro = clean(rows.find((r) => /Giga Photo Award/i.test(r.join(' ')))?.join('\n') ?? '')
const cells = rows.map((r) => r[1] ?? '').filter((c) => c.trim() && !/^Caption\s*$/i.test(c.trim()) && !/Giga Photo Award/i.test(c))

// group cells into stories
const groups = []
for (const cell of cells) {
  const p = parseCell(cell)
  const last = groups[groups.length - 1]
  if (p.title && !(last && last.title.toLowerCase() === p.title.toLowerCase())) {
    groups.push({ title: p.title, photographer: p.photographer, location: p.location, description: p.description, captions: [p.caption] })
  } else {
    if (!last) throw new Error('Caption row before any titled row')
    if (p.location && !last.location) last.location = p.location
    last.captions.push(p.caption)
  }
}

/* ---------- images ---------- */
const numOf = (f) => Number(/^(\d+)\s*-/.exec(path.basename(f))?.[1] ?? 0)
function sourceFiles(source) {
  const full = path.join(SRC, source)
  if (fs.statSync(full).isFile()) return [full]
  return fs.readdirSync(full).filter((f) => /\.jpe?g$/i.test(f)).map((f) => path.join(full, f)).sort((a, b) => numOf(a) - numOf(b))
}

fs.mkdirSync(OUT, { recursive: true })
const out = []
for (const def of STORIES) {
  const g = groups.find((x) => def.match.test(x.title))
  if (!g) throw new Error(`No sheet group for ${def.slug}`)
  const files = sourceFiles(def.source)
  if (files.length !== g.captions.length) {
    console.warn(`! ${def.slug}: ${files.length} files vs ${g.captions.length} captions`)
  }
  const dir = path.join(OUT, def.slug)
  fs.mkdirSync(dir, { recursive: true })
  const images = []
  for (let i = 0; i < files.length; i++) {
    const nn = String(i + 1).padStart(2, '0')
    const img = sharp(files[i]).rotate()
    const meta = await img.metadata()
    const full = path.join(dir, `${nn}.jpg`)
    const thumb = path.join(dir, `${nn}-thumb.jpg`)
    if (!fs.existsSync(full)) await img.clone().resize({ width: FULL_EDGE, height: FULL_EDGE, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(full)
    if (!fs.existsSync(thumb)) await img.clone().resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(thumb)
    const fm = await sharp(full).metadata()
    images.push({ src: `/photo-awards/${def.slug}/${nn}.jpg`, thumb: `/photo-awards/${def.slug}/${nn}-thumb.jpg`, width: fm.width, height: fm.height, caption: g.captions[i] ?? '', sourceWidth: meta.width, sourceHeight: meta.height })
    process.stdout.write(`${def.slug} ${nn}/${files.length}\r`)
  }
  console.log(`${def.slug}: ${images.length} images`)
  out.push({ slug: def.slug, title: g.title, photographer: g.photographer, location: g.location, description: g.description, rank: def.rank, images })
}

const ts = `/**
 * GENERATED by tools/photo-awards/build.mjs from tools/photo-awards/captions.csv
 * and the raw export folder. Edit the sheet or the script, not this file.
 */

export type PhotoAwardImage = {
  src: string
  thumb: string
  width: number
  height: number
  caption: string
}

export type PhotoAwardStory = {
  slug: string
  title: string
  photographer: string
  location: string
  /** The story's own text; single-image entries use the caption as the story. */
  description: string
  /** Award place from the submission folders; null when not ranked. */
  rank: 1 | 2 | 3 | null
  images: PhotoAwardImage[]
}

export const PHOTO_AWARD_INTRO = ${JSON.stringify(intro)}

/** The Giga Photo Award photos are shared by DI and Giga (UNICEF advocacy use). */
export const PHOTO_AWARD_BRAND: 'di' | 'giga' | 'both' = 'both'

export const PHOTO_AWARD_STORIES: PhotoAwardStory[] = ${JSON.stringify(out.map((s) => ({ ...s, images: s.images.map(({ sourceWidth, sourceHeight, ...i }) => i) })), null, 2)}
`
fs.writeFileSync(path.join(ROOT, 'lib/photo-awards.ts'), ts)
console.log('wrote lib/photo-awards.ts')
