/**
 * The explore rooms.
 *
 * Every word on these pages comes from the NEXR web content document: the
 * Gap, Belief and Meloworld tabs give their rooms in full, and the VR Wellness
 * room is built from the VR Wellness block of the Animation page tab plus the
 * audience cards that tab keeps as they are. Nothing is numbered — the rooms
 * are named, and the order is simply the order they are listed in.
 */

export type ExploreChapter = {
  id: string
  heading: string
  /** Shorter label for the "In this room" strip. Falls back to `heading`. */
  navLabel?: string
  paragraphs: string[]
  /** Optional artwork drawn beside this chapter. */
  image?: string
}

export type ExploreHighlight = {
  /** Anchor id, so a card can be linked to directly. */
  id?: string
  title: string
  body: string
}

export type ExploreLink = {
  label: string
  href: string
}

export type ExploreTopic = {
  slug: string
  word: string
  /** Small line above the hero title. */
  eyebrow: string
  /** The line under this room's name on the Explore page. */
  listNote: string
  title: string
  /** One paragraph or several. */
  lede: string | string[]
  hero: string
  /**
   * An intro video beside the hero copy, where the document asks for one.
   * Until `youtubeId` is set the hero image stands in as the poster.
   */
  video?: { title: string; youtubeId?: string }
  mark?: string
  /** Melo's face for this room, used on the previous/next cards. */
  face: string
  accent: string
  tint: [string, string]
  chapters: ExploreChapter[]
  /**
   * A set of cards under the chapters.
   *
   * `layout` picks the component so each room reads differently: a bento grid
   * for principles, a path for steps, link cards for audiences.
   */
  highlights?: {
    heading: string
    layout: 'bento' | 'steps' | 'audiences'
    items: ExploreHighlight[]
  }
  quote?: string
  deeper: ExploreLink[]
  /** Secondary hero link, e.g. "Keep Reading". */
  readMoreLabel?: string
}

