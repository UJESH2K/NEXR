'use client'

import { usePathname } from 'next/navigation'

/**
 * An opaque floor under every route that is not the scene.
 *
 * SceneRoot already hides the canvas the moment the route changes, which is the
 * real fix for the character flashing behind the explore rooms. This is the
 * second layer, and it covers a different gap: between one page unmounting and
 * the next painting, `main` is empty and has no background of its own, so for a
 * frame the only thing behind it is whatever the body happens to be. Moving
 * from one explore room to another is exactly that case.
 *
 * A plain fill, no transition. Anything that fades is a window in which the
 * thing underneath is visible, which is the problem rather than the solution.
 */
export function RouteBackdrop() {
  const pathname = usePathname()

  if (pathname === '/') return null

  return (
    <div
      className="pointer-events-none fixed inset-0 bg-void"
      style={{ zIndex: 'var(--z-scrim)' }}
      aria-hidden="true"
    />
  )
}
