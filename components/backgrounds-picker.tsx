'use client'

import { useEffect, useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Check, ChevronsUpDown, Globe, Sparkles, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GIGA_COUNTRIES, type GigaCountry } from '@/lib/giga-countries'
import { loadSvg, recolorSvg, svgToDataUrl } from '@/lib/svg-processing'

type PresetId = 'map-01' | 'map-02'
type Selection = PresetId | 'custom'

const CANVAS_W = 3840
const CANVAS_H = 2160

const PRESETS: Record<PresetId, { label: string; src: string; filename: string }> = {
  'map-01': {
    label: 'World map 01',
    src: '/backgrounds/map-01-dark.png',
    filename: 'giga-background_map-01-dark.png',
  },
  'map-02': {
    label: 'World map 02',
    src: '/backgrounds/map-02-dark.png',
    filename: 'giga-background_map-02-dark.png',
  },
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

async function ensureFontReady() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    // Le scritte di overlay usano Noto Sans, lo stesso font dell'email
    // signature: e' gia' caricato a livello di layout.tsx ma forziamo
    // l'attesa per evitare di disegnare con il fallback sans-serif.
    await Promise.all([
      document.fonts.load('400 64px "Noto Sans"'),
      document.fonts.load('600 64px "Noto Sans"'),
    ])
  } catch {
    // Continua comunque: il canvas usera' il fallback sans-serif del browser.
  }
}

async function composeBackground(mapBlob: Blob): Promise<Blob> {
  await ensureFontReady()

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')!

  // 1. Fondo nero
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // 2. Disegna lo screenshot della mappa in cover
  const mapUrl = URL.createObjectURL(mapBlob)
  try {
    const mapImg = await loadImage(mapUrl)
    const srcRatio = mapImg.width / mapImg.height
    const dstRatio = CANVAS_W / CANVAS_H
    let dw: number, dh: number, dx: number, dy: number
    if (srcRatio > dstRatio) {
      dh = CANVAS_H
      dw = dh * srcRatio
      dx = (CANVAS_W - dw) / 2
      dy = 0
    } else {
      dw = CANVAS_W
      dh = dw / srcRatio
      dx = 0
      dy = (CANVAS_H - dh) / 2
    }
    ctx.drawImage(mapImg, dx, dy, dw, dh)
  } finally {
    URL.revokeObjectURL(mapUrl)
  }

  // 3. Lockup Digital Impact Division (versione unboxed bianca, alto a sinistra)
  // L'SVG sorgente e' a tinta unita nera: lo ricoloriamo a bianco al volo per
  // restare in sync col logo "Unboxed" della pagina Logos senza dover mantenere
  // un secondo file statico.
  const lockupRaw = await loadSvg('/logos/unicef-digital-impact-unboxed.svg')
  const lockupWhite = recolorSvg(lockupRaw, '#ffffff')
  const lockup = await loadImage(svgToDataUrl(lockupWhite))
  const lockupH = 200
  const lockupW = lockupH * (lockup.width / lockup.height)
  ctx.drawImage(lockup, 120, 110, lockupW, lockupH)

  // 4. Tipografia overlay (bianca su fondo nero, Noto Sans come da brief)
  ctx.fillStyle = '#ffffff'

  // 4a. "Digital Inclusion" in alto a destra
  ctx.font = '400 64px "Noto Sans", sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('Digital Inclusion', CANVAS_W - 120, 130)

  // 4b. "For every child, digital inclusion" in basso a sinistra (su due righe)
  ctx.font = '400 64px "Noto Sans", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  const lineH = 80
  ctx.fillText('For every child,', 120, CANVAS_H - 130 - lineH)
  ctx.fillText('digital inclusion', 120, CANVAS_H - 130)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/png'
    )
  })
}

