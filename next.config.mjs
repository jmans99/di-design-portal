import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin workspace root when a parent directory has another lockfile (avoids wrong Turbopack root).
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Chromium binary (`.br` files under /bin) must be loaded off disk at runtime —
  // if Webpack relocates them the function errors with "input directory
  // /var/task/node_modules/@sparticuz/chromium/bin does not exist". Same for
  // playwright-core which resolves its own driver path.
  serverExternalPackages: ['@sparticuz/chromium', 'playwright-core', 'playwright'],
}

export default nextConfig
