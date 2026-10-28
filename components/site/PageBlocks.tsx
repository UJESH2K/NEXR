'use client'

import Link from 'next/link'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Mail, Plus } from 'lucide-react'
import { setCursor, resetCursor } from '@/lib/cursorStore'
import { CONTACT_EMAIL } from '@/lib/contact'

/**
 * The interactive pieces the interior pages are built from. Each page uses a
 * different one, so Approach, Trust and Let's Talk do not read as the same
 * template with different words in it.
 */

const EASE = [0.16, 1, 0.3, 1] as const

const hoverable = {
  onMouseEnter: () => setCursor({ active: true }),
  onMouseLeave: () => resetCursor(),
}

/* ── tabs with a picture that changes ───────────────────────────────────── */

export type PillarTab = {
  id: string
  label: string
  icon: ReactNode
  body: string
  image: string
  link: { label: string; href: string }
}

export function PillarTabs({ tabs }: { tabs: PillarTab[] }) {
  const [active, setActive] = useState(0)
  const base = useId()
  const tab = tabs[active]

  return (
    <div data-beat-item className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
      <div>
        <div role="tablist" aria-label="Our approach" className="flex flex-col gap-2">
          {tabs.map((t, i) => {
            const selected = i === active
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${base}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${base}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault()
                    setActive((i + 1) % tabs.length)
                    document.getElementById(`${base}-tab-${(i + 1) % tabs.length}`)?.focus()
                  }
                  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault()
                    const n = (i - 1 + tabs.length) % tabs.length
                    setActive(n)
                    document.getElementById(`${base}-tab-${n}`)?.focus()
                  }
                }}
                {...hoverable}
                className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-500 ${
                  selected
                    ? 'border-ember/60 bg-ember/[0.08]'
                    : 'border-white/10 bg-ink/40 hover:border-white/25'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${
                    selected ? 'bg-ember text-ink' : 'bg-white/[0.05] text-bone/60'
                  }`}
                >
                  {t.icon}
                </span>
                <span className={`font-display text-[1.3rem] leading-snug ${selected ? 'text-bone' : 'text-bone/70'}`}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${active}`}
        className="relative isolate min-h-[26rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#a95e1f] to-[#361c08]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={tab.image}
            src={tab.image}
            alt=""
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/10" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-x-0 bottom-0 p-7 md:p-9"
          >
            <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] text-bone">{tab.label}</h3>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.8] text-sand/80">{tab.body}</p>
            <Link href={tab.link.href} {...hoverable} className="btn-ghost group mt-6">
              {tab.link.label}
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── two lines set against each other ───────────────────────────────────── */

export function Contrast({ less, more }: { less: string; more: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div
        data-beat-item
        className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink/50 p-8 md:p-12"
      >
        <span aria-hidden="true" className="block h-px w-12 bg-bone/30" />
        <p className="mt-8 text-balance font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.15] text-bone/55">
          {less}
        </p>
      </div>
      <div
        data-beat-item
        className="relative overflow-hidden rounded-[1.75rem] border border-ember/40 bg-gradient-to-br from-ember/[0.16] to-ember/[0.03] p-8 md:p-12"
      >
        <span aria-hidden="true" className="block h-px w-12 bg-ember" />
        <p className="mt-8 text-balance font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.15] text-bone">
          {more}
        </p>
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-ember/20 blur-3xl" />
      </div>
    </div>
  )
}

/* ── accordion ──────────────────────────────────────────────────────────── */

