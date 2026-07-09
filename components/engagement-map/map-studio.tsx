'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, ExternalLink, Info, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ControlSection, StudioLayout } from '@/components/studio/studio-layout'
import { downloadBlob } from '@/lib/social-media/export'
import {
  EngagementMapTemplate,
  type EngagementMapCountry,
} from './engagement-map-template'
import {
  ENGAGEMENT_MAP_HEIGHT,
  ENGAGEMENT_MAP_WIDTH,
  buildEngagementMapFilename,
  exportEngagementMapToPng,
} from '@/lib/engagement-map/export'

type EngagementApiResponse = {
  engaged: EngagementMapCountry[]
  earlyInterest: EngagementMapCountry[]
  unresolved: string[]
  fetchedAt: string
  sourceUrl: string
}

export function EngagementMapStudio() {
  const [mapData, setMapData] = useState<EngagementApiResponse | null>(null)
  const [mapLoading, setMapLoading] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const templateRef = useRef<HTMLDivElement | null>(null)

  const today = useMemo(() => new Date(), [])
  const filename = useMemo(() => buildEngagementMapFilename(today), [today])

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
      setMapData((await res.json()) as EngagementApiResponse)
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setMapLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMapData(false)
  }, [loadMapData])

  const handleDownload = async () => {
    setExportError(null)
    setIsExporting(true)
    try {
      const node = templateRef.current
      if (!node) throw new Error('Map template not mounted')
      if (!mapData) throw new Error('Engagement data not loaded yet')
      const blob = await exportEngagementMapToPng(node)
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
        label="Data source"
        icon={<Info className="h-3.5 w-3.5 text-muted-foreground" />}
        className="lg:pt-4"
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

      <div className="lg:px-5 lg:pb-4 lg:pt-2">
        <Button
          onClick={handleDownload}
          disabled={isExporting || mapLoading || !mapData}
          className="w-full"
        >
          <Download className="shrink-0" />
          {isExporting ? 'Generating…' : 'Download PNG'}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          File: <span className="font-medium text-foreground">{filename}</span>
        </p>
        {exportError && (
          <p className="mt-2 text-xs text-destructive">{exportError}</p>
        )}
      </div>
    </>
  )

  return (
    <StudioLayout
      previewWidth={ENGAGEMENT_MAP_WIDTH}
      previewHeight={ENGAGEMENT_MAP_HEIGHT}
      sidebar={sidebar}
    >
      <EngagementMapTemplate
        ref={templateRef}
        engaged={mapData?.engaged ?? []}
        earlyInterest={mapData?.earlyInterest ?? []}
      />
    </StudioLayout>
  )
}
