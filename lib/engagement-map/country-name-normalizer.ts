import { GIGA_COUNTRIES } from '@/lib/giga-countries'

const ANNOTATION_RX = /\s*\([^)]*\)\s*$/

export function stripAnnotations(name: string): string {
  return name.replace(ANNOTATION_RX, '').trim()
}

function canonical(name: string): string {
  return stripAnnotations(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[`'’ʼ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const ALIASES: Record<string, string> = {
  'democratic republic of congo': 'cd',
  'democratic republic of the congo': 'cd',
  'dr congo': 'cd',
  'congo democratic republic': 'cd',
  'republic of congo': 'cg',
  'cote divoire': 'ci',
  'ivory coast': 'ci',
  'palestine': 'ps',
  'state of palestine': 'ps',
  'sao tome and principe': 'st',
  'são tomé and príncipe': 'st',
  'eswatini': 'sz',
  'swaziland': 'sz',
  'cape verde': 'cv',
  'cabo verde': 'cv',
  'east timor': 'tl',
  'timor leste': 'tl',
  'burma': 'mm',
  'myanmar': 'mm',
  // British Overseas Territories — data uses short/reordered forms that differ
  // from the GIGA_COUNTRIES canonical names ("Turks and Caicos Islands",
  // "Virgin Islands, British").
  'turks and caicos': 'tc',
  'turks and caicos islands': 'tc',
  'british virgin islands': 'vg',
  'virgin islands british': 'vg',
}

const NAME_INDEX: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const c of GIGA_COUNTRIES) map.set(canonical(c.name), c.code)
  for (const [alias, code] of Object.entries(ALIASES)) map.set(alias, code)
  return map
})()

export function normalizeToIsoCode(name: string): string | null {
  return NAME_INDEX.get(canonical(name)) ?? null
}