export const EXPLORE_TOPICS: ExploreTopic[] = [
  {
    slug: 'gap',
    word: 'The Gap',
    eyebrow: 'Help is closer than ever.',
    listNote: 'Help is closer than ever.',
    title: 'It’s not always support we lack. It’s a way in',
    lede:
      'Wellbeing support may be available, but taking the first step can still feel daunting. Fear of judgement, privacy concerns, or simply not knowing where to begin can keep people from reaching out. Because access isn’t just about whether support exists. It’s about whether people feel comfortable enough to use it.',
    hero: '/models/imgs/art/gap-left.webp',
    face: '/brand/melo/face-1.webp',
    accent: '#ff7901',
    tint: ['#9f6021', '#311c08'],
    readMoreLabel: 'Keep Reading',
    chapters: [
      {
        id: 'first-step',
        heading: 'The first step is part of the experience',
        paragraphs: [
          'Before someone can benefit from support, they need an experience that feels right for them. For some, that begins with a private moment of reflection. For others, it’s exploring what they feel or understanding what they need. When the experience meets people where they are, taking the next step can feel more natural.',
        ],
      },
      {
        id: 'adapts',
        heading: 'Support that adapts to you',
        paragraphs: [
          'People have different needs, comfort levels, and ways of seeking support. Yet traditional approaches often expect everyone to follow the same path. At NEXR, we’re changing that with immersive VR experiences, anonymous access, and expert guidance that give people more ways to engage with well-being in a way that feels right for them.',
        ],
        image: '/models/imgs/art/vr-left.webp',
      },
      {
        id: 'ways-in',
        heading: 'Different needs deserve different ways in',
        paragraphs: [
          'From anonymous spaces to immersive VR experiences and expert guidance, NEXR offers different ways to engage with well-being. Whether someone wants to explore what they’re feeling, practice new skills, or speak with a professional, they can find a starting point that feels right for them.',
          'Because support works better when the experience works for the person.',
        ],
      },
    ],
    deeper: [
      { label: 'Belief', href: '/explore/belief' },
      { label: 'Our Approach', href: '/approach' },
    ],
  },

  {
    slug: 'belief',
    word: 'Belief',
    eyebrow: 'Different people. Different ways forward.',
    listNote: 'Different people. Different ways forward.',
    title: 'Wellbeing Should Meet You Where You Are',
    lede:
      'We all experience life differently. So why should the way we approach well-being be any different? We believe everyone deserves a way to begin that feels comfortable, personal, and right for them.',
    hero: '/models/imgs/art/approach.webp',
    face: '/brand/melo/face-2.webp',
    accent: '#ff8118',
    tint: ['#a25f20', '#321c08'],
    readMoreLabel: 'Our Belief',
    chapters: [
      {
        id: 'one-size',
        heading: 'The way forward isn’t one-size-fits-all',
        paragraphs: [
          'Some people are ready to talk. Others need time, privacy, or a different way to explore what they’re experiencing. When well-being follows just one path, too many people can be left feeling that it isn’t for them.',
          'We believe the experience should adapt to the person, not the other way around.',
        ],
      },
      {
        id: 'changes-everything',
        heading: 'A belief that changes everything',
        paragraphs: [
          'Wellbeing shouldn’t come with a prescribed starting point. It should give people the freedom to find what feels right for them, at their own pace and on their own terms.',
          'Because taking the first step feels different for everyone. And it should be okay to begin differently.',
        ],
        image: '/models/imgs/art/clinical.webp',
      },
      {
        id: 'brought-to-life',
        heading: 'How does NEXR bring this belief to life?',
        paragraphs: [
          'NEXR brings together immersive VR experiences, anonymous access, and expert guidance to make well-being feel more personal, private, and approachable.',
          'Whether someone wants to explore at their own pace, build practical skills, or connect with an expert, they can find a way in that feels right for them. No single path. No pressure to begin a certain way. Just more room to take the next step.',
        ],
      },
    ],
    // Kept as it is: the document marks the rest of this page as staying the same.
    highlights: {
      heading: 'What Guides Us',
      layout: 'bento',
      items: [
        {
          title: 'People First',
          body: 'Technology should adapt to human needs, not the other way around.',
        },
        {
          title: 'Privacy By Design',
          body: 'People should have control over how they enter, explore and engage.',
        },
        {
          title: 'More Than One Way In',
          body: 'Different people need different ways to approach wellbeing.',
        },
        {
          title: 'Purpose Over Novelty',
          body: 'Technology matters when it creates a better experience, not simply because it is new.',
        },
      ],
    },
    quote: 'NEXR isn’t reinventing wellbeing. It’s rethinking how people experience it.',
    deeper: [
      { label: 'Explore Our Approach', href: '/approach' },
      { label: 'MeloWorld', href: '/explore/meloworld' },
    ],
  },

  {
    slug: 'meloworld',
    word: 'MeloWorld',
    eyebrow: 'MeloWorld',
    listNote: 'A private space',
    title: 'A space to open up without the pressure',
    lede: [
      'MeloWorld offers an immersive, private space where employees and students can pause, work through everyday challenges, and connect with trained professionals.',
      'Through avatar-led experiences and confidential access to expert support, they can take the first step at their own pace, without the fear of being seen or judged.',
    ],
    hero: '/models/imgs/art/meloworld-left.webp',
    video: { title: 'MeloWorld intro and tutorial' },
    mark: '/brand/meloworld-mark.webp',
    face: '/brand/melo/face-3.webp',
    accent: '#ff8a2a',
    tint: ['#a65f20', '#341c08'],
    readMoreLabel: 'Explore Meloworld',
    chapters: [
      {
        id: 'identity',
        heading: 'Leave your identity at the door',
        paragraphs: [
          'MeloWorld lets people enter through an avatar, without a photograph or public-facing profile. This creates space to explore what’s on their mind without the added pressure of being recognized or having to explain themselves to others.',
        ],
      },
      {
        id: 'your-way-in',
        heading: 'Your journey. Your way in',
        paragraphs: [
          'MeloWorld lets people explore virtual spaces, move at their own pace, and engage with what feels relevant to them. Whether they need a moment to pause, want to work through everyday challenges, or are ready to connect with a professional, they can find their own starting point.',
        ],
        image: '/models/imgs/art/connect.webp',
      },
      {
        id: 'insight',
        heading: 'Get insight without intrusion',
        paragraphs: [
          'Organizations and institutions can understand overall platform engagement without accessing individual identities. Decision-makers gain a clearer picture of how their well-being ecosystem is being used, while the privacy of the people using it remains protected.',
        ],
      },
    ],
    highlights: {
      heading: 'How to use MeloWorld?',
      layout: 'steps',
      items: [
        {
          title: 'Step into your own space.',
          body: 'Choose an avatar and enter a private virtual world where you can begin your well-being journey without the pressure of being seen or recognized.',
        },
        {
          title: 'Find what feels right for you.',
          body: 'Move through the virtual space, discover different experiences, and take the time to understand what feels relevant to you. There’s no set path to follow and no need to rush.',
        },
        {
          title: 'Take the next step.',
          body: 'Engage with the experiences that resonate with you, work through everyday challenges, or connect with a trained professional when you’re ready. Move forward at your own pace, in a way that feels comfortable for you.',
        },
      ],
    },
    deeper: [
      { label: 'VR Wellness', href: '/explore/vr-wellness' },
      { label: 'Trust', href: '/trust' },
    ],
  },

  {
    slug: 'vr-wellness',
    word: 'VR Wellness',
    eyebrow: 'VR Wellness',
    listNote: 'For Organizations, Institutes & Healthcare',
    title: 'A new way to face what life brings.',
    lede:
      'Explore immersive VR experiences designed to help you practice relaxation, build confidence, and develop emotional resilience in a guided virtual environment.',
    hero: '/models/imgs/art/vr-left.webp',
    face: '/brand/melo/face-4.webp',
    accent: '#ff8422',
    tint: ['#a95e1f', '#361c08'],
    readMoreLabel: 'Explore Solutions',
    chapters: [],
    highlights: {
      heading: 'For Organizations, Institutes & Healthcare',
      layout: 'audiences',
      items: [
        {
          id: 'workplaces',
          title: 'Workplaces',
          body: 'Create more approachable ways for employees to explore wellbeing, build healthier habits and access professional support.',
        },
        {
          id: 'education',
          title: 'Educational Institutes',
          body: 'Give students safe, engaging ways to understand their wellbeing, build emotional skills and access support when they need it.',
        },
        {
          id: 'healthcare',
          title: 'Healthcare',
          body: 'Extend the toolkit available to mental health professionals with immersive environments and digital experiences that can complement existing care.',
        },
      ],
    },
    deeper: [
      { label: 'MeloWorld', href: '/explore/meloworld' },
      { label: 'Trust', href: '/trust' },
    ],
  },
]

