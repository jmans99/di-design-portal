import { NextResponse, type NextRequest } from 'next/server'
import { PAGE_ROUTES, isRouteEnabled } from '@/lib/site'

/**
 * Route guard for the two sites (see lib/site.ts). A page route that exists in
 * the app but is not enabled for the current site is rewritten to a path that
 * matches nothing, so Next.js serves its normal 404 page with a 404 status.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/+$/, '') || '/'
  if ((PAGE_ROUTES as readonly string[]).includes(path) && !isRouteEnabled(path)) {
    return NextResponse.rewrite(new URL('/__not-on-this-site', request.url))
  }
  return NextResponse.next()
}

export const config = {
  // Page routes only: skip API routes, Next.js internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
}
