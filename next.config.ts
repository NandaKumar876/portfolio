import type { NextConfig } from 'next'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
}

export default nextConfig
