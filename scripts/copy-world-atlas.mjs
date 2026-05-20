import { copyFile, mkdir, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SRC = resolve(ROOT, 'node_modules/world-atlas/countries-10m.json')
const DEST = resolve(ROOT, 'public/data/social-media/countries-10m.json')

try {
  await access(SRC)
} catch {
  console.warn('[copy-world-atlas] node_modules/world-atlas not installed yet — skipping')
  process.exit(0)
}

await mkdir(dirname(DEST), { recursive: true })
await copyFile(SRC, DEST)
console.log(`[copy-world-atlas] copied countries-10m.json -> ${DEST}`)
