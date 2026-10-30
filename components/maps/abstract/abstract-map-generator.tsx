'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { PreviewPanel } from '@/components/ui/preview-panel'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { BackgroundToggle } from '@/components/maps/abstract/background-toggle'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Copy,
  Download,
  Globe,
  Loader2,
  Maximize2,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CONNECTIVITY_LEGEND,
  DATA_LAYERS,
  DOT_COLORS,
  REGIONS,
  type DataLayer,
  type GigaMapCountry,
  type GigaMapRegion,
  type MapTarget,
  targetCode,
} from '@/lib/giga-maps/config'
import { fetchGigaMapCountries } from '@/lib/giga-maps/render'
import { loadDotPoints, type DotPointSet } from '@/lib/giga-maps/abstract/load-points'
import { DEFAULT_ABSTRACT_OPTIONS, layoutDots, type AbstractMapOptions } from '@/lib/giga-maps/abstract/layout'
import { DOT_BACKGROUNDS, drawDots, dotsToPngBlob, dotsToSvg } from '@/lib/giga-maps/abstract/render'
import { NAVY, getPrimaryColor600 } from '@/lib/color-tokens'

type Resolution = 1 | 2
type LoadState = 'loading' | 'ready' | 'error'
type SizePreset = 'full' | 'half' | 'square' | 'custom'

const SIZES: { id: SizePreset; label: string; width?: number; height?: number }[] = [
  { id: 'full', label: 'Full slide', width: 1920, height: 1080 },
  { id: 'half', label: 'Half slide', width: 960, height: 1080 },
  { id: 'square', label: 'Square', width: 1080, height: 1080 },
  { id: 'custom', label: 'Custom' },
]
/** Settings under "Advanced settings", with their reset. */
const ADVANCED_KEYS = [
  'padding',
  'dotSize',
  'density',
  'grid',
  'gridSpacing',
  'colorMode',
  'singleColor',
  'seed',
] as const satisfies readonly (keyof AbstractMapOptions)[]

const CUSTOM_MIN = 100
const CUSTOM_MAX = 4000

/** Single colour choices, all existing brand tokens. */
const BRAND_COLORS = [
  { label: 'Giga blue', value: getPrimaryColor600() },
  { label: 'Connectivity green', value: DOT_COLORS.connected },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Grey 900', value: '#161616' },
  { label: 'Navy', value: NAVY },
]

/**
 * Abstract style of the Maps page (beta, /materials/maps/abstract):
 * facilities only, no basemap, borders or labels. Area and Facilities
 * pickers mirror GigaMapGenerator. The area is kept in the URL (?area=KE,
 * ?area=africa) so a shared link opens on it.
 */
