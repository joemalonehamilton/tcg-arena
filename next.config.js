/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable WebSocket support in API routes
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
