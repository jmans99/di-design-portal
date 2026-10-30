'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PreviewPanel } from '@/components/ui/preview-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SignatureLayout,
  type SignatureLocation,
  buildEmailSignatureHtml,
  buildEmailSignaturePlainText,
  resolveEmailSignatureAssetBaseUrl,
} from '@/lib/email-signature-template'

/** Matches `ControlSection` in logo-generator (sidebar form). */
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
    <div className={cn('flex flex-col gap-1.5 lg:px-5 lg:py-2.5', className)}>
      <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
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
      type="button"
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

export function EmailSignatureGenerator() {
  const [name, setName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState<SignatureLocation>('geneva')
  const [version, setVersion] = useState<SignatureLayout>('extended')
  const [assetBaseUrl] = useState(resolveEmailSignatureAssetBaseUrl)
  const [copyHint, setCopyHint] = useState<string | null>(null)
  const [diLogoDataUrl, setDiLogoDataUrl] = useState<string | undefined>(undefined)
  const [gigaLogoDataUrl, setGigaLogoDataUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    async function svgToPngDataUrl(svgPath: string, displayWidthPx: number): Promise<string> {
      const res = await fetch(svgPath)
      const svgText = await res.text()
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      try {
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load ${svgPath}`))
          img.src = url
        })
        const scale = 3
        const ratio = img.naturalHeight / img.naturalWidth
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(displayWidthPx * scale)
        canvas.height = Math.round(displayWidthPx * ratio * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/png')
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    // Display widths in the signature: DI 120px (~62% of Giga ITU's 192px) to
    // match the brand reference proportions. Rasterize at the same widths so
    // the canvas → PNG step doesn't waste pixels.
    Promise.all([
      svgToPngDataUrl('/logos/unicef-digital-impact-division-black.svg', 120),
      svgToPngDataUrl('/logos/giga-unicef-itu-horizontal.svg', 192),
    ])
      .then(([di, giga]) => {
        if (cancelled) return
        setDiLogoDataUrl(di)
        setGigaLogoDataUrl(giga)
      })
      .catch((err) => {
        console.error('Email signature: SVG→PNG conversion failed', err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const logosLoading = version === 'extended' && (!diLogoDataUrl || !gigaLogoDataUrl)

  const html = useMemo(
    () =>
      buildEmailSignatureHtml({
        name: name.trim() || 'Your name',
        jobTitle: jobTitle.trim() || 'Role title',
        location,
        layout: version,
        assetBaseUrl,
        diLogoDataUrl,
        gigaLogoDataUrl,
      }),
    [name, jobTitle, location, version, assetBaseUrl, diLogoDataUrl, gigaLogoDataUrl]
  )

  const plainText = useMemo(
    () =>
      buildEmailSignaturePlainText({
        name: name.trim() || 'Your name',
        jobTitle: jobTitle.trim() || 'Role title',
        location,
        layout: version,
      }),
    [name, jobTitle, location, version]
  )

  const handleCopySignature = useCallback(async () => {
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plainText], { type: 'text/plain' }),
          }),
        ])
        setCopyHint('Copied — paste in Outlook (Settings > Signatures)')
      } else {
        await navigator.clipboard.writeText(html)
        setCopyHint('Copied as text — use Chrome or Edge for rich paste, then try again')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(html)
        setCopyHint('Copied as plain text — try Chrome or Edge if paste looks wrong')
      } catch {
        setCopyHint('Copy failed — check clipboard permissions')
      }
    }
    setTimeout(() => setCopyHint(null), 3500)
  }, [html, plainText])

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="order-2 flex w-full flex-col gap-0 lg:order-1 lg:sticky lg:top-[calc(4rem+24px)] lg:w-80 lg:shrink-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-stripe">
        <ControlSection label="Name" className="lg:pt-4 lg:pb-2.5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md"
            placeholder="Full name"
            autoComplete="name"
          />
        </ControlSection>

        <ControlSection label="Role title">
          <Input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="rounded-md"
            placeholder="e.g. Communications Manager"
          />
        </ControlSection>

        <ControlSection label="Office location">
          <Select value={location} onValueChange={(v) => setLocation(v as SignatureLocation)}>
            <SelectTrigger className="rounded-md transition-smooth-transform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geneva">Geneva</SelectItem>
              <SelectItem value="barcelona">Barcelona</SelectItem>
            </SelectContent>
          </Select>
        </ControlSection>

        <ControlSection label="Version">
          <div className="flex gap-2">
            <ToggleButton active={version === 'short'} onClick={() => setVersion('short')}>
              Short
            </ToggleButton>
            <ToggleButton active={version === 'extended'} onClick={() => setVersion('extended')}>
              Extended
            </ToggleButton>
          </div>
        </ControlSection>

        <div className="flex flex-col gap-2 lg:px-5 lg:pb-4 lg:pt-2">
          <Button
            type="button"
            className="w-full"
            onClick={handleCopySignature}
            disabled={logosLoading}
          >
            <Copy className="shrink-0" />
            {logosLoading ? 'Preparing logos…' : 'Copy signature'}
          </Button>
          {copyHint && <p className="text-center text-xs text-muted-foreground">{copyHint}</p>}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Click Copy signature, then in Outlook go to Settings {'>'} Signatures and paste your signature.
          </p>
        </div>
      </div>

      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit">
        <PreviewPanel
          className="min-h-[280px] overflow-auto lg:min-h-[360px]"
          contentClassName="items-start justify-start p-8"
        >
          <div
            className="email-signature-preview max-w-none [&_a]:text-inherit"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </PreviewPanel>
      </div>
    </div>
  )
}
