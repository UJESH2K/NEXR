import {
  CLOSING as SHARED_CLOSING,
  EXPLORE_TOPICS,
  getExploreTopic,
  getNextTopic,
  type ExploreTopic,
} from '@/lib/explore'
import { sectionById } from '@/lib/sections'
import type { MeloBubble, MeloPose } from './store'

/**
 * Everything Melo says, in one file.
 *
 * Two kinds of line live here, and they are kept apart on purpose:
 *
 *   - Content lines are never written here. A room's title, a chapter's label,
 *     the closing call to action — all of it is read from lib/explore.ts and
 *     the approved copy, so Melo can only ever repeat the brief.
 *   - Wayfinding lines are written here, and only describe the interface:
 *     where a button goes, what tapping something does. They make no claim
 *     about NEXR itself.
 *
 * If a line needs changing, it changes here; no component holds copy of its own.
 */

/** Closing CTA — the content document's Let's Talk block, shared with every page. */
export const CLOSING = {
  headline: SHARED_CLOSING.heading,
  note: SHARED_CLOSING.body,
  action: SHARED_CLOSING.action,
}

/** Which expression suits which moment. Pose numbers match the scene's beats. */
export const EXPRESSION = {
  hello: 5 as MeloPose, // the big wave
  connect: 6 as MeloPose, // small wave, hand on heart
  point: 1 as MeloPose, // arm out, presenting
  offer: 3 as MeloPose, // open hand
  explain: 4 as MeloPose, // open palm, hand on hip
  think: 2 as MeloPose, // hand to chin
}

export type TourStep = {
  target: string
  title: string
  text: string
  pose: MeloPose
}

export type RouteContext = {
  key: string
  pose: MeloPose
  label: string
  message: string
  room: ExploreTopic | null
  next: { href: string; label: string } | null
  isLast: boolean
  /** One of the three audience pages. */
  isAudience: boolean
  tour: TourStep[]
}

/**
 * The three audiences, straight from the beat that carries them.
 *
 * That is the VR Wellness beat now — the script places the audience block
 * directly after the VR Wellness copy rather than giving it a beat of its own.
 * The label is written here rather than read off the beat's `word` for the
 * same reason: the host beat is called "VR Wellness", which is not what this
 * list of three is.
 */
export const AUDIENCES = (sectionById('vr-wellness').tiles ?? []).map((t) => ({ label: t.title, href: t.href }))
export const AUDIENCE_LABEL = 'Who It’s For'

const BACK_STEP: TourStep = {
  target: '[data-tour="header-back"]',
  title: 'Back',
  text: 'Takes you back to the exact moment you left the story on the home page.',
  pose: EXPRESSION.point,
}

const HOME_STEP: TourStep = {
  target: '[data-tour="header-home"]',
  title: 'Home',
  text: 'Starts the story on the home page again from the beginning.',
  pose: EXPRESSION.point,
}

const DEMO_STEP: TourStep = {
  target: '[data-tour="header-demo"]',
  title: 'Get in touch',
  text: 'This button is on every page. Use it whenever you want to talk to the team or book a demo.',
  pose: EXPRESSION.offer,
}

const MENU_STEP: TourStep = {
  target: '[data-tour="header-menu"]',
  title: 'Every page',
  text: 'Open the menu to jump to any page on the site.',
  pose: EXPRESSION.point,
}

const MELO_STEP: TourStep = {
  target: '[data-tour="melo"]',
  title: 'Any time you need me',
  text: 'Tap me for the next part, a way back to where you were, or to start over.',
  pose: EXPRESSION.connect,
}

/**
 * Opens the tour that starts by itself on a visitor's first sub page. It is
 * not added when someone replays the tour from the menu — they already know
 * who is talking.
 */
export const WELCOME_STEP: TourStep = {
  target: '[data-tour="melo"]',
  title: "Hi, I'm Melo",
  text: "There's a lot on this page, so let me show you around. It only takes a moment, and you can skip at any point.",
  pose: EXPRESSION.hello,
}

