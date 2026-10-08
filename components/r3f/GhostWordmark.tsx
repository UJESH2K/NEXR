'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  MathUtils,
  PerspectiveCamera,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type MeshBasicMaterial,
} from 'three'
import { clamp01, damp, scroll, smoothstep } from '@/lib/scrollStore'

/**
 * The opening wordmark, drawn *inside* the scene rather than over it.
 *
 * It started life as a DOM heading behind the figure, which was wrong for one
 * unfixable reason: the overlay layer sits above the canvas, so no matter how
 * faint the type was it was painted on top of the character's head. Putting the
 * word on a plane behind the figure lets the depth buffer do the work — the
 * character occludes it exactly the way it occludes anything else in the room,
 * which is also how the reference treats its title.
 *
 * The glyphs come from a canvas rather than a 3D font: a text geometry means
 * shipping a typeface as JSON and extruding it, and this word is flat, static
 * and enormous. A texture is sharper at this size and costs one draw call.
 */

/** Plane width in world units. Wide enough to run past the frame edges. */
const WIDTH = 170
const HEIGHT = 52
/** Behind the character, which stands at z = 0. */
const Z = -34
const Y = 6

/** How much of the frame width the word may take when it has to shrink. */
const FIT = 0.9

const _toPlane = new Vector3()
const _forward = new Vector3()

type Word = { texture: CanvasTexture; /** inked width as a share of the plane */ share: number }

function wordTexture(word: string): Word {
  const canvas = document.createElement('canvas')
  // Sized to the plane's aspect so the type is never stretched, and large
  // enough that the word stays crisp when it spans the whole viewport.
  canvas.width = 2048
  canvas.height = Math.round((2048 * HEIGHT) / WIDTH)

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Playfair is loaded by next/font in the root layout; the fallbacks matter
    // because this can run before the webfont has arrived.
    ctx.font = `500 ${Math.round(canvas.height * 0.86)}px "Playfair Display", Georgia, serif`
    ctx.fillText(word, canvas.width / 2, canvas.height * 0.54)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  const share = ctx ? ctx.measureText(word).width / canvas.width : 0.75
  return { texture, share }
}

export function GhostWordmark({ word = 'NEXR' }: { word?: string }) {
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const [drawn, setDrawn] = useState<Word | null>(null)

  useEffect(() => {
    let live = true

    // Wait for the webfont, then draw. Rendering immediately would bake the
    // serif fallback into the texture and never correct itself.
    const draw = () => {
      if (!live) return
      setDrawn((previous) => {
        previous?.texture.dispose()
        return wordTexture(word)
      })
    }

    if (document.fonts?.ready) void document.fonts.ready.then(draw)
    else draw()

    return () => {
      live = false
    }
  }, [word])

  useEffect(() => () => drawn?.texture.dispose(), [drawn])

  useFrame((state, delta) => {
    const node = mesh.current
    if (!node || !material.current || !drawn) return
    const dt = Math.min(delta, 0.1)

    // Fit the whole word on a narrow screen. At its desktop size the word is
    // wider than a phone's view at this depth, so a portrait screen only ever
    // showed a cropped "EX". Measure how wide the view is where the word
    // stands and shrink it to fit; on a wide screen it already fits, so the
    // scale stays at 1 and nothing changes.
    const cam = state.camera as PerspectiveCamera
    cam.getWorldDirection(_forward)
    const depth = _toPlane.copy(node.position).sub(cam.position).dot(_forward)
    const viewW = 2 * depth * Math.tan(MathUtils.degToRad(cam.fov / 2)) * cam.aspect
    const fit = Math.min(1, (viewW * FIT) / (WIDTH * drawn.share))
    // Snapped on the first frame so a phone never sees it shrink into place;
    // eased after that, for a window being resized.
    node.scale.setScalar(node.userData.fitted ? damp(node.scale.x, fit, 6, dt) : fit)
    node.userData.fitted = true

    // Present only above the first beat, and fully gone by the time beat 01
    // comes to rest — the same curve StoryOverlay uses to move beat 01's copy
    // out of its way, so the word and the text never share the frame.
    const target = clamp01(1 - smoothstep(0.04, 0.3, scroll.sectionFloat))
    material.current.opacity = damp(
      material.current.opacity,
      // Low, because it now reads as light rather than shadow — see the colour
      // below. A dark word needs weight to be seen; a bright one needs
      // restraint, or it competes with the figure standing in front of it.
      target * 0.17,
      5,
      dt,
    )
    node.visible = material.current.opacity > 0.004

    // It rises into place as it appears and sinks as it leaves, while the
    // first beat's copy does the opposite. Plus a whisper of parallax against
    // the figure, which sells the gap between them better than blur would.
    const shown = material.current.opacity / 0.17
    node.position.x = damp(node.position.x, scroll.pointerX * -2.2, 3, dt)
    node.position.y = damp(node.position.y, Y - (1 - shown) * 7 - scroll.pointerY * 1.2, 4, dt)
  })

  if (!drawn) return null

  return (
    <mesh ref={mesh} position={[0, Y, Z]}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshBasicMaterial
        ref={material}
        map={drawn.texture}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        // Fogged like everything else at this depth, so it belongs to the room
        // rather than floating in front of it.
        fog
        // Warm and light, not dark. This started as a near-black word, which
        // worked while the sky was a mid green and became invisible the moment
        // the room went dark — a shadow on a shadow. Lifting it above the sky's
        // value instead means it reads at every beat, and the figure still cuts
        // through it because the depth buffer, not the colour, is what puts her
        // in front.
        color="#f2a878"
      />
    </mesh>
  )
}
