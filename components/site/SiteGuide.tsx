'use client'

import { usePathname } from 'next/navigation'
import { MeloNav } from './MeloNav'

/**
 * Route-level wayfinding: Melo, on every page that is not the scene.
 *
 * This used to be three components — RoomNav (Back/Home, bottom left),
 * GuideNavigator (a per-page orientation card, bottom right, product pages
 * only) and a MeloWorld-only guide. Three pieces of chrome in two corners,
 * covering overlapping ground. MeloNav is all three folded into one widget:
 * a contextual greeting, Back and Home, and a way to keep moving, wherever a
 * visitor actually is.
 *
 * It does not appear on the scene itself — Melo has nothing to say about a
 * page the visitor has not left yet — and it does not compete with the explore
 * rooms' own prev/next footer, which is a different, slower kind of control
 * for someone reading the whole room rather than passing through it.
 */
export function SiteGuide() {
  const pathname = usePathname()
  if (pathname === '/') return null
  return <MeloNav />
}
