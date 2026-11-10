/**
 * Builds the Photo Awards gallery from the winners sheet
 * (Google Sheet "Giga Photo Award 2025–2026", one row per photo).
 *
 *   node tools/photo-awards/build.mjs ["~/Downloads/Giga Photo Award 2025-2026"]
 *
 * Reads:
 *   tools/photo-awards/winners.csv        the sheet, exported as CSV
 *   tools/photo-awards/descriptions.json  project descriptions by slug (not in the sheet)
 *   tools/photo-awards/drive-files.json   public Drive file ids by slug, in frame order
 *
 * Writes:
 *   public/photo-awards/<story>/<nn>.jpg        display + download, 2400px long edge
 *   public/photo-awards/<story>/<nn>-thumb.jpg  grid thumbnail, 800px
 *   lib/photo-awards.ts                         typed data (GENERATED)
 *
 * A photo already in public/photo-awards is kept as it is. Otherwise the raw
 * file is looked up in the cache folder as <drive id>.<ext>, and downloaded
 * there first when Drive serves it without a login. The links in the sheet
 * need a login, so drive-files.json lists the ids of the public copies (the
 * shared "2026 Winners" and 2025 "Winning Images" folders), matched to each
 * story and frame by folder and by the number that starts each file name. A story with a photo that cannot be found is left
 * out and reported, so a partial run never publishes half a story.
 *
 * To refresh the sheet:
 *   curl -sL "https://docs.google.com/spreadsheets/d/1jHzoxVtHn0BhRXzmqGqNjE8L6ePoD--XwKiMBRLaFhU/export?format=csv&gid=1128987571" -o tools/photo-awards/winners.csv
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const CACHE = process.argv[2]?.replace(/^~/, process.env.HOME) ?? path.join(process.env.HOME, 'Downloads/Giga Photo Award 2025-2026')
const ROOT = path.resolve(import.meta.dirname, '../..')
const OUT = path.join(ROOT, 'public/photo-awards')
const CSV = path.join(import.meta.dirname, 'winners.csv')
const DESCRIPTIONS = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'descriptions.json'), 'utf8'))
// Public copies of the photos, by story slug and in frame order (see the header).
const DRIVE_FILES = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'drive-files.json'), 'utf8'))
const FULL_EDGE = 2400
const THUMB_EDGE = 800

const CATEGORIES = ['Multiple Image', 'Single Image', 'Junior Visual Storyteller']

// Stories published before the sheet existed keep their folder, so their
// files and search ids stay put.
const LEGACY_SLUGS = [
  { match: /^Inside Prison/i, slug: 'inside-prison' },
  { match: /^DONNA/i, slug: 'donna' },
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

const clean = (s) => (s ?? '').replace(/​/g, '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
const slugify = (s) => s.replace(/['’]/g, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const driveId = (url) => /\/d\/([\w-]+)/.exec(url)?.[1] ?? /[?&]id=([\w-]+)/.exec(url)?.[1] ?? null

/* ---------- sheet -> stories ---------- */
const [header, ...rows] = parseCsv(fs.readFileSync(CSV, 'utf8'))
const col = Object.fromEntries(header.map((h, i) => [clean(h), i]))
for (const name of ['Year', 'Category', 'Place', 'Story title', 'Photographer', 'Country', 'Frame', 'Frame title', 'Caption', 'Credit', 'Drive file']) {
  if (!(name in col)) throw new Error(`winners.csv: missing column "${name}"`)
}
const get = (r, name) => clean(r[col[name]])

const stories = []
const taken = new Set()
for (const r of rows) {
  if (!get(r, 'Story title')) continue
  const year = Number(get(r, 'Year'))
  const category = get(r, 'Category')
  const title = get(r, 'Story title')
  if (!CATEGORIES.includes(category)) throw new Error(`winners.csv: unknown category "${category}" (${title})`)
  let story = stories.find((s) => s.year === year && s.category === category && s.title === title)
  if (!story) {
    const place = get(r, 'Place')
    let slug = LEGACY_SLUGS.find((l) => l.match.test(title))?.slug ?? slugify(title)
    if (taken.has(slug)) slug = `${slug}-${year}`
    if (taken.has(slug)) throw new Error(`Duplicate story slug ${slug}`)
    taken.add(slug)
    story = {
      slug, year, category, title,
      photographer: get(r, 'Photographer'),
      country: get(r, 'Country'),
      description: DESCRIPTIONS[slug] ?? '',
      place,
      rank: Number(/^([123])(st|nd|rd)/i.exec(place)?.[1]) || null,
      studentsChoice: /students/i.test(place),
      credit: get(r, 'Credit'),
      frames: [],
    }
    stories.push(story)
  }
  story.frames.push({ frame: Number(get(r, 'Frame')), title: get(r, 'Frame title'), caption: get(r, 'Caption'), id: driveId(get(r, 'Drive file')) })
}
for (const s of stories) {
  s.frames.sort((a, b) => a.frame - b.frame)
  s.frames.forEach((f, i) => { if (f.frame !== i + 1) throw new Error(`${s.slug}: frames are not 1..n (${f.frame} at position ${i + 1})`) })
}

