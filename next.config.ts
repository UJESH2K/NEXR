import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The 3D scene owns scroll position across navigations; Next's automatic
  // restoration would fight the Lenis-driven scroll state on back/forward.
  experimental: {
    scrollRestoration: false,
  },
}

export default nextConfig
