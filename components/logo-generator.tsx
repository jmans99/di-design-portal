'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'
import {
  logosForFilter,
  resolveGigaLogoPath,
} from '@/lib/brand-registry'
import { BRAND_LABELS, type BrandFilter } from '@/lib/brand'
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
import { Download, Layers, ArrowUpDown } from 'lucide-react'
import { PreviewPanel, PreviewThemeToggle } from '@/components/ui/preview-panel'
import { cn } from '@/lib/utils'

const RESOLUTIONS: { label: string; value: Resolution; scale: number }[] = [
  { label: '1x', value: '1x', scale: 1 },
  { label: '2x', value: '2x', scale: 2 },
  { label: '4x', value: '4x', scale: 4 },
]

interface LogoGeneratorProps {
  /** Brand filter: All, or one brand's logos plus the shared ones. */
  filter: BrandFilter
  /** When set (e.g. from Video guidelines), preselect this color variant on mount. */
  initialColorVariant?: string | null
}

/** Brand selector groups, in order; only the ones the filter allows show. */
const BRAND_GROUPS = [BRAND_LABELS.di, BRAND_LABELS.both, BRAND_LABELS.giga]

export function LogoGenerator({ filter, initialColorVariant }: LogoGeneratorProps) {
  const BRAND_ASSETS = logosForFilter(filter)
  const [selectedBrand, setSelectedBrand] = useState(BRAND_ASSETS[0].brandName)
  // When the filter hides the selected logo, select the first one it allows.
  const [shownFilter, setShownFilter] = useState(filter)
  if (shownFilter !== filter) {
    setShownFilter(filter)
    if (!BRAND_ASSETS.some((b) => b.brandName === selectedBrand)) setSelectedBrand(BRAND_ASSETS[0].brandName)
  }
  // Searchable by name, group (brand), type tag, versions and the colours each logo comes in ("black").
  const brandOptions: SearchableSelectOption[] = BRAND_ASSETS.map((asset) => ({
    value: asset.brandName,
    label: asset.brandName,
    group: BRAND_LABELS[asset.brand],
    tag: asset.assetType,
    keywords: [
      asset.brand === 'giga' ? 'Giga' : asset.brand === 'di' ? 'DI' : 'DI Giga shared',
      ...(asset.versions?.map((v) => v.label) ?? []),
      ...new Set([asset, ...(asset.versions ?? [])].flatMap((v) => v.allowedColorVariants.map((c) => c.name))),
    ],
  }))
  const brand = BRAND_ASSETS.find((b) => b.brandName === selectedBrand) ?? BRAND_ASSETS[0]

  // Sub-version (e.g. boxed/unboxed for UNICEF Digital Impact). null = brand has
  // no versions or falls back to the default. Stored as the version id.
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    BRAND_ASSETS[0].versions?.[0]?.id ?? null
  )
  const activeVersion =
    brand.versions?.find((v) => v.id === selectedVersionId) ??
    brand.versions?.[0] ??
    null

  // Effective resolution. When a brand defines versions, the active version is
  // the SOLE source of truth — falling back to the top-level fields would leak
  // the wrong SVG (e.g. unboxed would inherit boxed's svgPathByColorName).
  const effectiveAllowedVariants = activeVersion
    ? activeVersion.allowedColorVariants
    : brand.allowedColorVariants
  const effectiveSvgPath = activeVersion ? activeVersion.svgPath : brand.svgPath
  const effectiveSvgPathByColorName = activeVersion
    ? activeVersion.svgPathByColorName
    : brand.svgPathByColorName

  // Color variant: use the effective allowed variants; default to first allowed
  const [selectedColorName, setSelectedColorName] = useState(
    BRAND_ASSETS[0].allowedColorVariants[0].name
  )

  // Apply initial variant when navigating from Video guidelines (e.g. "White")
  useEffect(() => {
    if (initialColorVariant && effectiveAllowedVariants.some((v) => v.name === initialColorVariant)) {
      setSelectedColorName(initialColorVariant)
    }
  }, [initialColorVariant, effectiveAllowedVariants])

  // Giga main logo extra config
  const [orientation, setOrientation] = useState<LogoOrientation>('horizontal')
  const [chosenCombination, setCombination] = useState<LogoCombination>('standalone')
  // An entry with a fixed lockup (Giga, or Giga + UNICEF + ITU) shows only that one.
  const combination = brand.combination ?? chosenCombination

  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('svg')
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('2x')
  const [previewSvg, setPreviewSvg] = useState<string>('')
  const [previewBg, setPreviewBg] = useState<'light' | 'dark'>('light')
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const isGigaMain = brand.isGigaMainLogo === true
  const isUnicefLogo = brand.brandName === 'UNICEF'
  const isUnicefDigitalImpact = brand.brandName === 'UNICEF Digital Impact'
  const isUnicefDigitalInclusion = brand.brandName === 'UNICEF Digital Inclusion'
  const colorVariant = effectiveAllowedVariants.find(
    (c) => c.name === selectedColorName
  ) ?? effectiveAllowedVariants[0]
  const gigaVariantKey = colorVariantToGigaVariant(selectedColorName)
  const supportsBicolor = effectiveAllowedVariants.some(
    (v) => v.secondaryHex != null || v.name === 'Bicolor'
  )

  // When switching brand, reset to that brand's first version (if any) and clamp
  // color variant to the resulting allowed list.
  useEffect(() => {
    const firstVersionId = brand.versions?.[0]?.id ?? null
    setSelectedVersionId(firstVersionId)
    const nextAllowed =
      brand.versions?.[0]?.allowedColorVariants ?? brand.allowedColorVariants
    if (!nextAllowed.some((v) => v.name === selectedColorName)) {
      setSelectedColorName(nextAllowed[0].name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand])

  // When switching version inside a brand, clamp color variant to the new allowed list.
  useEffect(() => {
    if (!effectiveAllowedVariants.some((v) => v.name === selectedColorName)) {
      setSelectedColorName(effectiveAllowedVariants[0].name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVersionId])

  const generatePreview = useCallback(async () => {
    setIsLoading(true)
    try {
      const mapping = effectiveSvgPathByColorName
      if (mapping && Object.keys(mapping).length > 0) {
        const path =
          mapping[selectedColorName] ??
          mapping[Object.keys(mapping)[0] as keyof typeof mapping]
        const rawSvg = await loadSvg(path)
        setPreviewSvg(rawSvg)
        return
      }

      let svgPath: string

      if (isGigaMain) {
        svgPath = resolveGigaLogoPath(orientation, combination)
      } else {
        svgPath = effectiveSvgPath!
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
    effectiveSvgPath,
    effectiveSvgPathByColorName,
    selectedColorName,
    orientation,
    combination,
    gigaVariantKey,
    supportsBicolor,
    colorVariant.hex,
  ])

  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  // Auto-switch preview background for light-on-dark lockups
  useEffect(() => {
    if (selectedColorName === 'White' || selectedColorName === 'Bicolor Negative') {
      setPreviewBg('dark')
    } else {
      setPreviewBg('light')
    }
  }, [selectedColorName])

  const getFilenameVariant = () => {
    return colorVariant.name
  }

  // When a brand has sub-versions, include the active version label in the filename
  // (e.g. "unicef-digital-impact-unboxed_unicef-blue.svg") so exported files are
  // self-describing.
  // The Giga logo entries (Giga, Giga + UNICEF + ITU) keep the "giga" filenames; the lockup is in the combination part.
  const brandFilenameKey = activeVersion
    ? `${brand.brandName} ${activeVersion.label}`
    : isGigaMain
      ? 'Giga'
      : brand.brandName

  const handleExport = async () => {
    if (!previewSvg) return
    setIsExporting(true)

    try {
      const filename = generateFilename(
        brandFilenameKey,
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
    brandFilenameKey,
    getFilenameVariant(),
    selectedFormat,
    isRaster ? selectedResolution : undefined,
    isGigaMain ? orientation : undefined,
    isGigaMain ? combination : undefined
  )

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar: sticky, height fits content */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        {/* Brand selector */}
        <ControlSection label="Brand" className="lg:pt-4 lg:pb-2.5">
          <SearchableSelect
            value={brand.brandName}
            onValueChange={setSelectedBrand}
            options={brandOptions}
            groups={BRAND_GROUPS}
            label="Brand"
            placeholder="Choose a brand"
            searchPlaceholder="Search logos..."
            emptyText="No logo found."
            tagInTrigger
          />
        </ControlSection>

        {/* Giga-only: Orientation */}
        {isGigaMain && (
          <ControlSection
            label="Orientation"
            icon={<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />}
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

        {/* Giga-only: Combination (entries with a fixed lockup skip it) */}
        {isGigaMain && !brand.combination && (
          <ControlSection
            label="Combination"
            icon={<Layers className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="flex flex-col gap-2">
              {(
                [
                  { value: 'standalone' as LogoCombination, label: 'Giga Only' },
                  { value: 'unicef-itu' as LogoCombination, label: 'Giga + UNICEF + ITU' },
                ] as const
              ).map((opt) => (
                <OptionCard
                  key={opt.value}
                  active={combination === opt.value}
                  onClick={() => setCombination(opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </ControlSection>
        )}

        {/* Version (e.g. boxed/unboxed) — visible only when the brand defines sub-versions */}
        {brand.versions && brand.versions.length > 1 && (
          <ControlSection label="Version">
            <div className="flex gap-2">
              {brand.versions.map((v) => (
                <ToggleButton
                  key={v.id}
                  active={(selectedVersionId ?? brand.versions![0].id) === v.id}
                  onClick={() => setSelectedVersionId(v.id)}
                >
                  {v.label}
                </ToggleButton>
              ))}
            </div>
          </ControlSection>
        )}

        {/* Color variant: bicolor only for Giga + Giga Connectivity Forum; monochrome for products + GEP */}
        <ControlSection label="Color Variant">
          <div className="flex flex-col gap-2">
            {effectiveAllowedVariants.map((v) => {
              const swatchColors = v.secondaryHex
                ? [v.hex, v.secondaryHex]
                : [v.hex]
              return (
                <button
                  key={v.name}
                  onClick={() => setSelectedColorName(v.name)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-smooth-transform active:scale-[0.99] ${
                    selectedColorName === v.name
                      ? 'border-chosen-border bg-chosen/70 text-foreground'
                      : 'border-border bg-card text-foreground hover:bg-secondary/60'
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
                  <span>{v.name}</span>
                </button>
              )
            })}
          </div>
        </ControlSection>

        {/* Format */}
        <ControlSection label="Format">
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
        <div className="lg:px-5 lg:pb-4 lg:pt-2">
          <Button
            onClick={handleExport}
            disabled={isExporting || !previewSvg}
            className="w-full"
          >
            <Download />
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
        {/* Main preview area */}
        <PreviewPanel
          dark={previewBg === 'dark'}
          controls={<PreviewThemeToggle value={previewBg} onChange={setPreviewBg} />}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading asset...</p>
            </div>
          ) : previewSvg ? (
            <img
              src={svgToDataUrl(previewSvg)}
              alt={`${brand.brandName} logo preview`}
              className={cn(
                'object-contain',
                isUnicefDigitalImpact
                  ? 'max-h-36 w-full max-w-md'
                  : isUnicefDigitalInclusion
                    ? 'max-h-20 w-full max-w-md'
                    : 'max-h-64 max-w-full',
                isUnicefLogo && 'scale-[1.15]'
              )}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Select options to preview</p>
          )}
        </PreviewPanel>

        {/* Transparency preview for PNG */}
        {selectedFormat === 'png' && previewSvg && !isLoading && (
          <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-stripe">
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
                  className={cn(
                    'object-contain',
                    isUnicefDigitalImpact
                      ? 'max-h-20 w-full max-w-sm'
                      : 'max-h-32 max-w-full',
                    isUnicefLogo && 'scale-[1.15]'
                  )}
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
      className={cn('flex flex-col gap-1.5 lg:px-5 lg:py-2.5', className)}
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
      className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-medium transition-smooth-transform active:scale-[0.98] ${
        active
          ? 'border-chosen-border bg-chosen text-link'
          : 'border-border bg-card text-foreground hover:bg-secondary/60'
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
  description?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition-smooth-transform active:scale-[0.99] ${
        active
          ? 'border-chosen-border bg-chosen/70 text-foreground'
          : 'border-border bg-card text-foreground hover:bg-secondary/60'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {description ? (
        <span className="text-xs text-muted-foreground">{description}</span>
      ) : null}
    </button>
  )
}