/**
 * The Explore page list: the four rooms, then Let's Talk, which goes straight
 * to the contact page rather than to a room of its own.
 */
export type ExploreIndexItem = {
  key: string
  word: string
  note: string
  href: string
  image: string
}

export const EXPLORE_INDEX: ExploreIndexItem[] = [
  ...EXPLORE_TOPICS.map((topic) => ({
    key: topic.slug,
    word: topic.word,
    note: topic.listNote,
    href: `/explore/${topic.slug}`,
    image: topic.hero,
  })),
  {
    key: 'contact',
    word: 'Let’s Talk',
    note: 'Book a Demo',
    href: '/contact',
    image: '/models/imgs/art/connect.webp',
  },
]

/**
 * The closing block every sub page ends on — the Let's Talk copy from the
 * Animation page tab, so the call to action reads the same everywhere.
 */
export const CLOSING = {
  heading: 'Make space for a better kind of wellbeing',
  body: 'Discover how NEXR brings immersive VR experiences, anonymous access, and expert guidance together to make wellbeing more private, engaging, and accessible across workplaces, educational institutions, and healthcare settings.',
  action: 'Book A Demo',
}

export const EXPLORE_SLUGS = EXPLORE_TOPICS.map((topic) => topic.slug)

export function getExploreTopic(slug: string) {
  return EXPLORE_TOPICS.find((topic) => topic.slug === slug)
}

/** The room after this one, wrapping at the end so the tour never dead-ends. */
export function getNextTopic(slug: string) {
  const i = EXPLORE_TOPICS.findIndex((topic) => topic.slug === slug)
  if (i === -1) return EXPLORE_TOPICS[0]
  return EXPLORE_TOPICS[(i + 1) % EXPLORE_TOPICS.length]
}

export function getPrevTopic(slug: string) {
  const i = EXPLORE_TOPICS.findIndex((topic) => topic.slug === slug)
  if (i === -1) return EXPLORE_TOPICS[EXPLORE_TOPICS.length - 1]
  return EXPLORE_TOPICS[(i - 1 + EXPLORE_TOPICS.length) % EXPLORE_TOPICS.length]
}
