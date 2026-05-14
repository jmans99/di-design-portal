'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ILLUSTRATIONS,
  ILLUSTRATION_CATEGORY_LABELS,
  hasStyleVariants,
  resolveIllustrationPath,
  generateIllustrationFilename,
} from '@/lib/illustration-registry'
import type {
  IllustrationCategory,
  IllustrationStyle,
  OutlineColor,
} from '@/lib/illustration-registry'
import {
  loadSvg,
  svgToDataUrl,
  exportAsRaster,
  downloadBlob,
  downloadSvg,
} from '@/lib/svg-processing'
import type { OutputFormat, Resolution } from '@/lib/types'
import { Download, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESOLUTIONS: { label: string; value: Resolution; scale: number }[] = [
  { label: '1x', value: '1x', scale: 1 },
  { label: '2x', value: '2x', scale: 2 },
  { label: '4x', value: '4x', scale: 4 },
]

export function IllustrationConfigurator() {
  const [selectedId, setSelectedId] = useState<string>('mapping')
  const [style, setStyle] = useState<IllustrationStyle>('fill')
  const [outlineColor, setOutlineColor] = useState<OutlineColor>('blue')

  const illustration = ILLUSTRATIONS.find((a) => a.id === selectedId)!
  const supportsVariants = hasStyleVariants(illustration)
  const effectiveStyle: IllustrationStyle = supportsVariants ? style : 'fill'

  // Raggruppo le opzioni del Select per categoria (pillars / giga-meter)
  const grouped = (Object.keys(ILLUSTRATION_CATEGORY_LABELS) as IllustrationCategory[])
    .map((cat) => ({
      category: cat,
      label: ILLUSTRATION_CATEGORY_LABELS[cat],
      items: ILLUSTRATIONS.filter((a) => a.category === cat),
    }))
    .filter((g) => g.items.length > 0)
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('svg')
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('2x')
  const [previewSvg, setPreviewSvg] = useState<string>('')
  const [previewBg, setPreviewBg] = useState<'light' | 'dark'>('light')
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const generatePreview = useCallback(async () => {
    setIsLoading(true)
    try {
      const path = resolveIllustrationPath(
        selectedId,
        effectiveStyle,
        effectiveStyle === 'outline' ? outlineColor : undefined
      )
      const rawSvg = await loadSvg(path)
      setPreviewSvg(rawSvg)
    } catch (err) {
      console.error('Failed to generate preview:', err)
      setPreviewSvg('')
    } finally {
      setIsLoading(false)
    }
  }, [selectedId, effectiveStyle, outlineColor])

  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  // Quando cambia illustrazione o stile, l'outline color riparte da Blue.
  // L'utente puo' comunque cliccare White durante la stessa selezione, ma
  // ogni nuova icona / ogni passaggio Fill -> Outline torna a Blue come
  // default — coerente col brief ("blu come preset per le icone general").
  useEffect(() => {
    setOutlineColor('blue')
  }, [selectedId, style])

  const handleExport = async () => {
    if (!previewSvg) return
    setIsExporting(true)
    try {
      const filename = generateIllustrationFilename(
        selectedId,
        effectiveStyle,
        effectiveStyle === 'outline' ? outlineColor : undefined,
        selectedFormat,
        selectedFormat !== 'svg' ? selectedResolution : undefined
      )
      if (selectedFormat === 'svg') {
        downloadSvg(previewSvg, filename)
      } else {
        const scale =
          RESOLUTIONS.find((r) => r.value === selectedResolution)?.scale ?? 1
        const blob = await exportAsRaster(previewSvg, selectedFormat, scale)
        downloadBlob(blob, filename)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const isRaster = selectedFormat === 'png' || selectedFormat === 'jpeg'
  const previewFilename = generateIllustrationFilename(
    selectedId,
    effectiveStyle,
    effectiveStyle === 'outline' ? outlineColor : undefined,
    selectedFormat,
    isRaster ? selectedResolution : undefined
  )

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar — below preview on mobile */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        <ControlSection label="Illustration">
          <Select value={selectedId} onValueChange={(v) => setSelectedId(v)}>
            <SelectTrigger className="rounded-md transition-smooth-transform">
              <SelectValue placeholder="Choose an illustration" />
            </SelectTrigger>
            <SelectContent>
              {grouped.map((group) => (
                <SelectGroup key={group.category}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.items.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </ControlSection>

        {supportsVariants && (<>
        <ControlSection label="Style" className="lg:!border-t-0 lg:pt-3">
          <div className="flex gap-2">
            {(
              [
                { value: 'fill' as const, label: 'Fill' },
                { value: 'outline' as const, label: 'Outline' },
              ] as const
            ).map((opt) => (
              <ToggleButton
                key={opt.value}
                active={style === opt.value}
                onClick={() => setStyle(opt.value)}
              >
                {opt.label}
              </ToggleButton>
            ))}
          </div>
        </ControlSection>

        {style === 'outline' && (
          <ControlSection label="Color" className="lg:!border-t-0 lg:pt-3">
            <div className="flex flex-col gap-2">
              {(
                [
                  { value: 'white' as const, label: 'White', description: 'Monochrome white', hex: '#FFFFFF' },
                  { value: 'blue' as const, label: 'Blue', description: 'Monochrome blue', hex: '#277aff' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOutlineColor(opt.value)}
                  className={`flex items-center gap-3 rounded-[6px] border px-4 py-3 text-left text-sm font-medium transition-smooth-transform hover:shadow-md active:scale-[0.99] ${
                    outlineColor === opt.value
                      ? 'border-primary bg-accent text-foreground shadow'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  <span className="flex shrink-0 items-center gap-0.5">
                    <span
                      className="inline-block h-5 w-5 rounded-[2px] border border-border"
                      style={{ backgroundColor: opt.hex }}
                    />
                  </span>
                  <span className="flex flex-col items-start">
                    <span>{opt.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {opt.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </ControlSection>
        )}
        </>)}

        <ControlSection label="Format" className="lg:!border-t-0 lg:pt-3">
          <div className="flex gap-2">
            {(['svg', 'png', 'jpeg'] as OutputFormat[]).map((fmt) => (
              <ToggleButton
                key={fmt}
                active={selectedFormat === fmt}
                onClick={() => setSelectedFormat(fmt)}
                className="uppercase"
              >
                {fmt}
              </ToggleButton>
            ))}
          </div>
        </ControlSection>

        {isRaster && (
          <ControlSection label="Resolution" className="lg:!border-t-0 lg:pt-3">
            <div className="flex gap-2">
              {RESOLUTIONS.map((res) => (
                <ToggleButton
                  key={res.value}
                  active={selectedResolution === res.value}
                  onClick={() => setSelectedResolution(res.value)}
                >
                  {res.label}
                </ToggleButton>
              ))}
            </div>
          </ControlSection>
        )}

        <div className="lg:!border-t-0 lg:px-5 lg:pb-5 lg:pt-3">
          <Button
            onClick={handleExport}
            disabled={isExporting || !previewSvg}
            className="h-12 w-full rounded-[6px] text-base font-medium shadow transition-smooth-transform active:scale-[0.98]"
            size="lg"
          >
            <Download className="h-5 w-5 shrink-0" />
            {isExporting ? 'Exporting...' : 'Download Asset'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            File:{' '}
            <span className="font-medium text-foreground">
              {previewFilename}
            </span>
          </p>
        </div>
      </div>

      {/* Preview Panel — sticky on desktop; above sidebar on mobile, height from content on mobile */}
      <div className="order-1 flex min-h-0 flex-col gap-4 overflow-y-auto lg:order-2 lg:flex-1 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-2xl font-medium text-foreground">
            Live Preview
          </h3>
          <div className="flex items-center gap-1 rounded-[6px] border border-border p-1">
            <button
              onClick={() => setPreviewBg('light')}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-smooth-transform hover:shadow-md active:scale-[0.97] ${
                previewBg === 'light'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Light
            </button>
            <button
              onClick={() => setPreviewBg('dark')}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-smooth-transform hover:shadow-md active:scale-[0.97] ${
                previewBg === 'dark'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark
            </button>
          </div>
        </div>

        <Card
          className={`flex min-h-[320px] items-center justify-center overflow-hidden rounded-lg border transition-smooth lg:min-h-[400px] ${
            previewBg === 'dark'
              ? 'border-[#393939] bg-[#161616]'
              : 'border-border bg-background'
          }`}
        >
          <CardContent className="flex items-center justify-center p-6 lg:p-12">
            {isLoading ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Loading asset...
                </p>
              </div>
            ) : previewSvg ? (
              <div className="flex w-full min-w-0 items-center justify-center">
                <img
                  src={svgToDataUrl(previewSvg)}
                  alt={`${illustration.label} pictogram preview`}
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select options to preview
              </p>
            )}
          </CardContent>
        </Card>

        {selectedFormat === 'png' && previewSvg && !isLoading && (
          <Card className="overflow-hidden rounded-lg border">
            <CardContent className="p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Transparency Preview
              </p>
              <div
                className="flex items-center justify-center rounded-md p-8"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #e9e9e9 25%, transparent 25%), linear-gradient(-45deg, #e9e9e9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e9e9e9 75%), linear-gradient(-45deg, transparent 75%, #e9e9e9 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              >
                <img
                  src={svgToDataUrl(previewSvg)}
                  alt="Transparency preview"
                  className="max-h-32 max-w-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ControlSection({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2 lg:px-5 lg:pt-5 lg:pb-3', className)}>
      <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">{label}</label>
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
