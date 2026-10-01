'use client'

import { useState } from 'react'
import { PreviewPanel } from '@/components/ui/preview-panel'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GigaMapGenerator } from '@/components/maps/giga-map-generator'

type PresetId = 'map-01' | 'map-02'
type Selection = PresetId | 'custom'

const PRESETS: Record<PresetId, { label: string; src: string; filename: string }> = {
  'map-01': {
    label: 'Standard 1',
    src: '/backgrounds/map-01-dark.png',
    filename: 'giga-background_standard-1_dark.png',
  },
  'map-02': {
    label: 'Standard 2',
    src: '/backgrounds/map-02-dark.png',
    filename: 'giga-background_standard-2_dark.png',
  },
}

export function BackgroundsPicker() {
  const [selection, setSelection] = useState<Selection>('map-01')

  const backgroundSelect = (
    <ControlSection
      label="Background"
      icon={<ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />}
      className="lg:pt-4 lg:pb-2.5"
    >
      <Select value={selection} onValueChange={(v) => setSelection(v as Selection)}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="map-01">Standard 1</SelectItem>
          <SelectItem value="map-02">Standard 2</SelectItem>
          <SelectItem value="custom">Custom map</SelectItem>
        </SelectContent>
      </Select>
    </ControlSection>
  )

  // A custom background is a map from the Maps page with the lockup on top:
  // same engine, same area and facility controls, live preview.
  if (selection === 'custom') {
    return <GigaMapGenerator variant="background" sidebarTop={backgroundSelect} />
  }

  const preset = PRESETS[selection]

  const handlePresetDownload = () => {
    const a = document.createElement('a')
    a.href = preset.src
    a.download = preset.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        {backgroundSelect}
        <div className="lg:px-5 lg:pb-4 lg:pt-2">
          <Button onClick={handlePresetDownload} className="w-full">
            <Download />
            Download PNG
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            File: <span className="font-medium text-foreground">{preset.filename}</span>
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            3840 × 2160 PNG, dark theme, ready for Teams, Zoom, and Google Meet.
          </p>
        </div>
      </div>

      {/* Preview panel */}
      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit lg:min-w-0">
        <PreviewPanel dark className="min-h-0" contentClassName="p-0">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0a0a0a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preset.src}
              alt={preset.label}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </PreviewPanel>
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
