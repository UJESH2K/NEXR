'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { setCursor, resetCursor } from '@/lib/cursorStore'

export type NavItem = { label: string; href: string; match?: (pathname: string) => boolean }

/**
 * The site navigation as one capsule — the same control as the beat navigator
 * on the home scene, so the two read as one system.
 *
 * Condensed it shows a live dot, the page you are on and a hairline that fills
 * as you scroll. Hover (or keyboard focus) opens it: the capsule widens, every
 * route rolls out in a row, and a marker slides to whichever name the pointer
 * is over. On a page that is not one of the routes, the condensed capsule says
 * "Menu" instead.
 */
export function NavPill({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const activeIndex = items.findIndex((item) =>
    item.match ? item.match(pathname) : pathname === item.href,
  )
  const [hover, setHover] = useState(-1)
  const pill = useRef<HTMLElement>(null)
  const lis = useRef<Array<HTMLLIElement | null>>([])
  const mark = useRef<HTMLSpanElement>(null)

  const target = hover >= 0 ? hover : activeIndex
  const targetRef = useRef(target)
  targetRef.current = target

  // Page progress on the hairline, straight to a custom property.
  useEffect(() => {
    let frame = 0
    const write = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      pill.current?.style.setProperty('--beat-progress', p.toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write)
    }
    write()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname])

  // The marker is measured, because the names are different widths and are
  // resizing while the capsule opens.
  useEffect(() => {
    const m = mark.current
    if (!m) return
    const place = () => {
      const li = lis.current[targetRef.current]
      if (!li) {
        m.style.opacity = '0'
        return
      }
      const fresh = m.style.opacity !== '1'
      if (fresh) m.style.transition = 'none'
      m.style.transform = `translate3d(${li.offsetLeft}px, 0, 0)`
      m.style.width = `${li.offsetWidth}px`
      if (fresh) {
        void m.offsetWidth
        m.style.transition = ''
      }
      m.style.opacity = li.offsetWidth > 4 ? '1' : '0'
    }
    place()
    const ro = new ResizeObserver(place)
    lis.current.forEach((li) => li && ro.observe(li))
    return () => ro.disconnect()
  }, [target])

  return (
    <nav ref={pill} className="beatpill beatpill--site" aria-label="Primary">
      <span className="beatpill__dot" aria-hidden="true" />

      {activeIndex < 0 ? (
        <span className="beatpill__count" aria-hidden="true">
          <span className="beatpill__menu">Menu</span>
        </span>
      ) : null}

      <div className="beatpill__track">
        <span ref={mark} className="beatpill__mark" aria-hidden="true" />
        <ul onPointerLeave={() => setHover(-1)}>
          {items.map((item, i) => (
            <li
              key={item.href}
              ref={(node) => {
                lis.current[i] = node
              }}
              className={i === activeIndex ? 'is-active' : undefined}
              data-lit={i === target ? 'true' : 'false'}
              onPointerEnter={() => setHover(i)}
            >
              <Link
                href={item.href}
                aria-current={i === activeIndex ? 'page' : undefined}
                onMouseEnter={() => setCursor({ active: true })}
                onMouseLeave={resetCursor}
              >
                <span className="beatpill__label">
                  <i>{item.label}</i>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <span className="beatpill__read" aria-hidden="true" />
    </nav>
  )
}
