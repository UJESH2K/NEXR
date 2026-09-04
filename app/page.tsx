'use client'

import { HomeScrollDriver } from '@/components/overlay/HomeScrollDriver'
import { IdleHints } from '@/components/overlay/IdleHints'
import { PanelDetail } from '@/components/overlay/PanelDetail'
import { SceneHud } from '@/components/overlay/SceneHud'
import { StoryOverlay } from '@/components/overlay/StoryOverlay'
import { Preloader } from '@/components/site/Preloader'
import { StaticHome } from '@/components/site/StaticHome'
import { useAmbience } from '@/lib/useAmbience'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useWebGLSupport } from '@/lib/useWebGLSupport'

export default function HomePage() {
  const reduced = useReducedMotion()
  const webgl = useWebGLSupport()
  const ambience = useAmbience()

  // `null` means the WebGL probe has not run yet — it needs an effect, so it is
  // never resolved on the very first render. Committing to the DOM fallback
  // during that window is what used to make the old static page flash on every
  // refresh before the scene took over. Rendering nothing but the curtain is
  // the fix: the curtain is opaque, so the decision happens out of sight.
  const immersive = webgl === true && !reduced

  return (
    <>
      {/* Always mounted, and always the first child: keeping it in the same
          position across both branches means the probe resolving does not
          unmount and restart the curtain halfway through its own count. */}
      <Preloader waitForAssets={immersive} />

      {webgl === null ? null : !immersive ? (
        <StaticHome />
      ) : (
        <>
          <HomeScrollDriver />
          <StoryOverlay />
          <IdleHints />
          <SceneHud audioOn={ambience.on} onToggleAudio={ambience.toggle} />
          <PanelDetail />
        </>
      )}
    </>
  )
}
