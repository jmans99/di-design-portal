'use client'

import { useMemo, useRef, useState } from 'react'
import { Download, Globe, Hash, Info, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GIGA_COUNTRIES, type GigaCountry } from '@/lib/giga-countries'
import { ControlSection, StudioLayout } from '@/components/studio/studio-layout'
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
  { id: 'growing', label: 'Digital Inclusion is growing', value: 'Digital Inclusion is growing' },
  { id: 'on-tour', label: 'Digital Inclusion is on tour', value: 'Digital Inclusion is on tour' },
  { id: 'custom', label: 'Custom…', value: '' },
] as const

type TaglinePresetId = (typeof TAGLINE_PRESETS)[number]['id']

const DEFAULT_COUNTRY = GIGA_COUNTRIES.find((c) => c.code === 'gm') ?? GIGA_COUNTRIES[0]

export function SocialMediaStudio() {
  const [country, setCountry] = useState<GigaCountry>(DEFAULT_COUNTRY)
  const [taglinePreset, setTaglinePreset] = useState<TaglinePresetId>('growing')
  const [taglineCustom, setTaglineCustom] = useState('Digital Inclusion is growing')

  const today = useMemo(() => new Date(), [])
  const formattedDate = useMemo(() => formatMonthYear(today), [today])

  const [engagedNumber, setEngagedNumber] = useState(51)

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const templateRef = useRef<HTMLDivElement | null>(null)

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
    setExportError(null)
    setIsExporting(true)
    try {
      const node = templateRef.current
      if (!node) throw new Error('Post template not mounted')
      const blob = await exportTemplateToPng(node)
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('Export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsExporting(false)
    }
  }

  const sidebar = (
    <>
      <ControlSection
        label="Country"
        icon={<Globe className="h-3.5 w-3.5 text-muted-foreground" />}
        className="lg:pt-4"
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

      <div className="lg:px-5 lg:pb-4 lg:pt-2">
        <Button onClick={handleDownload} disabled={isExporting} className="w-full">
          <Download className="shrink-0" />
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
    </>
  )

  return (
    <StudioLayout
      previewWidth={TEMPLATE_WIDTH}
      previewHeight={TEMPLATE_HEIGHT}
      sidebar={sidebar}
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
    </StudioLayout>
  )
}
