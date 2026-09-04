'use client'

import { usePathname } from 'next/navigation'
import { GuideNavigator } from './GuideNavigator'

/**
 * Route gate for the navigator card.
 *
 * The home experience puts its own instruments in the bottom-right corner — the
 * progress bar, the percentage and the social links — and the navigator card
 * lands on top of them. Off the home route there is no such conflict and the
 * card is the main wayfinding aid, so it stays.
 */
export function SiteGuide() {
  const pathname = usePathname()
  if (pathname === '/') return null
  return <GuideNavigator />
}
