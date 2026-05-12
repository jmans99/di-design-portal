'use client'

import { useCallback, useMemo, useState } from 'react'
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
import { Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SignatureLayout,
  type SignatureLocation,
  type SignatureLogoLockup,
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
  { value: 'stacked-di-giga-unicef-itu', label: 'Digital Impact + Giga / UNICEF / ITU' },
  { value: 'unicef-digital-impact-division', label: 'UNICEF Digital Impact Division' },
  { value: 'giga-unicef-itu', label: 'Giga + UNICEF + ITU' },
]

export function EmailSignatureGenerator() {
  const [name, setName] = useState('Nobuntu Ndlovu')
  const [jobTitle, setJobTitle] = useState('Communications Manager')
  const [location, setLocation] = useState<SignatureLocation>('geneva')
  const [logoLockup, setLogoLockup] = useState<SignatureLogoLockup>(
    'stacked-di-giga-unicef-itu'
  )
  const [version, setVersion] = useState<SignatureLayout>('extended')
  const [assetBaseUrl] = useState(resolveEmailSignatureAssetBaseUrl)
  const [copyHint, setCopyHint] = useState<string | null>(null)

  const html = useMemo(
    () =>
      buildEmailSignatureHtml({
        name: name.trim() || 'Your name',
        jobTitle: jobTitle.trim() || 'Job title',
        location,
        logoLockup,
        layout: version,
        assetBaseUrl,
      }),
    [name, jobTitle, location, logoLockup, version, assetBaseUrl]
  )

  const plainText = useMemo(
    () =>
      buildEmailSignaturePlainText({
        name: name.trim() || 'Your name',
        jobTitle: jobTitle.trim() || 'Job title',
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
          <p className="text-xs text-muted-foreground leading-relaxed">
            “ | Digital Inclusion and Giga” will be appended automatically.
          </p>
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

        {version === 'extended' && (
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
        )}

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
            className="h-12 w-full rounded-[6px] text-base font-medium shadow transition-smooth-transform active:scale-[0.98]"
            size="lg"
            onClick={handleCopySignature}
          >
            <Copy className="mr-2 h-5 w-5 shrink-0" />
            Copy signature
          </Button>
          {copyHint && <p className="text-center text-xs text-muted-foreground">{copyHint}</p>}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Click Copy signature, then in Outlook go to Settings {'>'} Signatures and paste your signature.
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
