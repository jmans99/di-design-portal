import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Giga Brand Asset Generator',
  description: 'Generate brand-compliant visual assets for Giga partners. Logos, colors, and typography — all in one operational tool.',
}

export const viewport: Viewport = {
  themeColor: '#277aff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
