import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /*
   * Pin the workspace root to this project.
   *
   * There is a second package-lock.json one directory up, on the Desktop, and
   * Next resolves multiple lockfiles by picking the highest one — so every
   * build traced files from the wrong root and printed a warning about it.
   * Wrong-root tracing is what leaves a half-written .next behind, and a
   * half-written .next is what produces the nonsense build failures:
   * "Cannot find module ./611.js", "<Html> should not be imported outside of
   * pages/_document". If a build ever fails that way, delete .next and rebuild.
   */
  outputFileTracingRoot: path.join(__dirname),
  // The 3D scene owns scroll position across navigations; Next's automatic
  // restoration would fight the Lenis-driven scroll state on back/forward.
  experimental: {
    scrollRestoration: false,
  },
}

export default nextConfig