function roomTour(topic: ExploreTopic): TourStep[] {
  const next = getNextTopic(topic.slug)
  const steps: TourStep[] = [
    {
      target: '[data-tour="room-intro"]',
      title: topic.word,
      text: 'Each part of the story on the home page opens into a room like this one. This is where it is told in full.',
      pose: EXPRESSION.point,
    },
  ]
  if (topic.chapters.length) {
    steps.push({
      target: '[data-tour="room-chapters"]',
      title: 'In this room',
      text: 'These are the chapters. Tap one to jump straight to it.',
      pose: EXPRESSION.explain,
    })
  }
  steps.push(BACK_STEP, HOME_STEP, MENU_STEP, DEMO_STEP, {
    target: '[data-tour="room-next"]',
    title: 'Next room',
    text: `At the end of the room, carry on to ${next.word}, or step back to the one before.`,
    pose: EXPRESSION.offer,
  })
  steps.push(MELO_STEP)
  return steps
}

const PAGE_TOUR: TourStep[] = [
  {
    target: '[data-tour="page-intro"]',
    title: 'This page',
    text: 'Start here, then scroll down to read on.',
    pose: EXPRESSION.point,
  },
  BACK_STEP,
  HOME_STEP,
  MENU_STEP,
  DEMO_STEP,
  MELO_STEP,
]

const INDEX_TOUR: TourStep[] = [
  {
    target: '[data-tour="explore-list"]',
    title: 'Every room',
    text: 'One room for each part of the story. Point at a name to preview it, then pick one to start reading.',
    pose: EXPRESSION.point,
  },
  BACK_STEP,
  HOME_STEP,
  MENU_STEP,
  DEMO_STEP,
  MELO_STEP,
]

type PageEntry = { label: string; message: string; pose: MeloPose }

/** Messages here are the pages' own headlines, not new copy. */
const PAGES: Record<string, PageEntry> = {
  '/approach': {
    label: 'Our Approach',
    message: 'Different people. Different needs. A more human approach.',
    pose: 2,
  },
  '/trust': {
    label: 'Built on Trust',
    message: 'Feel safe enough to take the first step.',
    pose: 4,
  },
  '/contact': { label: 'Let’s Talk', message: CLOSING.headline, pose: 6 },
}

export function routeContext(pathname: string): RouteContext {
  if (pathname.startsWith('/explore/')) {
    const topic = getExploreTopic(pathname.split('/')[2] ?? '')
    if (topic) {
      const next = getNextTopic(topic.slug)
      const isLast = topic.slug === EXPLORE_TOPICS[EXPLORE_TOPICS.length - 1].slug
      return {
        key: `room:${topic.slug}`,
        pose: (EXPLORE_TOPICS.indexOf(topic) + 1) as MeloPose,
        label: topic.word,
        message: topic.title,
        room: topic,
        next: isLast ? null : { href: `/explore/${next.slug}`, label: `Continue to ${next.word}` },
        isLast,
        isAudience: false,
        tour: roomTour(topic),
      }
    }
  }

  if (pathname === '/explore') {
    return {
      key: 'page:/explore',
      pose: 1,
      label: 'Explore',
      message: 'Pick a room to start reading.',
      room: null,
      next: { href: `/explore/${EXPLORE_TOPICS[0].slug}`, label: `Start with ${EXPLORE_TOPICS[0].word}` },
      isLast: false,
      isAudience: false,
      tour: INDEX_TOUR,
    }
  }

  const page = PAGES[pathname]
  return {
    key: `page:${pathname}`,
    pose: page?.pose ?? 1,
    label: page?.label ?? 'NEXR',
    message: page?.message ?? 'Tap a button below to keep moving.',
    room: null,
    next: null,
    isLast: pathname === '/contact',
    isAudience: false,
    tour: PAGE_TOUR,
  }
}

/** Every later arrival: a short hello that says where you are, then gets out of the way. */
export function arrivalBubble(ctx: RouteContext): MeloBubble {
  if (ctx.isLast) return connectBubble('arrival', 'arrival')
  return {
    id: 'arrival',
    kind: 'arrival',
    pose: ctx.pose,
    label: `You're in ${ctx.label}`,
    text: ctx.message,
    // One way straight to the three audience pages, from every page that is
    // not already one of them.
    actions: ctx.isAudience ? undefined : [{ label: AUDIENCE_LABEL, kind: 'audiences' }],
    ttl: ctx.isAudience ? 5000 : 8000,
    compact: true,
  }
}

