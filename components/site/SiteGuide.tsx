'use client'

import { usePathname } from 'next/navigation'
import { Melo } from '@/components/melo/Melo'

/**
 * Melo, on every page that is not the scene. On the scene she is the figure
 * in the middle of the room; she has nothing to guide anyone through until
 * they have left it.
 */
export function SiteGuide() {
  const pathname = usePathname()
  if (pathname === '/') return null
  return <Melo />
}
