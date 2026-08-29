'use client'

import { useEffect, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from 'three'

/** Generates a gradient stand-in so a missing card image never blocks the
 *  scene or throws inside the render loop. */
function gradientTexture(tint: [string, string], label: string): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 640

  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, tint[0])
    gradient.addColorStop(1, tint[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // A faint frame and caption so placeholders are obviously placeholders
    // rather than looking like an intentional flat colour.
    ctx.strokeStyle = 'rgba(216, 243, 93, 0.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36)

    ctx.fillStyle = 'rgba(244, 243, 236, 0.55)'
    ctx.font = '500 22px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label.toUpperCase(), canvas.width / 2, canvas.height - 52)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * Loads a card image, starting from a generated gradient so there is never a
 * frame with no material, and keeping the gradient permanently if the file is
 * missing.
 */
export function useCardTexture(
  url: string,
  tint: [string, string],
  label: string,
): Texture {
  const [texture, setTexture] = useState<Texture>(() =>
    gradientTexture(tint, label),
  )

  useEffect(() => {
    let cancelled = false
    const loader = new TextureLoader()

    loader.load(
      url,
      (loaded) => {
        if (cancelled) {
          loaded.dispose()
          return
        }
        loaded.colorSpace = SRGBColorSpace
        loaded.anisotropy = 4
        setTexture(loaded)
      },
      undefined,
      () => {
        // Missing artwork is expected during development; keep the gradient.
      },
    )

    return () => {
      cancelled = true
    }
  }, [url])

  // Single owner of disposal: this cleanup frees the gradient when the loaded
  // image replaces it, and frees whichever texture is current on unmount.
  useEffect(() => () => texture.dispose(), [texture])

  return texture
}
