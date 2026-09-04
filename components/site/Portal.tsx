'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders children as a direct child of <body>.
 *
 * This is not a convenience — it is the only way these two overlays can stack
 * correctly. <main> carries `z-index: var(--z-page)`, which makes it a stacking
 * context, and a stacking context caps everything inside it: a child asking for
 * z-index 60 still cannot rise above a *sibling of main* at z-index 30. The
 * header is exactly such a sibling, so a load curtain or a modal sheet rendered
 * inside the page tree would come out underneath it no matter what number it
 * asked for.
 *
 * Portalling to body makes them siblings of the header instead, at which point
 * the z tokens in globals.css mean what they say.
 *
 * Mount is deferred by one effect because document does not exist during the
 * server render.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => setReady(true), [])

  if (!ready) return null
  return createPortal(children, document.body)
}
