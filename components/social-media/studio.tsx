'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PreviewPanel } from '@/components/ui/preview-panel'
import {
  Download,
  ExternalLink,
  Globe,
  Hash,
  Image as ImageIcon,
  Info,
  Layers,
  Map as MapIcon,
  RefreshCw,
  Type,
} from 'lucide-react'
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
import { EngagementMapTemplate, type EngagementMapCountry } from '@/components/engagement-map/engagement-map-template'
import {
  ENGAGEMENT_MAP_HEIGHT,
  ENGAGEMENT_MAP_WIDTH,
  buildEngagementMapFilename,
  exportEngagementMapToPng,
} from '@/lib/engagement-map/export'

const CONTENT_TYPES = [
  { id: 'post', label: 'Engagement post', icon: ImageIcon },
  { id: 'map', label: 'Engagement map', icon: MapIcon },
] as const

type ContentTypeId = (typeof CONTENT_TYPES)[number]['id']

const TAGLINE_PRESETS = [
  { id: 'growing', label: 'Giga is growing', value: 'Giga is growing' },
  { id: 'on-tour', label: 'Giga is on tour', value: 'Giga is on tour' },
  { id: 'custom', label: 'Custom…', value: '' },
] as const

type TaglinePresetId = (typeof TAGLINE_PRESETS)[number]['id']

const DEFAULT_COUNTRY = GIGA_COUNTRIES.find((c) => c.code === 'gm') ?? GIGA_COUNTRIES[0]

type EngagementApiResponse = {
  engaged: EngagementMapCountry[]
  earlyInterest: EngagementMapCountry[]
  unresolved: string[]
  fetchedAt: string
  sourceUrl: string
}

