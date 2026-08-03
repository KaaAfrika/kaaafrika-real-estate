/** @type {import('next').NextConfig} */
const nextConfig = {
  // The VPS deploy ships `.next/standalone` — server.js plus only the
  // dependencies it actually traced — so the box never runs an install.
  // A static export is not an option: /property/[id] renders on demand.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  }
}

export default nextConfig
