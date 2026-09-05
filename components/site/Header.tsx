'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, MoveUpRight, X } from 'lucide-react'

const NAV = [
  { label: 'Explore', href: '/explore' },
  { label: 'Approach', href: '/approach' },
  { label: 'MeloWorld', href: '/platform/meloworld' },
  { label: 'VR Wellness', href: '/platform/vr-wellness' },
  { label: 'Trust', href: '/trust' },
]

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // On the home route the header floats over a full-bleed 3D room, so it drops
  // its bar entirely — a rule and a blurred panel across the top would cut the
  // sky in half and break the illusion of standing inside the scene. On every
  // other route the page scrolls underneath it and the bar is what keeps the
  // navigation legible.
  const overScene = pathname === '/'

  // A route change with the sheet still open leaves it covering the page it
  // just navigated to.
  useEffect(() => setOpen(false), [pathname])

  // The sheet covers the viewport on a phone, so the page behind it must not
  // scroll under the fingers.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <header
      className={`safe-top fixed inset-x-0 top-0 flex items-start justify-between gap-3 px-4 py-4 md:px-10 md:py-5 ${
        overScene
          ? 'bg-transparent'
          : 'border-b border-white/10 bg-void/55 backdrop-blur-md'
      }`}
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      <Link
        href="/"
        aria-label="NEXR home"
        className="group inline-flex shrink-0 items-center gap-3"
      >
        <Image
          src="/brand/meloworld-mark.webp"
          alt=""
          width={192}
          height={139}
          priority
          className={`w-auto transition-opacity duration-300 group-hover:opacity-80 ${
            overScene ? 'h-8 md:h-9' : 'h-7'
          }`}
        />
        {/* Kept for anyone with images off, and for the accessible name. It is
            hidden visually over the scene, where the mark stands alone, and on
            phones, where the mark plus a wordmark plus a control does not fit
            across the width. */}
        <span
          className={
            overScene
              ? 'sr-only'
              : 'hidden font-display text-lg uppercase tracking-[0.32em] text-bone lg:inline'
          }
        >
          Nexr
        </span>
      </Link>

      <nav className="flex min-w-0 items-center gap-3 md:gap-8">
        {/* The route list is hidden over the scene. The HUD already runs a
            six-tick progress rail across the top centre, and two rows of
            navigation at the same height collide on anything narrower than a
            very wide desktop. The wordmark, the CTA and the mobile menu button
            stay, so nothing becomes unreachable. */}
        <ul className={`items-center gap-6 ${overScene ? 'hidden' : 'hidden lg:flex'}`}>
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    active ? 'text-ember' : 'text-bone/55 hover:text-bone'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Same treatment as Explore. Two primary controls in one frame have to
            look like the same control, or the page reads as two designs.

            The label shortens on a phone rather than the button shrinking: at
            390px "Start a conversation" pushed the menu button off the screen
            entirely, and a call to action nobody can reach is worse than a
            terse one. */}
        <Link href="/contact" className="btn-primary btn-primary--compact group">
          <span className="lg:hidden">Book a demo</span>
          <span className="hidden lg:inline">Start a conversation</span>
          <MoveUpRight
            size={13}
            className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>

        <button
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-bone/70 lg:hidden"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="safe-bottom absolute inset-x-3 top-[4.6rem] max-h-[calc(100svh-6rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#090b09]/97 p-4 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-4 font-mono text-xs uppercase tracking-[0.2em] text-bone/75 hover:bg-white/5 hover:text-ember"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Contact belongs in the list as well as in the button: on a
                  phone the sheet is where people look for a route to a human. */}
              <li>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ember hover:bg-white/5"
                >
                  Contact
                </Link>
              </li>
            </ul>

            <div className="mt-4 flex items-center gap-5 border-t border-white/10 px-4 pt-4">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45 hover:text-ember"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
