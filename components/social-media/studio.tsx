'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Globe, Hash, Info, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GIGA_COUNTRIES, type GigaCountry } from '@/lib/giga-countries'
import { CountryAnnouncementTemplate } from './country-announcement-template'
import { CountryPicker, alpha2ToFlagEmoji } from './country-picker'
import {
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH,
  downloadBlob,
  exportTemplateToPng,
} from '@/lib/social-media/export'
import {
  buildExportFilename,
  formatMonthYear,
  formatOrdinal,
} from '@/lib/social-media/format'
import { getDisplayCountryName } from '@/lib/social-media/display-names'

const TAGLINE_PRESETS = [
  { id: 'growing', label: 'Giga is growing', value: 'Giga is growing' },
  { id: 'on-tour', label: 'Giga is on tour', value: 'Giga is on tour' },
  { id: 'custom', label: 'Custom…', value: '' },
] as const

type TaglinePresetId = (typeof TAGLINE_PRESETS)[number]['id']

const DEFAULT_COUNTRY = GIGA_COUNTRIES.find((c) => c.code === 'gm') ?? GIGA_COUNTRIES[0]

export function SocialMediaStudio() {
  const [country, setCountry] = useState<GigaCountry>(DEFAULT_COUNTRY)
  const [taglinePreset, setTaglinePreset] = useState<TaglinePresetId>('growing')
  const [taglineCustom, setTaglineCustom] = useState('Giga is growing')

  // Data automatica: sempre mese/anno correnti, non editabile.
  const today = useMemo(() => new Date(), [])
  const formattedDate = useMemo(() => formatMonthYear(today), [today])

  const [engagedNumber, setEngagedNumber] = useState(51)

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const templateRef = useRef<HTMLDivElement | null>(null)
  const previewWrapperRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(0.5)

  // Calcola scala del template in base allo spazio disponibile (larghezza + altezza viewport).
  useEffect(() => {
    const el = previewWrapperRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      const h = window.innerHeight - 200
      const next = Math.min(w / TEMPLATE_WIDTH, h / TEMPLATE_HEIGHT, 1)
      setScale(Math.max(next, 0.1))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const tagline = useMemo(() => {
    const preset = TAGLINE_PRESETS.find((p) => p.id === taglinePreset)
    if (!preset || preset.id === 'custom') return taglineCustom
    return preset.value
  }, [taglinePreset, taglineCustom])

  const subtitle = useMemo(
    () => `as our ${formatOrdinal(engagedNumber)} engaged country`,
    [engagedNumber]
  )

  const flagEmoji = useMemo(() => alpha2ToFlagEmoji(country.code), [country.code])
  const displayName = useMemo(
    () => getDisplayCountryName(country.code, country.name),
    [country.code, country.name]
  )
  const filename = useMemo(
    () => buildExportFilename(displayName, today),
    [displayName, today]
  )

  const handleDownload = async () => {
    const node = templateRef.current
    if (!node) return
    setIsExporting(true)
    setExportError(null)
    try {
      const blob = await exportTemplateToPng(node)
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('Social media export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        <ControlSection
          label="Country"
          icon={<Globe className="h-3.5 w-3.5 text-muted-foreground" />}
          className="lg:pt-4 lg:pb-2.5"
        >
          <CountryPicker value={country} onChange={setCountry} />
        </ControlSection>

        <ControlSection
          label="Tagline"
          icon={<Type className="h-3.5 w-3.5 text-muted-foreground" />}
        >
          <div className="flex flex-col gap-2">
            {TAGLINE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setTaglinePreset(preset.id)
                  if (preset.id !== 'custom') setTaglineCustom(preset.value)
                }}
                className={cn(
                  'flex items-center justify-between rounded-[6px] border px-3 py-2 text-left text-sm font-medium transition-smooth-transform hover:shadow-md active:scale-[0.99]',
                  taglinePreset === preset.id
                    ? 'border-primary bg-accent text-foreground shadow'
                    : 'border-border bg-card text-foreground'
                )}
              >
                <span>{preset.label}</span>
              </button>
            ))}
            {taglinePreset === 'custom' && (
              <Input
                value={taglineCustom}
                onChange={(e) => setTaglineCustom(e.target.value)}
                placeholder="Type custom tagline"
                className="mt-1"
              />
            )}
          </div>
        </ControlSection>

        <ControlSection
          label="Engaged country number"
          icon={<Hash className="h-3.5 w-3.5 text-muted-foreground" />}
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-muted-foreground">as our</span>
            <Input
              type="number"
              min={1}
              max={999}
              value={engagedNumber}
              onChange={(e) => setEngagedNumber(Math.max(1, Number(e.target.value) || 1))}
              className="h-9 w-20"
            />
            <span className="text-xs text-muted-foreground">engaged country</span>
          </div>
        </ControlSection>

        <div className="lg:px-5 lg:pb-4 lg:pt-2">
          <Button
            onClick={handleDownload}
            disabled={isExporting}
            className="h-12 w-full rounded-[6px] text-base font-medium shadow transition-smooth-transform active:scale-[0.98]"
            size="lg"
          >
            <Download className="h-5 w-5 shrink-0" />
            {isExporting ? 'Generating…' : 'Download PNG'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            File: <span className="font-medium text-foreground">{filename}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Date: <span className="font-medium text-foreground">{formattedDate}</span>
            <span className="ml-1 text-muted-foreground/70">(auto)</span>
          </p>
          {exportError && <p className="mt-2 text-xs text-destructive">{exportError}</p>}
          <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Flag rendering depends on your operating system. On Windows the glyph may differ.</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-2xl font-medium text-foreground">Live Preview</h3>
          <span className="text-xs font-medium text-muted-foreground">
            {TEMPLATE_WIDTH} × {TEMPLATE_HEIGHT}
          </span>
        </div>

        <div
          ref={previewWrapperRef}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-grey-100/40"
          style={{ height: TEMPLATE_HEIGHT * scale }}
        >
          <div
            style={{
              width: TEMPLATE_WIDTH * scale,
              height: TEMPLATE_HEIGHT * scale,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: TEMPLATE_WIDTH,
                height: TEMPLATE_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <CountryAnnouncementTemplate
                ref={templateRef}
                alpha2={country.code}
                countryName={displayName}
                flagEmoji={flagEmoji}
                tagline={tagline}
                date={formattedDate}
                subtitle={subtitle}
              />
            </div>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          The preview is rendered at native 1080×1350 and downscaled for your screen. The downloaded PNG is the full-resolution capture.
        </p>
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
