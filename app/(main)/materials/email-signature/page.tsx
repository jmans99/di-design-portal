import { EmailSignatureGenerator } from '@/components/email-signature-generator'
import { PageHeader } from '@/components/page-header'

export default function EmailSignaturePage() {
  return (
    <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 overflow-visible px-6 py-12">
      <PageHeader
        title="Digital Inclusion email signature"
        description="Build your Digital Inclusion + Giga signature, then copy it and paste into Outlook (Settings > Signatures). The signature font is Noto Sans, Outlook may reformat it, please verify after pasting."
      />
      <EmailSignatureGenerator />
    </main>
  )
}
