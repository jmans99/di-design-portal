'use client'

import { useEffect, useRef, useState } from 'react'
import { PreviewPanel } from '@/components/ui/preview-panel'
import { cn } from '@/lib/utils'

/**
 * Shared shell for the generator pages (social post, engagement map): sticky
 * sidebar with controls on the left, auto-scaled native-resolution preview on
 * the right. `children` is the template rendered at previewWidth×previewHeight;
 * the shell downscales it to fit the viewport.
 */
export function StudioLayout({
  previewWidth,
  previewHeight,
  sidebar,
  children,
}: {
  previewWidth: number
  previewHeight: number
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const previewWrapperRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(0.5)

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

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Sidebar */}
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        {sidebar}
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
                {children}
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

export function ControlSection({
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
