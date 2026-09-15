'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { PreviewPanel, PreviewThemeToggle } from '@/components/ui/preview-panel'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Download, Check, ChevronsUpDown, Globe, Maximize2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CONNECTIVITY_LEGEND,
  DATA_LAYERS,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  type DataLayer,
  type GigaMapCountry,
  type MapTheme,
} from '@/lib/giga-maps/config'
import {
  createGigaMap,
  exportGigaMapPng,
  fetchGigaMapCountries,
  waitForIdle,
} from '@/lib/giga-maps/render'

type Resolution = '1x' | '2x'
type RenderState = 'loading' | 'ready' | 'error'

const RESOLUTIONS: { label: string; value: Resolution; scale: 1 | 2 }[] = [
  { label: '1x', value: '1x', scale: 1 },
  { label: '2x', value: '2x', scale: 2 },
]

export function GigaMapGenerator() {
  const [countries, setCountries] = useState<GigaMapCountry[]>([])
  const [countriesError, setCountriesError] = useState<string | null>(null)
  const [country, setCountry] = useState<GigaMapCountry | null>(null)
  const [layer, setLayer] = useState<DataLayer>('school')
  const [theme, setTheme] = useState<MapTheme>('dark')
  const [resolution, setResolution] = useState<Resolution>('2x')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [renderState, setRenderState] = useState<RenderState>('loading')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const stageRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [stageScale, setStageScale] = useState(0.5)

  // Country list from the Giga backend (only countries with a bounding box).
  useEffect(() => {
    let cancelled = false
    fetchGigaMapCountries()
      .then((list) => {
        if (cancelled) return
        setCountries(list)
        setCountry(list.find((c) => c.code === 'br') ?? list[0] ?? null)
      })
      .catch((err) => {
        if (!cancelled) setCountriesError(err instanceof Error ? err.message : 'Could not load countries')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Keep the native 1920x1080 stage scaled to the panel width.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const update = () => setStageScale(el.clientWidth / STAGE_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // (Re)create the map whenever country, theme or data layer changes. A fresh
  // instance per change is simpler and cheap: the basemap style is cached by
  // the browser and country tiles are what actually take time.
  useEffect(() => {
    const host = stageRef.current
    if (!host || !country) return
    let cancelled = false
    setRenderState('loading')
    setRenderError(null)

    createGigaMap({ container: host, country, theme, layer })
      .then(async (map) => {
        if (cancelled) {
          map.remove()
          return
        }
        mapRef.current = map
        await waitForIdle(map)
        if (!cancelled) setRenderState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setRenderState('error')
        setRenderError(err instanceof Error ? err.message : 'Map failed to render')
      })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [country, theme, layer])

  const filename = useMemo(() => {
    if (!country) return ''
    return `giga-maps_${country.code.toUpperCase()}_${DATA_LAYERS[layer].fileTag}_${theme}_${resolution}.png`
  }, [country, layer, theme, resolution])

  const handleExport = useCallback(async () => {
    const map = mapRef.current
    if (!map || renderState !== 'ready') return
    setIsExporting(true)
    setExportError(null)
    try {
      const scale = RESOLUTIONS.find((r) => r.value === resolution)?.scale ?? 2
      const blob = await exportGigaMapPng(map, scale)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Giga map export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsExporting(false)
    }
  }, [filename, renderState, resolution])

  const legend = CONNECTIVITY_LEGEND
  const noHealthData = !!country && layer !== 'school' && country.healthTotal === 0
  const noSchoolData = !!country && layer !== 'health' && country.schoolsTotal === 0

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        <ControlSection
          label="Country"
          icon={<Globe className="h-3.5 w-3.5 text-muted-foreground" />}
          className="lg:pt-4 lg:pb-2.5"
        >
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={pickerOpen}
                disabled={!country}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-smooth-transform focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {country?.code ?? '…'}
                  </span>
                  <span className="truncate text-foreground">
                    {country?.name ?? (countriesError ? 'Unavailable' : 'Loading countries…')}
                  </span>
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((c) => (
                      <CommandItem
                        key={c.code}
                        value={`${c.name} ${c.code}`}
                        onSelect={() => {
                          setCountry(c)
                          setPickerOpen(false)
                        }}
                      >
                        <span className="mr-2 inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {c.code}
                        </span>
                        <span className="flex-1 truncate">{c.name}</span>
                        <Check
                          className={cn('ml-2 h-4 w-4', country?.code === c.code ? 'opacity-100' : 'opacity-0')}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {countriesError && <p className="text-xs text-destructive">{countriesError}</p>}
        </ControlSection>

        <ControlSection label="Facilities">
          <div className="flex flex-col gap-2">
            {(Object.keys(DATA_LAYERS) as DataLayer[]).map((key) => (
              <ToggleButton key={key} active={layer === key} onClick={() => setLayer(key)}>
                {DATA_LAYERS[key].label}
              </ToggleButton>
            ))}
          </div>
          {country && (
            <p className="text-[11px] text-muted-foreground">
              {formatCount(country.schoolsTotal)} schools · {formatCount(country.healthTotal)} health
              centers mapped
            </p>
          )}
        </ControlSection>

        <ControlSection
          label="Resolution"
          icon={<Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />}
        >
          <div className="flex gap-2">
            {RESOLUTIONS.map((res) => (
              <ToggleButton
                key={res.value}
                active={resolution === res.value}
                onClick={() => setResolution(res.value)}
              >
                {res.label}
              </ToggleButton>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {resolution === '2x' ? '3840 × 2160' : '1920 × 1080'} PNG
          </p>
        </ControlSection>

        <div className="lg:px-5 lg:pb-4 lg:pt-2">
          <Button
            onClick={handleExport}
            disabled={isExporting || renderState !== 'ready'}
            className="w-full"
          >
            {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
            {isExporting
              ? 'Exporting…'
              : renderState === 'loading'
                ? 'Rendering map…'
                : 'Download PNG'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            File: <span className="font-medium text-foreground">{filename}</span>
          </p>
          {exportError && <p className="mt-2 text-xs text-destructive">{exportError}</p>}
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Rendered in your browser from live Giga Maps facility data. The
            download matches the preview exactly.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {legend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
            {layer === 'all' && (
              <span className="text-muted-foreground/80">Schools are dots, health centers are squares</span>
            )}
            {(noHealthData || noSchoolData) && (
              <span className="text-amber-700 dark:text-amber-300">
                {noHealthData && noSchoolData
                  ? 'No facilities mapped for this country yet'
                  : noHealthData
                    ? 'No health centers mapped for this country yet'
                    : 'No schools mapped for this country yet'}
              </span>
            )}
          </div>
          {country && (
            <a
              href={`https://maps.giga.global/map/country/${country.code}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-muted-foreground transition-smooth hover:text-foreground"
            >
              Open on maps.giga.global
            </a>
          )}
        </div>

        <PreviewPanel
          dark={theme === 'dark'}
          className="min-h-0"
          contentClassName="p-0"
          controls={<PreviewThemeToggle value={theme} onChange={setTheme} />}
        >
          <div
            ref={wrapperRef}
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: `${STAGE_WIDTH} / ${STAGE_HEIGHT}` }}
          >
            <div
              ref={stageRef}
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                transform: `scale(${stageScale})`,
              }}
            />
            {renderState === 'loading' && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white shadow-stripe backdrop-blur">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading school data…
                </span>
              </div>
            )}
            {renderState === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6 text-center">
                <p className="text-sm text-white">{renderError}</p>
              </div>
            )}
          </div>
        </PreviewPanel>

        <p className="text-xs leading-relaxed text-muted-foreground">
          The preview is rendered at native 1920×1080 and downscaled for your
          screen. Basemap © OpenMapTiles © OpenStreetMap contributors, facility
          data from Giga.
        </p>
      </div>
    </div>
  )
}

function formatCount(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

/* ------------------------------------------------------------------ */
/*  Shared sub components mirroring logo-generator styling             */
/* ------------------------------------------------------------------ */

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
      <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {icon ? (
          <span className="flex items-center gap-1.5">
            {icon}
            {label}
          </span>
        ) : (
          label
        )}
      </label>
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
      className={cn(
        'flex-1 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition-smooth-transform active:scale-[0.98]',
        active
          ? 'border-primary-300 bg-primary-50 text-primary-700'
          : 'border-border bg-card text-foreground hover:bg-secondary/60'
      )}
    >
      {children}
    </button>
  )
}
