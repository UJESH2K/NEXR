'use client'

import { usePathname } from 'next/navigation'
import { RoomNav } from './RoomNav'
import { GuideNavigator } from './GuideNavigator'
import { MeloGuide } from './MeloGuide'

/**
 * Route-level wayfinding.
 *
 * Three jobs, all off the home route:
 *
 *   - RoomNav is the Back and Home pair. It applies to every route away from
 *     home: each one is somewhere you can arrive at from a beat, and somewhere
 *     you can lose track of where you came from.
 *   - MeloGuide is the character-led guide, and it only belongs on MeloWorld's
 *     own page — everywhere else "Melo" would be a stranger giving directions.
 *   - GuideNavigator is the anonymous version of the same idea, for every other
 *     product page. The explore rooms run their own prev/next pair in the
 *     footer, so it stays out of those, and MeloWorld gets MeloGuide instead of
 *     it rather than both at once.
 */
export function SiteGuide() {
  const pathname = usePathname()
  if (pathname === '/') return null

  const isExplore = pathname.startsWith('/explore')
  const isMeloWorld = pathname === '/platform/meloworld'

  return (
    <>
      <RoomNav />

      {isMeloWorld ? <MeloGuide /> : null}

      {!isExplore && !isMeloWorld ? (
        // Desktop only. It is a floating card in the bottom corner, and on a
        // phone that corner is the page — it covered the copy on every route it
        // appeared on, and there is no corner to move it to.
        <div className="hidden lg:block">
          <GuideNavigator />
        </div>
      ) : null}
    </>
  )
}