export function SocialMediaStudio() {
  const [contentType, setContentType] = useState<ContentTypeId>('post')

  const [country, setCountry] = useState<GigaCountry>(DEFAULT_COUNTRY)
  const [taglinePreset, setTaglinePreset] = useState<TaglinePresetId>('growing')
  const [taglineCustom, setTaglineCustom] = useState('Giga is growing')

  const today = useMemo(() => new Date(), [])
  const formattedDate = useMemo(() => formatMonthYear(today), [today])

  const [engagedNumber, setEngagedNumber] = useState(51)

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Engagement map state
  const [mapData, setMapData] = useState<EngagementApiResponse | null>(null)
  const [mapLoading, setMapLoading] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const postTemplateRef = useRef<HTMLDivElement | null>(null)
  const mapTemplateRef = useRef<HTMLDivElement | null>(null)
  const previewWrapperRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(0.5)

  const previewWidth = contentType === 'map' ? ENGAGEMENT_MAP_WIDTH : TEMPLATE_WIDTH
  const previewHeight = contentType === 'map' ? ENGAGEMENT_MAP_HEIGHT : TEMPLATE_HEIGHT

  useEffect(() => {
    const el = previewWrapperRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      const h = window.innerHeight - 200
      const next = Math.min(w / previewWidth, h / previewHeight, 1)
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
  }, [previewWidth, previewHeight])

  const mapDataRef = useRef<EngagementApiResponse | null>(null)

  const loadMapData = useCallback(async (force = false) => {
    setMapLoading(true)
    setMapError(null)
    try {
      const res = await fetch(
        force ? '/api/engagement-data?refresh=1' : '/api/engagement-data',
        force ? { cache: 'no-store' } : undefined
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const data = (await res.json()) as EngagementApiResponse
      mapDataRef.current = data
      setMapData(data)
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setMapLoading(false)
    }
  }, [])

  // Fetch engagement data the first time we enter map mode.
  useEffect(() => {
    if (contentType !== 'map') return
    if (mapDataRef.current) return
    void loadMapData(false)
  }, [contentType, loadMapData])

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
  const postFilename = useMemo(
    () => buildExportFilename(displayName, today),
    [displayName, today]
  )
  const mapFilename = useMemo(() => buildEngagementMapFilename(today), [today])
  const currentFilename = contentType === 'map' ? mapFilename : postFilename

  const handleDownload = async () => {
    setExportError(null)
    setIsExporting(true)
    try {
      if (contentType === 'map') {
        const node = mapTemplateRef.current
        if (!node) throw new Error('Map template not mounted')
        if (!mapData) throw new Error('Engagement data not loaded yet')
        const blob = await exportEngagementMapToPng(node)
        downloadBlob(blob, mapFilename)
      } else {
        const node = postTemplateRef.current
        if (!node) throw new Error('Post template not mounted')
        const blob = await exportTemplateToPng(node)
        downloadBlob(blob, postFilename)
      }
    } catch (err) {
      console.error('Export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadDisabled =
    isExporting || (contentType === 'map' && (mapLoading || !mapData))

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        <ControlSection
          label="Content type"
          icon={<Layers className="h-3.5 w-3.5 text-muted-foreground" />}
          className="lg:pt-4 lg:pb-2.5"
        >
          <div className="flex flex-col gap-2">
            {CONTENT_TYPES.map((opt) => {
              const Icon = opt.icon
              const active = contentType === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setContentType(opt.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-medium transition-smooth-transform active:scale-[0.99]',
                    active
                      ? 'border-primary-300 bg-primary-50/70 text-foreground'
                      : 'border-border bg-card text-foreground hover:bg-secondary/60'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </ControlSection>

        {contentType === 'post' ? (
          <>
            <ControlSection
              label="Country"
              icon={<Globe className="h-3.5 w-3.5 text-muted-foreground" />}
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
                      'flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm font-medium transition-smooth-transform active:scale-[0.99]',
                      taglinePreset === preset.id
                        ? 'border-primary-300 bg-primary-50/70 text-foreground'
                        : 'border-border bg-card text-foreground hover:bg-secondary/60'
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
          </>
        ) : (
          <ControlSection
            label="Data source"
            icon={<Info className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              {mapLoading && !mapData && <span>Loading data from SharePoint…</span>}
              {mapError && (
                <span className="text-destructive">Error: {mapError}</span>
              )}
              {mapData && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Engaged</span>
                    <span className="font-medium text-foreground">
                      {mapData.engaged.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Early interest</span>
                    <span className="font-medium text-foreground">
                      {mapData.earlyInterest.length}
                    </span>
                  </div>
                  {mapData.unresolved.length > 0 && (
                    <div className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                      Unresolved names: {mapData.unresolved.join(', ')}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-muted-foreground/80">
                    Synced {new Date(mapData.fetchedAt).toLocaleTimeString()}
                  </div>
                  {mapData.sourceUrl && (
                    <a
                      href={mapData.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      Open source file (Excel)
                    </a>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => loadMapData(true)}
                disabled={mapLoading}
                className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 shrink-0 ${mapLoading ? 'animate-spin' : ''}`}
                />
                {mapLoading ? 'Refreshing…' : 'Refresh data'}
              </button>
            </div>
          </ControlSection>
        )}

        <div className="lg:px-5 lg:pb-4 lg:pt-2">
          <Button
            onClick={handleDownload}
            disabled={downloadDisabled}
            className="w-full"
          >
            <Download className="shrink-0" />
            {isExporting ? 'Generating…' : 'Download PNG'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            File: <span className="font-medium text-foreground">{currentFilename}</span>
          </p>
          {contentType === 'post' && (
            <p className="mt-1 text-xs text-muted-foreground">
              Date: <span className="font-medium text-foreground">{formattedDate}</span>
              <span className="ml-1 text-muted-foreground/70">(auto)</span>
            </p>
          )}
          {exportError && <p className="mt-2 text-xs text-destructive">{exportError}</p>}
          {contentType === 'post' && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Flag rendering depends on your operating system. On Windows the glyph may differ.</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <div className="flex items-center justify-end">
          <span className="text-xs font-medium text-muted-foreground">
            {previewWidth} × {previewHeight}
          </span>
        </div>

        <PreviewPanel className="min-h-0" contentClassName="p-4">
          <div
            ref={previewWrapperRef}
            className="relative flex w-full items-center justify-center overflow-hidden"
            style={{ height: previewHeight * scale }}
          >
            <div
              style={{
                width: previewWidth * scale,
                height: previewHeight * scale,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: previewWidth,
                  height: previewHeight,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {contentType === 'map' ? (
                  <EngagementMapTemplate
                    ref={mapTemplateRef}
                    engaged={mapData?.engaged ?? []}
                    earlyInterest={mapData?.earlyInterest ?? []}
                  />
                ) : (
                  <CountryAnnouncementTemplate
                    ref={postTemplateRef}
                    alpha2={country.code}
                    countryName={displayName}
                    flagEmoji={flagEmoji}
                    tagline={tagline}
                    date={formattedDate}
                    subtitle={subtitle}
                  />
                )}
              </div>
            </div>
          </div>
        </PreviewPanel>

        <p className="text-xs leading-relaxed text-muted-foreground">
          The preview is rendered at native {previewWidth}×{previewHeight} and downscaled for your screen. The downloaded PNG is the full-resolution capture.
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
