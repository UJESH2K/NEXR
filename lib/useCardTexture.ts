'use client'

import { useEffect, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from 'three'

/**
 * Panel artwork, loaded once per URL and shared by every panel that wants it.
 *
 * The cache is the point. The scene draws forty-odd panels from a deck of six
 * images, so loading per-component would upload the same picture to the GPU
 * seven times over and pay the decode seven times on top. One texture per URL,
 * kept for the lifetime of the page, is both faster and simpler than reference
 * counting — the deck is fixed and small, and nothing ever needs freeing.
 */

const cache = new Map<string, Texture>()
const pending = new Map<string, Promise<Texture | null>>()
const gradients = new Map<string, Texture>()

/**
 * Generated stand-in so a missing image never blocks a render or throws inside
 * the frame loop.
 *
 * Cached by palette rather than per component: the deck has six palettes and
 * the scene has forty panels, and an uncached version left one orphaned canvas
 * texture on the GPU for every panel whose artwork arrived and replaced it.
 */
function gradientTexture(tint: [string, string], label: string): Texture {
  const key = `${tint[0]}|${tint[1]}|${label}`
  const existing = gradients.get(key)
  if (existing) return existing

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 320

  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, tint[0])
    gradient.addColorStop(1, tint[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // A faint frame and caption, so a placeholder is obviously a placeholder
    // rather than looking like an intentional flat colour.
    ctx.strokeStyle = 'rgba(216, 243, 93, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28)

    ctx.fillStyle = 'rgba(244, 243, 236, 0.5)'
    ctx.font = '500 20px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label.toUpperCase(), canvas.width / 2, canvas.height - 40)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  gradients.set(key, texture)
  return texture
}

function load(url: string): Promise<Texture | null> {
  const inFlight = pending.get(url)
  if (inFlight) return inFlight

  const promise = new Promise<Texture | null>((resolve) => {
    new TextureLoader().load(
      url,
      (texture) => {
        texture.colorSpace = SRGBColorSpace
        texture.anisotropy = 4
        cache.set(url, texture)
        resolve(texture)
      },
      undefined,
      // Missing artwork is expected during development; the caller keeps its
      // gradient rather than rendering an untextured white plane.
      () => resolve(null),
    )
  })

  pending.set(url, promise)
  return promise
}

export function useCardTexture(
  url: string,
  tint: [string, string],
  label: string,
): Texture {
  // Starting from a gradient means there is never a frame with no material,
  // which matters here because the panels are already fading in on scroll and
  // a one-frame white flash would land right in the middle of that.
  const [texture, setTexture] = useState<Texture>(
    () => cache.get(url) ?? gradientTexture(tint, label),
  )

  useEffect(() => {
    const cached = cache.get(url)
    if (cached) {
      setTexture(cached)
      return
    }

    let live = true
    void load(url).then((loaded) => {
      if (live && loaded) setTexture(loaded)
    })

    return () => {
      live = false
    }
  }, [url])

  return texture
}