export function BackgroundsPicker() {
  const [selection, setSelection] = useState<Selection>('map-01')
  const [country, setCountry] = useState<GigaCountry>(
    GIGA_COUNTRIES.find((c) => c.code === 'br') ?? GIGA_COUNTRIES[0]
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customUrl, setCustomUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cleanup blob URL on unmount o quando ne genero uno nuovo.
  useEffect(() => {
    return () => {
      if (customUrl) URL.revokeObjectURL(customUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isCustom = selection === 'custom'

  const previewSrc = isCustom
    ? customUrl
    : PRESETS[selection as PresetId].src

  const customFilename = `giga-background_${country.code.toUpperCase()}_dark.png`

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        country: country.code,
        layer: 'live',
        theme: 'dark',
        scale: '2',
      })
      const res = await fetch(`/api/maps-screenshot?${params.toString()}`, {
        method: 'GET',
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed: ${res.status}`)
      }
      const mapBlob = await res.blob()
      const composed = await composeBackground(mapBlob)

      if (customUrl) URL.revokeObjectURL(customUrl)
      setCustomUrl(URL.createObjectURL(composed))
    } catch (err) {
      console.error('Background generation failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePresetDownload = () => {
    if (isCustom) return
    const preset = PRESETS[selection as PresetId]
    const a = document.createElement('a')
    a.href = preset.src
    a.download = preset.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCustomDownload = () => {
    if (!customUrl) return
    const a = document.createElement('a')
    a.href = customUrl
    a.download = customFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Selezione cambiata -> reset eventuali errori. Niente reset del blob:
  // se l'utente torna su "custom" deve poter rivedere l'ultimo generato.
  const handleSelectionChange = (v: string) => {
    setSelection(v as Selection)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        {/* Background selector */}
        <ControlSection
          label="Background"
          icon={<ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />}
          className="lg:pt-4 lg:pb-2.5"
        >
          <Select value={selection} onValueChange={handleSelectionChange}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="map-01">World map 01</SelectItem>
              <SelectItem value="map-02">World map 02</SelectItem>
              <SelectItem value="custom">Custom (by country)</SelectItem>
            </SelectContent>
          </Select>
        </ControlSection>

        {/* Country picker — solo per Custom */}
        {isCustom && (
          <ControlSection
            label="Country"
            icon={<Globe className="h-3.5 w-3.5 text-muted-foreground" />}
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
        )}

        {/* Action */}
        <div className="lg:px-5 lg:pb-4 lg:pt-2">
          {isCustom ? (
            <>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-12 w-full rounded-[6px] text-base font-medium shadow transition-smooth-transform active:scale-[0.98]"
                size="lg"
              >
                <Sparkles className="h-5 w-5 shrink-0" />
                {isGenerating ? 'Generating...' : 'Generate background'}
              </Button>
              {customUrl && !isGenerating && (
                <Button
                  onClick={handleCustomDownload}
                  variant="secondary"
                  className="mt-2 h-11 w-full rounded-[6px] text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </Button>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                File:{' '}
                <span className="font-medium text-foreground">{customFilename}</span>
              </p>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Generation takes about 10 to 15 seconds. Output is 3840 × 2160 PNG, dark theme.
              </p>
            </>
          ) : (
            <>
              <Button
                onClick={handlePresetDownload}
                className="h-12 w-full rounded-[6px] text-base font-medium shadow transition-smooth-transform active:scale-[0.98]"
                size="lg"
              >
                <Download className="h-5 w-5 shrink-0" />
                Download PNG
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                File:{' '}
                <span className="font-medium text-foreground">
                  {PRESETS[selection as PresetId].filename}
                </span>
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                3840 × 2160 PNG, dark theme — ready for Teams, Zoom, and Google Meet.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Preview panel */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <Card className="relative overflow-hidden rounded-lg border border-border">
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0a0a0a]">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={
                    isCustom
                      ? `Generated background for ${country.name}`
                      : PRESETS[selection as PresetId].label
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <Sparkles className="h-8 w-8 text-white/30" />
                  <p className="max-w-xs text-sm text-white/60">
                    Pick a country, then hit{' '}
                    <span className="font-medium">Generate background</span>.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
