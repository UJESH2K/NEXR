'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, type PerspectiveCamera } from 'three'
import { ACT, easeInOutCubic, lerp, remap, scroll } from '@/lib/scrollStore'

/** Camera look-at Y. Character sits at Y=-14; camera at Y=2, lookAt Y=3
 *  puts the character's upper body in the lower-centre of the frame. */
export const LOOK_Y = 3

const SMOOTHING = 4

type Pose = { radius: number; height: number; fov: number }

function poseFor(progress: number): Pose {
  if (progress < ACT.distantEnd) {
    return { radius: 80, height: 2, fov: 43 }
  }

  if (progress < ACT.approachEnd) {
    const t = easeInOutCubic(remap(progress, ACT.distantEnd, ACT.approachEnd))
    return {
      radius: 80,
      height: 2,
      fov: lerp(43, 33, t),
    }
  }

  if (progress < ACT.orbitEnd) {
    return { radius: 80, height: 2, fov: 33 }
  }

  const t = easeInOutCubic(remap(progress, ACT.orbitEnd, 1))
  return {
    radius: lerp(80, 100, t),
    height: lerp(2, 3, t),
    fov: lerp(33, 38, t),
  }
}

export function CameraRig({ reduced = false }: { reduced?: boolean }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const pose = useRef<Pose>({ radius: 80, height: 2, fov: 43 })
  const primed = useRef(false)

  useFrame((_, delta) => {
    const target = reduced
      ? { radius: 80, height: 2, fov: 43 }
      : poseFor(scroll.homeProgress)

    const current = pose.current

    if (!primed.current) {
      Object.assign(current, target)
      primed.current = true
    }

    current.radius = MathUtils.damp(current.radius, target.radius, SMOOTHING, delta)
    current.height = MathUtils.damp(current.height, target.height, SMOOTHING, delta)
    current.fov = MathUtils.damp(current.fov, target.fov, SMOOTHING, delta)

    camera.position.set(0, current.height, current.radius)
    camera.lookAt(0, LOOK_Y, 0)

    if (Math.abs(camera.fov - current.fov) > 0.001) {
      camera.fov = current.fov
      camera.updateProjectionMatrix()
    }

    scroll.camAzimuth = 0
    scroll.camRadius = current.radius
    scroll.camFov = current.fov
  })

  return null
}
