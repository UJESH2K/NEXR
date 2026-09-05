'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, MoveUpRight } from 'lucide-react'

const NAV = [
  { label: 'Explore', href: '/explore' },
  { label: 'Approach', href: '/approach' },
  { label: 'MeloWorld', href: '/platform/meloworld' },
  { label: 'VR Wellness', href: '/platform/vr-wellness' },
  { label: 'Trust', href: '/trust' },
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

  return (
    <header
      className={`fixed inset-x-0 top-0 flex items-start justify-between px-6 py-5 md:px-10 ${
        overScene
          ? 'bg-transparent'
          : 'border-b border-white/10 bg-void/55 backdrop-blur-md'
      }`}
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      <Link
        href="/"
        aria-label="NEXR home"
        className="group inline-flex items-center gap-3"
      >
        <Image
          src="/brand/meloworld-mark.webp"
          alt=""
          width={192}
          height={139}
          priority
          className={`w-auto transition-opacity duration-300 group-hover:opacity-80 ${
            overScene ? 'h-9' : 'h-7'
          }`}
        />
        {/* Kept for anyone with images off, and for the accessible name. It is
            hidden visually over the scene, where the mark stands alone. */}
        <span
          className={
            overScene
              ? 'sr-only'
              : 'font-display text-lg uppercase tracking-[0.32em] text-bone'
          }
        >
          Nexr
        </span>
      </Link>

      <nav className="flex items-center gap-4 md:gap-8">
        {/* The route list is hidden over the scene. The HUD already runs a
            six-tick progress rail across the top centre, and two rows of
            navigation at the same height collide on anything narrower than a
            very wide desktop. The wordmark, the CTA and the mobile menu button
            stay, so nothing becomes unreachable. */}
        <ul className={`items-center gap-6 ${overScene ? 'hidden' : 'hidden md:flex'}`}>
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
            look like the same control, or the page reads as two designs. */}
        <Link href="/contact" className="btn-primary group">
          Start a conversation
          <MoveUpRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
        <button onClick={() => setOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-bone/70 md:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>
          <Menu size={16} />
        </button>
      </nav>
      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-4 top-[4.5rem] rounded-2xl border border-white/10 bg-[#090b09]/95 p-4 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-mono text-xs uppercase tracking-[0.2em] text-bone/70 hover:bg-white/5 hover:text-ember">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
