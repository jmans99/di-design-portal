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
      <head>
        <link
          rel="preload"
          href="/fonts/open-sans-var-normal-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/manrope-var-normal-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
