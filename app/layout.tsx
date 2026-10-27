import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { getSite } from '@/lib/site'
import './globals.css'

const SITE = getSite()

export const metadata: Metadata = {
  title: SITE.metadata.title,
  description: SITE.metadata.description,
}

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-site={SITE.id}>
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
      <body className="font-sans antialiased">
        {children}
        {/* Hotjar Tracking Code, only for sites with a Hotjar ID */}
        {SITE.hotjarId !== null && (
          <Script id="hotjar" strategy="afterInteractive">
            {`(function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${SITE.hotjarId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
          </Script>
        )}
      </body>
    </html>
  )
}