export type AccordionItem = { id: string; title: string; body: string; icon: ReactNode }

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null)
  const base = useId()

  return (
    <ul className="divide-y divide-white/10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink/50">
      {items.map((item) => {
        const expanded = open === item.id
        return (
          <li key={item.id} data-beat-item>
            <h3>
              <button
                type="button"
                id={`${base}-${item.id}-btn`}
                aria-expanded={expanded}
                aria-controls={`${base}-${item.id}`}
                onClick={() => setOpen(expanded ? null : item.id)}
                {...hoverable}
                className="flex w-full items-center gap-4 px-6 py-6 text-left md:px-8"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                    expanded ? 'border-ember bg-ember/10 text-ember' : 'border-white/15 text-bone/55'
                  }`}
                >
                  {item.icon}
                </span>
                <span className={`flex-1 font-display text-[clamp(1.2rem,2vw,1.5rem)] leading-snug transition-colors ${expanded ? 'text-bone' : 'text-bone/75'}`}>
                  {item.title}
                </span>
                <Plus
                  aria-hidden="true"
                  size={18}
                  className={`shrink-0 transition-transform duration-500 ${expanded ? 'rotate-45 text-ember' : 'text-bone/45'}`}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={`${base}-${item.id}`}
                  role="region"
                  aria-labelledby={`${base}-${item.id}-btn`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[64ch] px-6 pb-7 pl-[5.5rem] text-[15px] leading-[1.8] text-sand/75 md:px-8 md:pl-[6rem]">
                    {item.body}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}

/* ── a wide link card to another page ───────────────────────────────────── */

export function FeatureLink({
  title,
  body,
  image,
  href,
  label,
}: {
  title: string
  body: string
  image: string
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      data-beat-item
      {...hoverable}
      className="group relative grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink/50 transition-colors hover:border-white/25 md:grid-cols-[0.8fr_1.2fr]"
    >
      <div className="relative isolate aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#a25f20] to-[#321c08] md:aspect-auto">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-90 mix-blend-luminosity transition-transform duration-[1.2s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/60" />
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <h3 className="text-balance font-display text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.15] text-bone">{title}</h3>
        <p className="mt-4 max-w-[54ch] text-[15px] leading-[1.8] text-sand/70">{body}</p>
        <span className="mt-7 inline-flex items-center gap-2 text-[14px] font-medium text-ember">
          {label}
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}

/* ── demo request ───────────────────────────────────────────────────────── */

/**
 * There is no form backend, so the form composes an email instead: the
 * fields are written into a message to the NEXR inbox and the visitor's own
 * mail app opens with it ready to send. Nothing is stored or sent from here.
 */
export function DemoForm() {
  const [sent, setSent] = useState(false)
  const base = useId()

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const get = (k: string) => String(data.get(k) ?? '').trim()
    const lines = [
      `Name: ${get('name')}`,
      `Email: ${get('email')}`,
      `Organisation: ${get('organisation')}`,
      `Setting: ${get('setting')}`,
      '',
      get('message'),
    ]
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Book a demo')}&body=${encodeURIComponent(lines.join('\n'))}`
    window.location.href = href
    setSent(true)
  }

  const field =
    'mt-2 w-full rounded-xl border border-white/12 bg-void/40 px-4 py-3.5 text-[15px] text-bone placeholder:text-bone/30 outline-none transition-colors focus:border-ember/70 focus:bg-void/60'

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      data-beat-item
      className="rounded-[1.75rem] border border-white/10 bg-ink/60 p-6 md:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-[13px] font-medium text-bone/70" htmlFor={`${base}-name`}>
          Name
          <input id={`${base}-name`} name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block text-[13px] font-medium text-bone/70" htmlFor={`${base}-email`}>
          Work email
          <input id={`${base}-email`} name="email" type="email" required autoComplete="email" className={field} />
        </label>
        <label className="block text-[13px] font-medium text-bone/70" htmlFor={`${base}-org`}>
          Organisation
          <input id={`${base}-org`} name="organisation" autoComplete="organization" className={field} />
        </label>
        <label className="block text-[13px] font-medium text-bone/70" htmlFor={`${base}-setting`}>
          Setting
          <select id={`${base}-setting`} name="setting" defaultValue="Workplace" className={`${field} appearance-none`}>
            <option>Workplace</option>
            <option>Educational Institute</option>
            <option>Healthcare</option>
          </select>
        </label>
      </div>
      <label className="mt-5 block text-[13px] font-medium text-bone/70" htmlFor={`${base}-msg`}>
        Message
        <textarea id={`${base}-msg`} name="message" rows={4} className={`${field} resize-y`} />
      </label>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" {...hoverable} className="btn-primary group">
          <Mail size={14} />
          Book A Demo
        </button>
        <a href={`mailto:${CONTACT_EMAIL}`} {...hoverable} className="text-[14px] text-bone/60 transition-colors hover:text-ember">
          {CONTACT_EMAIL}
        </a>
      </div>

      <p role="status" aria-live="polite" className="mt-5 min-h-[1.5rem] text-[14px] text-sand/70">
        {sent ? (
          <span className="inline-flex items-center gap-2">
            <Check size={15} className="text-ember" />
            Your email app should now be open with this message ready to send.
          </span>
        ) : null}
      </p>
    </form>
  )
}
