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
  // The explore rooms run their own chapter rail down the left and their own
  // prev/next pair in the footer, and the card lands on top of the second one.
  if (pathname.startsWith('/explore')) return null
  return (
    // Desktop only. It is a floating card in the bottom corner, and on a phone
    // that corner is the page — it covered the copy on every route it appeared
    // on, and there is no corner to move it to.
    <div className="hidden lg:block">
      <GuideNavigator />
    </div>
  )
}