/* ---------- raw photos ---------- */
fs.mkdirSync(CACHE, { recursive: true })
const cached = (id) => fs.readdirSync(CACHE).find((f) => path.parse(f).name === id)

/** The raw file for a Drive id: from the cache, else downloaded when Drive allows it without a login. */
async function rawFile(id) {
  if (!id) return null
  const hit = cached(id)
  if (hit) return path.join(CACHE, hit)
  try {
    const res = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`)
    const type = res.headers.get('content-type') ?? ''
    if (!res.ok || !type.startsWith('image/')) return null
    const ext = type.includes('png') ? 'png' : type.includes('tiff') ? 'tif' : 'jpg'
    const file = path.join(CACHE, `${id}.${ext}`)
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
    return file
  } catch {
    return null
  }
}

fs.mkdirSync(OUT, { recursive: true })
const out = []
const skipped = []
for (const s of stories) {
  const dir = path.join(OUT, s.slug)
  const images = []
  const missing = []
  for (let i = 0; i < s.frames.length; i++) {
    const f = s.frames[i]
    const nn = String(i + 1).padStart(2, '0')
    const full = path.join(dir, `${nn}.jpg`)
    const thumb = path.join(dir, `${nn}-thumb.jpg`)
    if (!fs.existsSync(full) || !fs.existsSync(thumb)) {
      const raw = await rawFile(DRIVE_FILES[s.slug]?.[i] ?? f.id)
      if (!raw) { missing.push(f.frame); continue }
      fs.mkdirSync(dir, { recursive: true })
      const img = sharp(raw).rotate()
      await img.clone().resize({ width: FULL_EDGE, height: FULL_EDGE, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(full)
      await img.clone().resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(thumb)
    }
    const fm = await sharp(full).metadata()
    images.push({
      src: `/photo-awards/${s.slug}/${nn}.jpg`,
      thumb: `/photo-awards/${s.slug}/${nn}-thumb.jpg`,
      width: fm.width,
      height: fm.height,
      ...(f.title ? { title: f.title } : {}),
      caption: f.caption,
    })
  }
  if (missing.length) {
    skipped.push(s)
    console.warn(`! ${s.year} ${s.slug}: left out, ${missing.length} of ${s.frames.length} photos not found (frames ${missing.join(', ')})`)
    continue
  }
  console.log(`${s.year} ${s.slug}: ${images.length} photos`)
  out.push({ ...s, frames: undefined, images })
}

const ts = `/**
 * GENERATED by tools/photo-awards/build.mjs from tools/photo-awards/winners.csv.
 * Edit the sheet or the script, not this file.
 */

export type PhotoAwardCategory = 'Multiple Image' | 'Single Image' | 'Junior Visual Storyteller'

export type PhotoAwardImage = {
  src: string
  thumb: string
  width: number
  height: number
  /** The photo's own title, when the photographer gave one. */
  title?: string
  caption: string
}

export type PhotoAwardStory = {
  slug: string
  /** Edition of the Giga Photo Award. */
  year: number
  category: PhotoAwardCategory
  title: string
  photographer: string
  /** The photographer's country as the award lists it, not always where the photos were taken. */
  country: string
  /** The project's own text; empty when the sheet has only captions. */
  description: string
  /** The award as the sheet words it, e.g. "3rd Place · Students’ Choice". */
  place: string
  /** 1, 2 or 3 for the podium; null for a prize outside it. */
  rank: 1 | 2 | 3 | null
  studentsChoice: boolean
  /** Credit line to publish with the photos. */
  credit: string
  images: PhotoAwardImage[]
}

/** Categories in the order the page lists them. */
export const PHOTO_AWARD_CATEGORIES: PhotoAwardCategory[] = ${JSON.stringify(CATEGORIES)}

/** The Giga Photo Award photos are shared by DI and Giga (UNICEF advocacy use). */
export const PHOTO_AWARD_BRAND: 'di' | 'giga' | 'both' = 'both'

export const PHOTO_AWARD_STORIES: PhotoAwardStory[] = ${JSON.stringify(out, null, 2)}
`
fs.writeFileSync(path.join(ROOT, 'lib/photo-awards.ts'), ts)
const count = (list) => list.reduce((n, s) => n + (s.images ?? s.frames).length, 0)
console.log(`wrote lib/photo-awards.ts: ${out.length} stories, ${count(out)} photos`)
if (skipped.length) {
  console.warn(`${skipped.length} stories left out (${count(skipped)} photos). Put the raw files in "${CACHE}" as <drive id>.jpg and run again.`)
  process.exitCode = 2
}
