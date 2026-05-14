import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import { chromium as playwright } from 'playwright-core'
import { GIGA_COUNTRIES } from '@/lib/giga-countries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Millisecondi da aspettare dopo il networkidle per far renderizzare i dot.
 * 12 secondi e' un valore conservativo perche' la function gira da US East e
 * maps.giga.global serve i layer da Europa: la prima invocation cold ci mette
 * qualche secondo in piu' rispetto al dev locale. */
const RENDER_WAIT_MS = 12000

function buildUrl(code: string, layer: 'live' | 'static') {
  const layerParam = layer === 'live' ? '14' : 'null'
  return `https://maps.giga.global/map/country/${code}?layer=${layerParam}&status=10001`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = (searchParams.get('country') || '').toLowerCase()
  const layerParam = searchParams.get('layer') || 'live'
  const themeParam = searchParams.get('theme') || 'dark'
  const scaleParam = parseInt(searchParams.get('scale') || '2', 10)

  if (!/^[a-z]{2}$/.test(country)) {
    return NextResponse.json(
      { error: 'Invalid country code. Use ISO 3166 alpha 2.' },
      { status: 400 }
    )
  }
  const knownCountry = GIGA_COUNTRIES.find((c) => c.code === country)
  if (!knownCountry) {
    return NextResponse.json(
      { error: `Unknown country code: ${country}` },
      { status: 400 }
    )
  }
  const layer: 'live' | 'static' = layerParam === 'static' ? 'static' : 'live'
  const theme: 'light' | 'dark' = themeParam === 'light' ? 'light' : 'dark'
  const scale = scaleParam === 1 ? 1 : 2
  const bgColor = theme === 'light' ? '#ffffff' : '#000000'

  const url = buildUrl(country, layer)
  const viewport = { width: 1920, height: 1080 }

  let browser: Awaited<ReturnType<typeof playwright.launch>> | null = null
  try {
    // In ambiente serverless (Vercel, Lambda) usiamo il chromium di Sparticuz
    // perche il binario di sistema non e disponibile. In dev locale (macOS, Linux
    // desktop) usiamo invece il chromium installato da `npx playwright install`,
    // dato che il build Sparticuz e compilato per Amazon Linux e non gira altrove.
    const isServerless =
      !!process.env.VERCEL ||
      !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NEXT_RUNTIME === 'edge'

    if (isServerless) {
      const executablePath = await chromium.executablePath()
      browser = await playwright.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      })
    } else {
      browser = await playwright.launch({ headless: true })
    }

    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: scale,
      colorScheme: theme,
    })
    const page = await context.newPage()

    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(RENDER_WAIT_MS)

    // Pulizia UI: nascondiamo tutto tranne il path dal body al canvas Mapbox.
    // Cosi sparisce sidebar Giga, modali Carbon, tooltip, controlli e scrollbar
    // restando solo la mappa con i dot.
    await page.evaluate((bgColor) => {
      const canvasContainer = document.querySelector(
        '.mapboxgl-canvas-container, .maplibregl-canvas-container'
      )
      if (!canvasContainer) return

      const keep = new Set<Element>()
      let node: Element | null = canvasContainer
      while (node) {
        keep.add(node)
        node = node.parentElement
      }

      const all = document.body.querySelectorAll('*')
      all.forEach((el) => {
        if (keep.has(el)) return
        if (el.contains(canvasContainer)) return
        if (canvasContainer.contains(el)) return
        ;(el as HTMLElement).style.setProperty('display', 'none', 'important')
      })

      // Forza un background coerente col tema scelto, nel caso restino gap.
      document.documentElement.style.background = bgColor
      document.body.style.background = bgColor
    }, bgColor)

    // Piccolo settle dopo l'hide per evitare frame intermedi.
    await page.waitForTimeout(300)

    const buffer = await page.screenshot({ type: 'png', fullPage: false })

    await context.close()

    const filename = `giga-maps_${country.toUpperCase()}_${layer}_${theme}_${scale}x.png`
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('maps-screenshot error:', err)
    const message = err instanceof Error ? err.message : 'Screenshot failed'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (browser) await browser.close().catch(() => undefined)
  }
}
