'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Download, Check, ChevronsUpDown, Globe, Maximize2, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GIGA_COUNTRIES, type GigaCountry } from '@/lib/giga-countries'

type LayerMode = 'live' | 'static'
type Resolution = '1x' | '2x'

const RESOLUTIONS: { label: string; value: Resolution; scale: number }[] = [
  { label: '1x', value: '1x', scale: 1 },
  { label: '2x', value: '2x', scale: 2 },
]

function buildMapUrl(code: string, layer: LayerMode) {
  // Live mode: nessun layer hardcoded, cosi' GigaMaps usa il default per il
  // paese (in genere layer 10, dati aggiornati globalmente). Vedi il
  // commento esteso in app/api/maps-screenshot/route.ts.
  if (layer === 'static') {
    return `https://maps.giga.global/map/country/${code}?layer=null&status=10001`
  }
  return `https://maps.giga.global/map/country/${code}?status=10001`
}

export function MapsScreenshotGenerator() {
  const [country, setCountry] = useState<GigaCountry>(
    GIGA_COUNTRIES.find((c) => c.code === 'br') ?? GIGA_COUNTRIES[0]
  )
  const [layer, setLayer] = useState<LayerMode>('live')
  const [resolution, setResolution] = useState<Resolution>('2x')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const mapUrl = useMemo(() => buildMapUrl(country.code, layer), [country, layer])

  const previewFilename = `giga-maps_${country.code.toUpperCase()}_${layer}_${resolution}.png`

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      const scale = RESOLUTIONS.find((r) => r.value === resolution)?.scale ?? 2
      const params = new URLSearchParams({
        country: country.code,
        layer,
        scale: String(scale),
      })
      const res = await fetch(`/api/maps-screenshot?${params.toString()}`, {
        method: 'GET',
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed: ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = previewFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Maps screenshot export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        {/* Country picker */}
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
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-smooth-transform hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded bg-muted px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {country.code}
                  </span>
                  <span className="truncate text-foreground">{country.name}</span>
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {GIGA_COUNTRIES.map((c) => (
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
                          className={cn(
                            'ml-2 h-4 w-4',
                            country.code === c.code ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </ControlSection>

        {/* Layer */}
        <ControlSection label="Data layer">
          <div className="flex flex-col gap-2">
            <OptionCard
              active={layer === 'live'}
              onClick={() => setLayer('live')}
              label="Live data"
              description="Color coded dots by connectivity status"
            />
            <OptionCard
              active={layer === 'static'}
              onClick={() => setLayer('static')}
              label="Static map"
              description="Country outline without live status dots"
            />
          </div>
        </ControlSection>

        {/* Resolution */}
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
        </ControlSection>

        {/* Download */}
        <div className="lg:px-5 lg:pb-4 lg:pt-2">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="h-12 w-full rounded-[6px] text-base font-medium shadow transition-smooth-transform active:scale-[0.98]"
            size="lg"
          >
            <Download className="h-5 w-5 shrink-0" />
            {isExporting ? 'Generating...' : 'Download Screenshot'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            File:{' '}
            <span className="font-medium text-foreground">{previewFilename}</span>
          </p>
          {exportError && (
            <p className="mt-2 text-xs text-destructive">{exportError}</p>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Generation takes about 8 to 10 seconds. Dark theme only.
          </p>
        </div>
      </div>

      {/* Preview panel */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-2xl font-medium text-foreground">
            Live Preview
          </h3>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Open on maps.giga.global
          </a>
        </div>

        {/* Banner che chiarisce la differenza tra preview live e PNG scaricato */}
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold">Preview shows the full GigaMaps UI for navigation.</span>{' '}
            The downloaded PNG is auto cleaned: no sidebar, no controls, no
            tooltips, just the map and the school dots.
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-lg border border-[#393939] bg-[#161616]">
          <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow backdrop-blur">
            <EyeOff className="h-3 w-3" aria-hidden />
            UI removed in download
          </span>
          <CardContent className="p-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <iframe
                key={mapUrl}
                src={mapUrl}
                title={`Giga Maps preview for ${country.name}`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-xs leading-relaxed text-muted-foreground">
          The preview is the real interactive GigaMaps so you can navigate. When
          you click Download, the server takes a fresh screenshot with every UI
          element hidden, then waits for all school dots to render.
        </p>
      </div>
    </div>
  )
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
  className = '',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-[6px] border px-4 py-2.5 text-sm font-medium transition-smooth-transform hover:shadow-md active:scale-[0.98] ${
        active
          ? 'border-primary bg-primary text-primary-foreground shadow'
          : 'border-border bg-card text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  )
}

function OptionCard({
  active,
  onClick,
  label,
  description,
}: {
  active: boolean
  onClick: () => void
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start rounded-[6px] border px-4 py-3 text-left transition-smooth-transform hover:shadow-md active:scale-[0.99] ${
        active
          ? 'border-primary bg-accent text-foreground shadow'
          : 'border-border bg-card text-foreground'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  )
}
