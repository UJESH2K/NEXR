'use client'

import dynamic from 'next/dynamic'
import { useWebGLSupport } from '@/lib/useWebGLSupport'

/**
 * ssr:false is only permitted inside a client component, which is the whole
 * reason this wrapper exists — the root layout is a server component and cannot
 * call dynamic() this way. WebGL has no meaning on the server regardless.
 */
const SceneRoot = dynamic(() => import('./SceneRoot'), { ssr: false })

export function CanvasHost() {
  const supported = useWebGLSupport()

  // null = still probing. The home page's DOM fallback covers both that and the
  // genuinely-unsupported case.
  if (!supported) return null

  return <SceneRoot />
}