export function AbstractMapGenerator() {
  const [countries, setCountries] = useState<GigaMapCountry[]>([])
  const [countriesError, setCountriesError] = useState<string | null>(null)
  const [country, setCountry] = useState<GigaMapCountry | null>(null)
  const [scope, setScope] = useState<'country' | 'region'>('country')
  const [region, setRegion] = useState<GigaMapRegion>(REGIONS.find((r) => r.code === 'africa') ?? REGIONS[0])
  const [layer, setLayer] = useState<DataLayer>('school')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [settings, setSettings] = useState<AbstractMapOptions>(DEFAULT_ABSTRACT_OPTIONS)
  const [sizePreset, setSizePreset] = useState<SizePreset>('full')
  const [custom, setCustom] = useState({ width: '1920', height: '1080' })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const set = useCallback(
    <K extends keyof AbstractMapOptions>(key: K, value: AbstractMapOptions[K]) =>
      setSettings((o) => ({ ...o, [key]: value })),
    [],
  )
  const [resolution, setResolution] = useState<Resolution>(2)

  // "Changed" marker and reset for Advanced settings. Grid spacing and the
  // single colour only count while they have an effect.
  const advancedChanged = ADVANCED_KEYS.some((k) => {
    if (k === 'gridSpacing' && settings.grid === 'off') return false
    if (k === 'singleColor' && settings.colorMode !== 'single') return false
    return settings[k] !== DEFAULT_ABSTRACT_OPTIONS[k]
  })
  const resetAdvanced = useCallback(
    () =>
      setSettings((o) => ({
        ...o,
        ...Object.fromEntries(ADVANCED_KEYS.map((k) => [k, DEFAULT_ABSTRACT_OPTIONS[k]])),
      })),
    [],
  )

  const [data, setData] = useState<DotPointSet | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'png' | 'svg' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  // Tied to the dots it was made for, so it disappears once settings change.
  const [svgNote, setSvgNote] = useState<{ for: unknown; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    fetchGigaMapCountries()
      .then((list) => {
        if (cancelled) return
        setCountries(list)
        // A shared link (?area=KE or ?area=africa) opens on that area.
        const wanted = new URLSearchParams(window.location.search).get('area')?.toLowerCase()
        const fromUrlCountry = wanted ? list.find((c) => c.code === wanted) : undefined
        const fromUrlRegion = wanted ? REGIONS.find((r) => r.code === wanted) : undefined
        if (fromUrlRegion) {
          setRegion(fromUrlRegion)
          setScope('region')
        }
        setCountry(fromUrlCountry ?? list.find((c) => c.code === 'br') ?? list[0] ?? null)
      })
      .catch((err) => {
        if (!cancelled) setCountriesError(err instanceof Error ? err.message : 'Could not load countries')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const target: MapTarget | null = useMemo(() => {
    if (scope === 'region') return { kind: 'region', region }
    return country ? { kind: 'country', country } : null
  }, [scope, region, country])

  // Keep the area in the URL without adding history entries.
  useEffect(() => {
    if (!target) return
    const url = new URL(window.location.href)
    const code = targetCode(target)
    url.searchParams.set('area', target.kind === 'country' ? code.toUpperCase() : code)
    window.history.replaceState(window.history.state, '', url)
  }, [target])

  useEffect(() => {
    if (!target) return
    let cancelled = false
    // Loading state is reset from the async callback chain, not synchronously.
    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setLoadState('loading')
        setLoadError(null)
        return loadDotPoints(target, layer)
      })
      .then((set) => {
        if (cancelled || !set) return
        setData(set)
        setLoadState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setLoadState('error')
        setLoadError(err instanceof Error ? err.message : 'Could not load facilities')
      })
    return () => {
      cancelled = true
    }
  }, [target, layer])

  const size = useMemo(() => {
    const preset = SIZES.find((x) => x.id === sizePreset)
    if (preset?.width && preset.height) return { width: preset.width, height: preset.height }
    return { width: clampSize(custom.width), height: clampSize(custom.height) }
  }, [sizePreset, custom])

  const legendAvailable = settings.colorMode === 'status' || layer === 'all'
  const liveOpts = useMemo(
    () => ({ ...settings, ...size, legend: settings.legend && legendAvailable }),
    [settings, size, legendAvailable],
  )
  // Sliders stay smooth on large areas: the preview catches up a frame later.
  const opts = useDeferredValue(liveOpts)
  const dots = useMemo(() => (data ? layoutDots(data.points, opts) : []), [data, opts])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.width = opts.width
    canvas.height = opts.height
    drawDots(ctx, dots, opts, 1)
  }, [dots, opts])

  const baseName = useMemo(() => {
    if (!target) return ''
    const code = target.kind === 'country' ? target.country.code.toUpperCase() : target.region.code
    return `giga-maps_${code}_${DATA_LAYERS[layer].fileTag}_abstract_${opts.width}x${opts.height}_${opts.background}`
  }, [target, layer, opts.width, opts.height, opts.background])

  const sourceLine = useMemo(() => {
    const date = (data?.loadedAt ?? new Date()).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const noun = layer === 'school' ? 'school' : 'facility'
    const plural = layer === 'school' ? 'schools' : 'facilities'
    const each =
      opts.grid === 'off'
        ? `Each dot is a ${noun}.`
        : `Each dot marks a grid cell with at least one ${noun}.`
    const sample = opts.density < 100 ? ` ${opts.density}% of ${plural} shown.` : ''
    return `Source: Giga Maps (maps.giga.global), data accessed ${date}. ${each}${sample}`
  }, [data, layer, opts.grid, opts.density])

  const ready = loadState === 'ready'

  const handlePng = useCallback(async () => {
    if (!ready) return
    setBusy('png')
    setExportError(null)
    try {
      download(await dotsToPngBlob(dots, opts, resolution), `${baseName}_${resolution}x.png`)
    } catch (err) {
      console.error('Abstract map PNG export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBusy(null)
    }
  }, [ready, dots, opts, resolution, baseName])

  const handleSvg = useCallback(async () => {
    if (!ready) return
    setBusy('svg')
    setExportError(null)
    try {
      // Let the button show its busy state before the (synchronous) build.
      await new Promise((r) => setTimeout(r, 0))
      const res = dotsToSvg(dots, opts)
      download(new Blob([res.svg], { type: 'image/svg+xml' }), `${baseName}.svg`)
      setSvgNote(
        res.thinned
          ? {
              for: dots,
              text: `To keep the SVG under 2 MB, it has ${formatCount(res.shown)} of ${formatCount(res.total)} dots, spread evenly. Use the PNG for every dot.`,
            }
          : null,
      )
    } catch (err) {
      console.error('Abstract map SVG export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBusy(null)
    }
  }, [ready, dots, opts, baseName])

  const copySource = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sourceLine)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked (http, permissions); the text stays selectable.
    }
  }, [sourceLine])

  const bg = DOT_BACKGROUNDS[opts.background]
  const loadedCount = data?.points.length ?? 0

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        <ControlSection
          label="Area"
          icon={<Globe className="h-3.5 w-3.5 text-muted-foreground" />}
          className="lg:pt-4 lg:pb-2.5"
        >
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={pickerOpen}
                aria-controls="abstract-map-area-list"
                disabled={scope === 'country' && !country}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-smooth-transform focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              >
                <span className="flex items-center gap-2 truncate">
                  {scope === 'country' && (
                    <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {country?.code ?? '…'}
                    </span>
                  )}
                  <span className="truncate text-foreground">
                    {scope === 'region'
                      ? region.name
                      : (country?.name ?? (countriesError ? 'Unavailable' : 'Loading countries…'))}
                  </span>
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent id="abstract-map-area-list" className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search a region or country..." />
                <CommandList>
                  <CommandEmpty>No region or country found.</CommandEmpty>
                  <CommandGroup heading="Regions">
                    {REGIONS.map((r) => (
                      <CommandItem
                        key={r.code}
                        value={`${r.name} ${r.code}`}
                        onSelect={() => {
                          setRegion(r)
                          setScope('region')
                          setPickerOpen(false)
                        }}
                      >
                        <span className="flex-1 truncate">{r.name}</span>
                        <Check
                          className={cn(
                            'ml-2 h-4 w-4',
                            scope === 'region' && region.code === r.code ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {countries.length > 0 && (
                    <CommandGroup heading="Countries">
                      {countries.map((c) => (
                        <CommandItem
                          key={c.code}
                          value={`${c.name} ${c.code}`}
                          onSelect={() => {
                            setCountry(c)
                            setScope('country')
                            setPickerOpen(false)
                          }}
                        >
                          <span className="mr-2 inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {c.code}
                          </span>
                          <span className="flex-1 truncate">{c.name}</span>
                          <Check
                            className={cn(
                              'ml-2 h-4 w-4',
                              scope === 'country' && country?.code === c.code ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {countriesError && <p className="text-xs text-destructive">{countriesError}</p>}
          {scope === 'region' && (
            <p className="text-[11px] text-muted-foreground">
              Region maps load a few MB of live data; the first render can take a little longer.
            </p>
          )}
        </ControlSection>

        <ControlSection label="Facilities">
          <div className="flex flex-col gap-2">
            {(Object.keys(DATA_LAYERS) as DataLayer[]).map((key) => (
              <ToggleButton key={key} active={layer === key} onClick={() => setLayer(key)}>
                {DATA_LAYERS[key].label}
              </ToggleButton>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Schools are circles, health centers are squares.</p>
          {ready && (
            <p className="text-[11px] text-muted-foreground">
              {formatCount(dots.length)} dots shown · {formatCount(loadedCount)} facilities loaded
            </p>
          )}
        </ControlSection>

        <ControlSection label="Size" icon={<Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />}>
          <div className="grid grid-cols-2 gap-2">
            {SIZES.map((x) => (
              <ToggleButton key={x.id} active={sizePreset === x.id} onClick={() => setSizePreset(x.id)}>
                {x.label}
              </ToggleButton>
            ))}
          </div>
          {sizePreset === 'custom' ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                aria-label="Width in pixels"
                min={CUSTOM_MIN}
                max={CUSTOM_MAX}
                value={custom.width}
                onChange={(e) => setCustom((c) => ({ ...c, width: e.target.value }))}
                className="h-9"
              />
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                inputMode="numeric"
                aria-label="Height in pixels"
                min={CUSTOM_MIN}
                max={CUSTOM_MAX}
                value={custom.height}
                onChange={(e) => setCustom((c) => ({ ...c, height: e.target.value }))}
                className="h-9"
              />
            </div>
          ) : null}
          <p className="text-[11px] text-muted-foreground">
            {size.width} × {size.height} px
            {sizePreset === 'custom' ? ` (${CUSTOM_MIN} to ${CUSTOM_MAX})` : ''}
          </p>
        </ControlSection>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="lg:px-5 lg:py-2.5">
          <CollapsibleTrigger
            className={cn(
              'relative flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-smooth-transform hover:bg-secondary/60 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              (advancedOpen || advancedChanged) && 'border-chosen-border',
            )}
          >
            {/* Sits on the top border so it never squeezes the label. */}
            {advancedChanged && (
              <span className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full border border-chosen-border bg-chosen px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-link">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-link" />
                Changed
              </span>
            )}
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="whitespace-nowrap text-sm font-medium text-foreground">Advanced settings</span>
              <span className="text-[11px] text-muted-foreground">Padding, dot size, density, grid, colour</span>
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', advancedOpen && 'rotate-180')}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-1 pt-2">
            <ControlSection label="Padding" className="lg:px-0">
              <LabeledSlider
                value={settings.padding}
                min={0}
                max={300}
                step={10}
                onChange={(v) => set('padding', v)}
                format={(v) => `${v} px`}
                label="Padding"
              />
            </ControlSection>

            <ControlSection label="Dot size" className="lg:px-0">
              <LabeledSlider
                value={settings.dotSize}
                min={1}
                max={8}
                step={0.5}
                onChange={(v) => set('dotSize', v)}
                format={(v) => `${v} px`}
                label="Dot size"
              />
            </ControlSection>

            <ControlSection label="Density" className="lg:px-0">
              <LabeledSlider
                value={settings.density}
                min={1}
                max={100}
                step={1}
                onChange={(v) => set('density', v)}
                format={(v) => `${v}% of facilities`}
                label="Density"
              />
            </ControlSection>

            <ControlSection label="Grid" className="lg:px-0">
              <div className="flex gap-2">
                {(['off', 'square', 'hex'] as const).map((g) => (
                  <ToggleButton key={g} active={settings.grid === g} onClick={() => set('grid', g)}>
                    {g === 'off' ? 'Off' : g === 'square' ? 'Square' : 'Hex'}
                  </ToggleButton>
                ))}
              </div>
              {settings.grid !== 'off' && (
                <LabeledSlider
                  value={settings.gridSpacing}
                  min={3}
                  max={30}
                  step={1}
                  onChange={(v) => set('gridSpacing', v)}
                  format={(v) => `${v} px apart`}
                  label="Grid spacing"
                />
              )}
            </ControlSection>

            <ControlSection label="Colour" className="lg:px-0">
              <div className="flex gap-2">
                <ToggleButton active={settings.colorMode === 'status'} onClick={() => set('colorMode', 'status')}>
                  By status
                </ToggleButton>
                <ToggleButton active={settings.colorMode === 'single'} onClick={() => set('colorMode', 'single')}>
                  One colour
                </ToggleButton>
              </div>
              {settings.colorMode === 'single' && (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Dot colour">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      role="radio"
                      aria-checked={settings.singleColor === c.value}
                      aria-label={c.label}
                      title={c.label}
                      onClick={() => set('singleColor', c.value)}
                      className={cn(
                        'h-8 w-8 rounded-full border border-border transition-smooth-transform active:scale-[0.95]',
                        settings.singleColor === c.value && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      )}
                      style={{ background: c.value }}
                    />
                  ))}
                </div>
              )}
            </ControlSection>

            <ControlSection label="Seed" className="lg:px-0">
              <div className="flex gap-2">
                <Input
                  id="abstract-map-seed"
                  aria-label="Seed"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={settings.seed}
                  onChange={(e) => set('seed', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => set('seed', Math.floor(Math.random() * 100000))}
                >
                  New seed
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Picks which facilities are shown when density is below 100%. The same seed and settings always
                give the same image.
              </p>
            </ControlSection>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!advancedChanged}
              onClick={resetAdvanced}
              className="mt-2 w-full"
            >
              <RotateCcw />
              Reset to defaults
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <ControlSection label="Legend">
          <label className="flex items-center justify-between gap-3 text-sm text-foreground">
            <span className={cn(!legendAvailable && 'text-muted-foreground')}>Show legend on the image</span>
            <Switch
              checked={settings.legend && legendAvailable}
              disabled={!legendAvailable}
              onCheckedChange={(v) => set('legend', v)}
            />
          </label>
          {!legendAvailable && (
            <p className="text-[11px] text-muted-foreground">
              Nothing to explain with one colour and one facility type.
            </p>
          )}
        </ControlSection>

        <ControlSection label="PNG resolution">
          <div className="flex gap-2">
            {([1, 2] as const).map((s) => (
              <ToggleButton key={s} active={resolution === s} onClick={() => setResolution(s)}>
                {s}x
              </ToggleButton>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {opts.width * resolution} × {opts.height * resolution} PNG
          </p>
        </ControlSection>


        <div className="flex flex-col gap-2 lg:px-5 lg:pb-4 lg:pt-2">
          <Button onClick={handlePng} disabled={!ready || !!busy} className="w-full">
            {busy === 'png' ? <Loader2 className="animate-spin" /> : <Download />}
            {busy === 'png' ? 'Exporting…' : ready ? 'Download PNG' : 'Loading facilities…'}
          </Button>
          <Button onClick={handleSvg} disabled={!ready || !!busy} variant="outline" className="w-full">
            {busy === 'svg' ? <Loader2 className="animate-spin" /> : <Download />}
            {busy === 'svg' ? 'Exporting…' : 'Download SVG'}
          </Button>
          <p className="text-xs text-muted-foreground">
            File: <span className="font-medium text-foreground">{baseName}</span>
          </p>
          {svgNote?.for === dots && <p className="text-xs text-amber-700 dark:text-amber-300">{svgNote.text}</p>}
          {exportError && <p className="text-xs text-destructive">{exportError}</p>}
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            The country shape comes only from where the facilities are. SVG works in PowerPoint and Figma;
            Google Slides only takes the PNG.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {opts.colorMode === 'status' &&
            CONNECTIVITY_LEGEND.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <span
                  className={cn('h-2 w-2', layer === 'health' ? 'rounded-[1px]' : 'rounded-full')}
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
            ))}
          {layer === 'all' && (
            <span className="text-muted-foreground/80">Schools are dots, health centers are squares</span>
          )}
          {ready && loadedCount === 0 && (
            <span className="text-amber-700 dark:text-amber-300">No facilities mapped here yet</span>
          )}
        </div>

        <PreviewPanel
          dark={bg.dark}
          className="min-h-0"
          contentClassName="p-0"
          controls={<BackgroundToggle value={settings.background} onChange={(b) => set('background', b)} />}
        >
          <div
            className="relative mx-auto w-full overflow-hidden"
            style={{
              aspectRatio: `${opts.width} / ${opts.height}`,
              maxWidth: `calc(70vh * ${opts.width / opts.height})`,
              ...(bg.fill ? { background: bg.fill } : CHECKERBOARD),
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
            {loadState === 'loading' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white shadow-stripe backdrop-blur">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {scope === 'region' ? 'Loading live data for the whole region…' : 'Loading facility data…'}
                </span>
              </div>
            )}
            {loadState === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6 text-center">
                <p className="text-sm text-white">{loadError}</p>
              </div>
            )}
          </div>
        </PreviewPanel>

        <div className="flex items-start justify-between gap-3">
          <p className="select-all text-xs leading-relaxed text-muted-foreground">{sourceLine}</p>
          <button
            type="button"
            onClick={copySource}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CHECKERBOARD: React.CSSProperties = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'linear-gradient(45deg, #e9e9e9 25%, transparent 25%), linear-gradient(-45deg, #e9e9e9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e9e9e9 75%), linear-gradient(-45deg, transparent 75%, #e9e9e9 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
}

function clampSize(v: string) {
  const n = Math.round(Number(v))
  return Number.isFinite(n) && n > 0 ? Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, n)) : 1080
}

function LabeledSlider({
  value,
  min,
  max,
  step,
  onChange,
  format,
  label,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format: (v: number) => string
  label: string
}) {
  return (
    <div className="flex flex-col gap-2 py-1">
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
      <p className="text-[11px] text-muted-foreground">{format(value)}</p>
    </div>
  )
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatCount(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

/* Same look as the sub components in giga-map-generator.tsx (not exported there). */

function ControlSection({
  label,
  icon,
  children,
  className,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5 lg:px-5 lg:py-2.5', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {icon ? (
          <span className="flex items-center gap-1.5">
            {icon}
            {label}
          </span>
        ) : (
          label
        )}
      </span>
      {children}
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex-1 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition-smooth-transform active:scale-[0.98]',
        active
          ? 'border-chosen-border bg-chosen text-link'
          : 'border-border bg-card text-foreground hover:bg-secondary/60',
      )}
    >
      {children}
    </button>
  )
}
