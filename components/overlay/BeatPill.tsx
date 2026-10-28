'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { SECTIONS, SECTION_COUNT } from '@/lib/sections'
import { scroll, scrollCommands } from '@/lib/scrollStore'
import { useScrollSnapshot } from '@/lib/useScrollSnapshot'
import { setCursor, resetCursor } from '@/lib/cursorStore'

/**
 * The beat navigator: one capsule at the top of the scene, naming where you
 * are and letting you jump anywhere.
 *
 * It replaces a rail of six dots flanked by "01" and "06". The dots carried a
 * number and nothing else, so arriving at the site you could see there were
 * six of something without being told what any of them were — and a visitor
 * does not want to guess what 04 is, they want to read "Our Approach". Every
 * beat here is named, in the script's own words.
 *
 * Three states:
 *
 *   - **Condensed**, which is how it sits while you read: a live dot, the
 *     name of the beat you are in, and a hairline along the bottom
 *     that fills as you move through that beat and starts again at the next.
 *   - **Open**, on hover or keyboard focus: the capsule widens and every beat
 *     appears in one row, with a marker behind the one you are in that slides
 *     to whichever name the pointer is over.
 *   - **Listed**, on a phone: there is no hover there and six names will not
 *     fit across 390px, so the capsule is a button and a tap drops the six
 *     below it as full-height rows.
 *
 * Nothing here measures the document. The scene already keeps one number for
 * how far through a beat the scroll is (`scroll.segmentProgress`) and one for
 * which beat owns it, so the hairline is written from the gsap ticker like the
 * rest of the HUD and React is only told when the beat itself changes.
 */

export function BeatPill() {
  const { activeCard } = useScrollSnapshot()
  const [hover, setHover] = useState(-1)
  const [listed, setListed] = useState(false)

  const root = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLElement>(null)
  const items = useRef<Array<HTMLLIElement | null>>([])
  const mark = useRef<HTMLSpanElement>(null)

  // The marker follows the pointer when there is one on a name, and otherwise
  // sits on the beat being read.
  const target = hover >= 0 ? hover : activeCard
  const targetRef = useRef(target)
  targetRef.current = target

  /*
   * The hairline.
   *
   * Straight to a custom property from the ticker. This runs every frame while
   * scrolling, and a React render per frame to move one scaleX is the
   * expensive way to do it.
   */
  useEffect(() => {
    let last = -1
    const tick = () => {
      const p = scroll.segmentProgress
      if (Math.abs(p - last) < 0.002) return
      last = p
      pill.current?.style.setProperty('--beat-progress', p.toFixed(4))
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  /*
   * The marker.
   *
   * Measured rather than declared, because the names it sits behind are
   * different widths and are themselves mid-transition while the capsule
   * opens. A ResizeObserver on the items keeps it on its name throughout,
   * instead of only at the two ends of the animation.
   */
  useEffect(() => {
    const m = mark.current
    if (!m) return

    const place = () => {
      const li = items.current[targetRef.current]
      if (!li) {
        m.style.opacity = '0'
        return
      }
      // Arriving on a name that was collapsed to nothing should not be
      // animated from wherever the marker happened to be sitting.
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
    items.current.forEach((li) => li && ro.observe(li))
    return () => ro.disconnect()
  }, [target])

  /*
   * The phone list is closed by anything that means "not this": a tap outside
   * it, Escape, or the page moving on to another beat underneath it.
   */
  useEffect(() => {
    if (!listed) return

    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setListed(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setListed(false)
    }

    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [listed])

  useEffect(() => setListed(false), [activeCard])

  const go = (index: number) => {
    setListed(false)
    scrollCommands.goToSection(index)
  }

  const hoverable = {
    onMouseEnter: () => setCursor({ active: true }),
    onMouseLeave: () => resetCursor(),
  }

  const active = SECTIONS[Math.min(activeCard, SECTION_COUNT - 1)] ?? SECTIONS[0]

  return (
    <div ref={root} className="beatnav" data-listed={listed ? 'true' : 'false'}>
      <nav ref={pill} className="beatpill" aria-label="Beats">
        {/* The whole capsule, as one control, for the screens that open the
            list instead of the row. It is drawn over the condensed capsule and
            removed above lg, where hovering does the same job. */}
        <button
          type="button"
          className="beatpill__handle"
          aria-expanded={listed}
          aria-label={`${active.word}. Show every part of the story`}
          onClick={() => setListed((value) => !value)}
        />

        <span className="beatpill__dot" aria-hidden="true" />

        <div className="beatpill__track">
          <span ref={mark} className="beatpill__mark" aria-hidden="true" />
          <ul onPointerLeave={() => setHover(-1)}>
            {SECTIONS.map((section, i) => (
              <li
                key={section.id}
                ref={(node) => {
                  items.current[i] = node
                }}
                className={i === activeCard ? 'is-active' : undefined}
                data-lit={i === target ? 'true' : 'false'}
                onPointerEnter={() => setHover(i)}
              >
                <button
                  type="button"
                  onClick={() => go(i)}
                  {...hoverable}
                  aria-current={i === activeCard ? 'true' : undefined}
                >
                  {/* The name, with a copy of itself stacked below by a text
                      shadow, so hover rolls the label over rather than merely
                      recolouring it. */}
                  <span className="beatpill__label">
                    <i>{section.word}</i>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <span className="beatpill__read" aria-hidden="true" />
      </nav>

      {/* The same six, as rows, for the screens the row cannot fit on. */}
      <ul className="beatnav__list">
        {SECTIONS.map((section, i) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === activeCard ? 'true' : undefined}
              className={i === activeCard ? 'is-active' : undefined}
            >
              <span className="beatnav__word">{section.word}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
