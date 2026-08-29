'use client'

import { useEffect, useState } from 'react'

/**
 * Probe for a real WebGL context rather than trusting feature detection.
 *
 * Returns null while probing — callers should treat that as "not yet known" and
 * render nothing rather than committing to a canvas they may have to tear down.
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      setSupported(Boolean(context))
    } catch {
      setSupported(false)
    }
  }, [])

  return supported
}