/** The three audiences as quick links, under the beat's own headline. */
export function audiencesBubble(): MeloBubble {
  return {
    id: 'audiences',
    kind: 'nudge',
    pose: EXPRESSION.offer,
    label: AUDIENCE_LABEL,
    text: sectionById('vr-wellness').headline,
    links: AUDIENCES,
  }
}

/** "Hey, let's connect" — the brief's closing call to action, in Melo's voice. */
export function connectBubble(id: string, kind: MeloBubble['kind'] = 'nudge'): MeloBubble {
  return {
    id,
    kind,
    pose: EXPRESSION.connect,
    label: "Hey! Let's connect",
    text: CLOSING.note,
    actions: [
      { label: CLOSING.action, kind: 'contact' },
      { label: 'Not now', kind: 'dismiss' },
    ],
    ttl: 14000,
  }
}

/**
 * What to say when the visitor has gone quiet.
 *
 * Picked from where they are rather than from a fixed rota, so the nudge is
 * always about the thing on screen: the next chapter while reading, the next
 * room at the end, the demo on the last page.
 */
export function idleBubble(ctx: RouteContext, chapterId: string | null, count: number): MeloBubble | null {
  if (ctx.isLast) return connectBubble(`idle-connect-${count}`)

  const room = ctx.room
  if (room && chapterId) {
    const i = room.chapters.findIndex((c) => c.id === chapterId)
    const upcoming = i >= 0 ? room.chapters[i + 1] : undefined
    if (upcoming) {
      return {
        id: `idle-chapter-${upcoming.id}`,
        kind: 'nudge',
        pose: EXPRESSION.think,
        label: 'Next in this room',
        text: upcoming.navLabel ?? upcoming.heading,
        actions: [
          { label: 'Take me there', kind: 'scroll', target: `#${upcoming.id}` },
          { label: 'Not now', kind: 'dismiss' },
        ],
        ttl: 12000,
      }
    }
  }

  if (count >= 1) return connectBubble(`idle-connect-${count}`)

  if (ctx.next) {
    return {
      id: 'idle-next',
      kind: 'nudge',
      pose: EXPRESSION.offer,
      label: 'Still with me?',
      text: ctx.next.label.replace('Continue to', 'Up next:'),
      actions: [
        { label: 'Continue', kind: 'href', href: ctx.next.href },
        { label: 'Show me around', kind: 'tour' },
      ],
      ttl: 12000,
    }
  }

  return {
    id: 'idle-help',
    kind: 'nudge',
    pose: EXPRESSION.hello,
    label: 'Still with me?',
    text: 'I can show you around this page, or take you to the next part.',
    actions: [
      { label: 'Show me around', kind: 'tour' },
      { label: 'Not now', kind: 'dismiss' },
    ],
    ttl: 12000,
  }
}

/** Reaching the end of a room: point onward, and offer the demo the room built up to. */
export function endBubble(ctx: RouteContext): MeloBubble | null {
  if (!ctx.room) return null
  if (ctx.isLast || !ctx.next) return connectBubble('end-connect')
  return {
    id: 'end',
    kind: 'nudge',
    pose: EXPRESSION.offer,
    label: `That's ${ctx.label}`,
    text: ctx.next.label.replace('Continue to', 'Up next:'),
    actions: [
      { label: 'Continue', kind: 'href', href: ctx.next.href },
      { label: CLOSING.action, kind: 'contact' },
    ],
    ttl: 12000,
  }
}

/** Reaching a room's quote: the line itself, and the way in it points to. */
export function quoteBubble(ctx: RouteContext): MeloBubble | null {
  if (!ctx.room?.quote || ctx.isLast) return null
  return {
    id: 'quote',
    kind: 'nudge',
    pose: EXPRESSION.connect,
    label: "Let's connect",
    text: CLOSING.note,
    actions: [
      { label: CLOSING.action, kind: 'contact' },
      { label: 'Keep reading', kind: 'dismiss' },
    ],
    ttl: 12000,
  }
}
