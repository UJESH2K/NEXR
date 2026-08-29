'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Approach', href: '/approach' },
  { label: 'MeloWorld', href: '/platform/meloworld' },
  { label: 'VR Wellness', href: '/platform/vr-wellness' },
  { label: 'Trust', href: '/trust' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header
      className="fixed inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-10"
      style={{ zIndex: 'var(--z-chrome)' }}
    >
      <Link
        href="/"
        className="font-display text-lg tracking-[0.32em] text-bone uppercase"
      >
        Nexr
      </Link>

      <nav className="flex items-center gap-6 md:gap-8">
        <ul className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    active ? 'text-lime' : 'text-bone/55 hover:text-bone'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <Link
          href="/contact"
          className="rounded-full border border-bone/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80 transition-colors hover:border-lime hover:text-lime"
        >
          Book a Demo
        </Link>
      </nav>
    </header>
  )
}
