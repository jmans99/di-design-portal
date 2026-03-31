'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  BRAND_ASSETS,
  resolveGigaLogoPath,
} from '@/lib/brand-registry'
import {
  loadSvg,
  recolorGigaLogo,
  recolorSvg,
  colorVariantToGigaVariant,
  svgToDataUrl,
  exportAsRaster,
  downloadBlob,
  downloadSvg,
  generateFilename,
} from '@/lib/svg-processing'
import type {
  OutputFormat,
  Resolution,
  LogoOrientation,
  LogoCombination,
  GigaColorVariant,
} from '@/lib/types'
import { Download, Sun, Moon, Layers, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESOLUTIONS: { label: string; value: Resolution; scale: number }[] = [
  { label: '1x', value: '1x', scale: 1 },
  { label: '2x', value: '2x', scale: 2 },
  { label: '4x', value: '4x', scale: 4 },
]

interface LogoGeneratorProps {
  /** When set (e.g. from Video guidelines), preselect this color variant on mount. */
  initialColorVariant?: string | null
}

export function LogoGenerator({ initialColorVariant }: LogoGeneratorProps) {
  const [selectedBrand, setSelectedBrand] = useState(BRAND_ASSETS[0].brandName)
  const brand = BRAND_ASSETS.find((b) => b.brandName === selectedBrand)!

  // Color variant: use the current brand's allowed variants; default to first allowed
  const [selectedColorName, setSelectedColorName] = useState(
    BRAND_ASSETS[0].allowedColorVariants[0].name
  )

  // Apply initial variant when navigating from Video guidelines (e.g. "White")
  useEffect(() => {
    if (initialColorVariant && brand.allowedColorVariants.some((v) => v.name === initialColorVariant)) {
      setSelectedColorName(initialColorVariant)
    }
  }, [initialColorVariant, brand.allowedColorVariants])

  // Giga main logo extra config
  const [orientation, setOrientation] = useState<LogoOrientation>('horizontal')
  const [combination, setCombination] = useState<LogoCombination>('standalone')

  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('svg')
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('2x')
  const [previewSvg, setPreviewSvg] = useState<string>('')
  const [previewBg, setPreviewBg] = useState<'light' | 'dark'>('light')
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const isGigaMain = brand.isGigaMainLogo === true
  const colorVariant = brand.allowedColorVariants.find(
    (c) => c.name === selectedColorName
  ) ?? brand.allowedColorVariants[0]
  const gigaVariantKey = colorVariantToGigaVariant(selectedColorName)
  const supportsBicolor = brand.allowedColorVariants.some(
    (v) => v.secondaryHex != null || v.name === 'Bicolor'
  )

  // When switching brand, if current color variant isn't allowed, switch to first allowed
  useEffect(() => {
    const allowed = brand.allowedColorVariants
    const isAllowed = allowed.some((v) => v.name === selectedColorName)
    if (!isAllowed && allowed.length > 0) {
      setSelectedColorName(allowed[0].name)
    }
  }, [selectedBrand])

  const generatePreview = useCallback(async () => {
    setIsLoading(true)
    try {
      let svgPath: string

      if (isGigaMain) {
        svgPath = resolveGigaLogoPath(orientation, combination)
      } else {
        svgPath = brand.svgPath!
      }

      const rawSvg = await loadSvg(svgPath)
      const processed = supportsBicolor
        ? recolorGigaLogo(rawSvg, gigaVariantKey)
        : recolorSvg(rawSvg, colorVariant.hex)
      setPreviewSvg(processed)
    } catch (err) {
      console.error('Failed to generate preview:', err)
    } finally {
      setIsLoading(false)
    }
  }, [
    isGigaMain,
    brand.svgPath,
    orientation,
    combination,
    gigaVariantKey,
    supportsBicolor,
    colorVariant.hex,
  ])

  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  // Auto-switch to dark preview for white variant
  useEffect(() => {
    if (selectedColorName === 'White') {
      setPreviewBg('dark')
    }
  }, [selectedColorName])

  const getFilenameVariant = () => {
    return colorVariant.name
  }

  const handleExport = async () => {
    if (!previewSvg) return
    setIsExporting(true)

    try {
      const filename = generateFilename(
        brand.brandName,
        getFilenameVariant(),
        selectedFormat,
        selectedFormat !== 'svg' ? selectedResolution : undefined,
        isGigaMain ? orientation : undefined,
        isGigaMain ? combination : undefined
      )

      if (selectedFormat === 'svg') {
        downloadSvg(previewSvg, filename)
      } else {
        const scale =
          RESOLUTIONS.find((r) => r.value === selectedResolution)?.scale || 1
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

  const previewFilename = generateFilename(
    brand.brandName,
    getFilenameVariant(),
    selectedFormat,
    isRaster ? selectedResolution : undefined,
    isGigaMain ? orientation : undefined,
    isGigaMain ? combination : undefined
  )

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar: sticky, height fits content */}
      <div className="order-2 flex w-full flex-col gap-6 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:gap-0 lg:divide-y lg:divide-border lg:shadow-stripe">
        {/* Brand selector */}
        <ControlSection label="Brand">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="rounded-md transition-smooth-transform">
              <SelectValue placeholder="Choose a brand" />
            </SelectTrigger>
            <SelectContent>
              {BRAND_ASSETS.map((asset) => (
                <SelectItem key={asset.brandName} value={asset.brandName}>
                  <span className="flex items-center gap-2">
                    {asset.brandName}
                    <Badge
                      variant="secondary"
                      className="rounded text-xs font-medium"
                    >
                      {asset.assetType}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ControlSection>

        {/* Giga-only: Orientation */}
        {isGigaMain && (
          <ControlSection
            label="Orientation"
            icon={<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />}
            className="lg:!border-t-0 lg:pt-3 lg:pb-3"
          >
            <div className="flex gap-2">
              {(
                [
                  { value: 'horizontal', label: 'Horizontal' },
                  { value: 'vertical', label: 'Vertical' },
                ] as const
              ).map((opt) => (
                <ToggleButton
                  key={opt.value}
                  active={orientation === opt.value}
                  onClick={() => setOrientation(opt.value)}
                >
                  {opt.label}
                </ToggleButton>
              ))}
            </div>
          </ControlSection>
        )}

        {/* Giga-only: Combination */}
        {isGigaMain && (
          <ControlSection
            label="Combination"
            icon={<Layers className="h-3.5 w-3.5 text-muted-foreground" />}
            className="lg:!border-t-0 lg:pt-3"
          >
            <div className="flex flex-col gap-2">
              {(
                [
                  {
                    value: 'standalone' as LogoCombination,
                    label: 'Giga Only',
                    desc: 'Standalone Giga logo',
                  },
                  {
                    value: 'unicef-itu' as LogoCombination,
                    label: 'Giga + UNICEF + ITU',
                    desc: 'Combined lockup with partners',
                  },
                ] as const
              ).map((opt) => (
                <OptionCard
                  key={opt.value}
                  active={combination === opt.value}
                  onClick={() => setCombination(opt.value)}
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>
          </ControlSection>
        )}

        {/* Color variant: bicolor only for Giga + Giga Connectivity Forum; monochrome for products + GEP */}
        <ControlSection label="Color Variant" className="lg:!border-t-0 lg:pt-3">
          <div className="flex flex-col gap-2">
            {brand.allowedColorVariants.map((v) => {
              const swatchColors = v.secondaryHex
                ? [v.hex, v.secondaryHex]
                : [v.hex]
              return (
                <button
                  key={v.name}
                  onClick={() => setSelectedColorName(v.name)}
                  className={`flex items-center gap-3 rounded-[6px] border px-4 py-3 text-left text-sm font-medium transition-smooth-transform hover:shadow-md active:scale-[0.99] ${
                    selectedColorName === v.name
                      ? 'border-primary bg-accent text-foreground shadow'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  <span className="flex shrink-0 items-center gap-0.5">
                    {swatchColors.map((c, i) => (
                      <span
                        key={i}
                        className="inline-block h-5 w-5 rounded-[2px] border border-border"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </span>
                  <span className="flex flex-col items-start">
                    <span>{v.name}</span>
                    {v.description && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {v.description}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </ControlSection>

        {/* Format */}
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

        {/* Resolution (raster only) */}
        {isRaster && (
          <ControlSection label="Resolution">
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

        {/* Download — sticky on desktop */}
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

      {/* Preview Panel — sticky on desktop; above sidebar on mobile */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
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

        {/* Main preview area */}
        <Card
          className={`flex min-h-[320px] items-center justify-center overflow-hidden rounded-lg border transition-smooth lg:min-h-[400px] ${
            previewBg === 'dark'
              ? 'border-[#393939] bg-[#161616]'
              : 'border-border bg-background'
          }`}
        >
          <CardContent className="flex items-center justify-center p-12">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Loading asset...
                </p>
              </div>
            ) : previewSvg ? (
              <img
                src={svgToDataUrl(previewSvg)}
                alt={`${brand.brandName} logo preview`}
                className="max-h-64 max-w-full object-contain"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Select options to preview
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transparency preview for PNG */}
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

/* ------------------------------------------------------------------ */
/*  Shared sub-components for consistent control panel styling        */
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
    <div
      className={cn('flex flex-col gap-2 lg:px-5 lg:pt-5 lg:pb-3', className)}
    >
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
