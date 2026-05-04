'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SignatureLayout,
  type SignatureLocation,
  type SignatureLogoLockup,
  buildEmailSignatureHtml,
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

const LOGO_OPTIONS: { value: SignatureLogoLockup; label: string }[] = [
  { value: 'giga-unicef-itu', label: 'Giga + UNICEF + ITU' },
  { value: 'unicef-digital-impact-division', label: 'UNICEF Digital Impact Division' },
]

export function EmailSignatureGenerator() {
  const [name, setName] = useState('Nobuntu Ndlovu')
  const [jobTitle, setJobTitle] = useState(
    'Communications Manager | Digital Inclusion and Giga'
  )
  const [location, setLocation] = useState<SignatureLocation>('geneva')
  const [logoLockup, setLogoLockup] = useState<SignatureLogoLockup>(
    'unicef-digital-impact-division'
  )
  const [version, setVersion] = useState<SignatureLayout>('extended')
  const [assetBaseUrl, setAssetBaseUrl] = useState('')
  const [copyHint, setCopyHint] = useState<string | null>(null)

  useEffect(() => {
    setAssetBaseUrl(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])

  const html = useMemo(
    () =>
      buildEmailSignatureHtml({
        name: name.trim() || 'Your name',
        jobTitle: jobTitle.trim() || 'Job title',
        location,
        logoLockup,
        layout: version,
        assetBaseUrl: assetBaseUrl || 'https://example.com',
      }),
    [name, jobTitle, location, logoLockup, version, assetBaseUrl]
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopyHint('Copied HTML to clipboard')
      setTimeout(() => setCopyHint(null), 2500)
    } catch {
      setCopyHint('Copy failed — select HTML manually')
    }
  }, [html])

  const handleDownloadHtm = useCallback(() => {
    const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Email signature</title></head><body>${html}</body></html>`
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'giga-email-signature.htm'
    a.click()
    URL.revokeObjectURL(url)
  }, [html])

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

        <ControlSection label="Job title">
          <Input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="rounded-md"
            placeholder="Role title"
          />
        </ControlSection>

        <ControlSection label="Office location">
          <Select value={location} onValueChange={(v) => setLocation(v as SignatureLocation)}>
            <SelectTrigger className="rounded-md transition-smooth-transform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geneva">Geneva</SelectItem>
              <SelectItem value="valencia">Valencia</SelectItem>
              <SelectItem value="barcelona">Barcelona</SelectItem>
            </SelectContent>
          </Select>
        </ControlSection>

        <ControlSection label="Logo">
          <div className="flex flex-col gap-2">
            {LOGO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLogoLockup(opt.value)}
                className={cn(
                  'rounded-[6px] border px-4 py-3 text-left text-sm font-medium transition-smooth-transform hover:shadow-md active:scale-[0.99]',
                  logoLockup === opt.value
                    ? 'border-primary bg-accent text-foreground shadow'
                    : 'border-border bg-card text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
            variant="outline"
            className="h-11 w-full rounded-[6px]"
            onClick={handleCopy}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy HTML
          </Button>
          <Button
            type="button"
            className="h-12 w-full rounded-[6px] text-base font-medium shadow transition-smooth-transform active:scale-[0.98]"
            size="lg"
            onClick={handleDownloadHtm}
          >
            <Download className="h-5 w-5 shrink-0" />
            Download .htm (Outlook)
          </Button>
          {copyHint && <p className="text-center text-xs text-muted-foreground">{copyHint}</p>}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Outlook: Settings → Mail → Signatures — paste HTML or attach the .htm file. Images use URLs from{' '}
            {assetBaseUrl || 'your deployed site'}.
          </p>
        </div>
      </div>

      <div className="order-1 flex min-h-0 flex-1 flex-col gap-4 lg:order-2 lg:sticky lg:top-[calc(4rem+24px)] lg:h-fit">
        <h3 className="font-heading text-2xl font-medium text-foreground">Live preview</h3>

        <Card className="min-h-[280px] overflow-auto rounded-lg border border-border bg-background transition-smooth lg:min-h-[360px]">
          <CardContent className="p-8">
            <div
              key={logoLockup}
              className="email-signature-preview max-w-none [&_a]:text-inherit"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
