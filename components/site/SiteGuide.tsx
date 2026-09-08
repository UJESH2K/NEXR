'use client'

import { usePathname } from 'next/navigation'
import { BackToScene } from './BackToScene'
import { GuideNavigator } from './GuideNavigator'

/**
 * Route-level wayfinding.
 *
 * Two separate jobs that both live off the home route:
 *
 *   - BackToScene returns the visitor to the exact beat they left the scene
 *     from. It applies to every route away from home, because every one of them
 *     is somewhere you can arrive at from a beat.
 *   - GuideNavigator is the floating orientation card. The home experience puts
 *     its own instruments in the bottom-right corner and the explore rooms run
 *     their own prev/next pair in the footer, so it stays out of both.
 */
export function SiteGuide() {
  const pathname = usePathname()
  if (pathname === '/') return null

  return (
    <>
      <BackToScene />

      {pathname.startsWith('/explore') ? null : (
        // Desktop only. It is a floating card in the bottom corner, and on a
        // phone that corner is the page — it covered the copy on every route it
        // appeared on, and there is no corner to move it to.
        <div className="hidden lg:block">
          <GuideNavigator />
        </div>
      )}
    </>
  )
}
