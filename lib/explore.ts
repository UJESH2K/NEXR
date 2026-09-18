/**
 * The six explore rooms.
 *
 * Each beat on the home scene ends in one link, and this is what sits on the
 * other side of it: a long-form read for that beat, with the same index, word
 * and accent so arriving feels like walking further into the same building
 * rather than landing on a different site.
 *
 * The copy is the script's, expanded. Where the scene has room for one
 * paragraph, a room here has space for the argument behind it — but nothing is
 * invented that contradicts the approved narrative, and the headline of every
 * room is the headline of its beat.
 *
 * Images are deliberately not all present yet. A gallery item without `src`
 * renders a designed placeholder that names the exact file to drop in, so
 * artwork can be added later without touching a component.
 */

export type ExploreImage = {
  /** Shown on the card, and on the placeholder while the file is missing. */
  label: string
  /** Where the file goes. Also the src once it exists. */
  slot: string
  /** Set once the artwork is in place. Until then the placeholder stands in. */
  src?: string
  /** CSS aspect-ratio string. Mixed ratios are what stop the grid looking like a form. */
  aspect: string
}

export type ExploreChapter = {
  id: string
  /** Small line above the heading, matching the scene's kicker treatment. */
  kicker?: string
  heading: string
  /**
   * The short label the "In this room" rail shows for this chapter.
   *
   * The source script writes two different texts for the same chapter: a
   * punchy nav-rail line ("Not everyone knows what they need.") and a longer
   * in-body heading ("Support doesn't begin with a session."). Falls back to
   * `heading` when a room doesn't distinguish the two.
   */
  navLabel?: string
  paragraphs: string[]
}

export type ExploreHighlight = {
  title: string
  body: string
}

export type ExploreStat = {
  value: string
  label: string
}

export type ExploreLink = {
  label: string
  href: string
  note: string
}

export type ExploreTopic = {
  slug: string
  /** Matches the beat's index on the home scene. */
  index: string
  word: string
  eyebrow: string
  title: string
  lede: string
  /** Hero artwork. Every topic has one already. */
  hero: string
  mark?: string
  /**
   * Accent and background tint, both taken from this room's beat on the home
   * scene rather than chosen here.
   *
   * They used to be chosen here, and they drifted badly: three rooms ended up
   * mint, lavender and cyan while the scene they opened from was orange, and
   * every tint was still a green left over from an older palette. A room is
   * meant to read as the inside of the beat you clicked, which only works if it
   * is lit by the same colour. If the home palette moves, these move with it.
   */
  accent: string
  tint: [string, string]
  chapters: ExploreChapter[]
  highlights?: { heading: string; items: ExploreHighlight[] }
  stats?: ExploreStat[]
  gallery: ExploreImage[]
  quote?: string
  deeper: ExploreLink[]
  cta: { label: string; href: string; note: string }
  /**
   * The secondary hero link's label, e.g. "Explore MeloWorld". The source
   * script varies this per room rather than repeating "Start reading" on
   * every one; falls back to that when a room doesn't specify its own.
   */
  readMoreLabel?: string
}

export const EXPLORE_TOPICS: ExploreTopic[] = [
  {
    slug: 'gap',
    index: '01',
    word: 'The Gap',
    // S2 SUB PAGE - THE GAP.
    eyebrow: 'Help is closer than ever.',
    title: 'But why does the first step feel so far away?',
    lede:
      'We\u2019ve built more ways for people to access wellbeing support, but the decision to actually use it is still personal. Reaching out can feel uncomfortable, unfamiliar, or simply like something you\u2019re not ready for yet. Sometimes, what stands between a person and support isn\u2019t its availability, but the experience of getting there. The gap isn\u2019t always between people and support. Sometimes, it\u2019s between people and the way support is offered.',
    hero: '/models/imgs/gap.webp',
    accent: '#ff7901',
    tint: ['#9f6021', '#311c08'],
    readMoreLabel: 'Start Reading',
    chapters: [
      {
        id: 'engagement',
        navLabel: 'Not everyone knows what they need.',
        heading: 'Support doesn\u2019t begin with a session.',
        paragraphs: [
          'It begins much earlier, with the moment someone decides to explore what they\u2019re feeling, look for help, or simply understand what they need. That moment can feel different for everyone. The more thoughtfully we design it, the easier it can be to take the next step.',
        ],
      },
      {
        id: 'hesitation',
        navLabel: 'Why the first step matters.',
        heading: 'Beyond the first step.',
        paragraphs: [
          'Privacy can make it easier to explore. Familiarity can make something new feel less intimidating. A guided experience can help someone understand what they need before deciding what comes next.',
          'And when the first step feels manageable, the next one doesn\u2019t have to feel so far away.',
          'Access is not only about availability. It\u2019s also about approachability.',
        ],
      },
      {
        id: 'cost',
        navLabel: 'What a different approach can change.',
        kicker: 'When wellbeing becomes easier to approach, it can become easier to use.',
        heading: 'And that matters beyond the individual.',
        paragraphs: [
          'Early engagement can help people recognise what they need, build healthier ways of responding and seek appropriate support sooner.',
          'For organisations and institutions, that can mean creating environments where wellbeing isn\u2019t something people turn to only when things become difficult.',
          'The goal is not simply more programmes. It is more meaningful participation in wellbeing.',
        ],
      },
    ],
    stats: [
      { value: '76%', label: 'Employees who don\u2019t openly share their struggles' },
      { value: '<10%', label: 'Typical EAP usage' },
      { value: '1 in 4', label: 'Employees reporting burnout symptoms' },
      { value: '0', label: 'names needed to start with NEXR' },
    ],
    gallery: [
      {
        label: 'The gap, visualised',
        slot: '/explore/gap/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Utilisation versus spend',
        slot: '/explore/gap/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Where people stop',
        slot: '/explore/gap/03.webp',
        aspect: '16/9',
      },
    ],
    deeper: [
      {
        label: 'Our approach',
        href: '/approach#gap',
        note: 'The full argument, with the philosophy that follows from it.',
      },
      {
        label: 'Our belief',
        href: '/explore/belief',
        note: 'What we do about it: design wellbeing around people.',
      },
    ],
    cta: {
      label: 'Book a Demo',
      href: '/contact',
      note: 'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    },
  },

  {
    slug: 'belief',
    index: '02',
    word: 'Belief',
    // S3 — SUB PAGE.
    eyebrow: 'Different people. Different ways forward.',
    title: 'So why should wellbeing always begin in the same place?',
    lede:
      'People have different needs, different comfort levels and different ways of responding to challenges.',
    hero: '/models/imgs/OurApproach.webp',
    accent: '#ff8118',
    tint: ['#a25f20', '#321c08'],
    chapters: [
      {
        id: 'today',
        navLabel: 'Wellbeing is personal.',
        heading: 'Start with the person, not the problem.',
        paragraphs: [
          'How we feel is shaped by what we\u2019re dealing with, where we are, and what life looks like around us. A student navigating a new environment, an employee under pressure, or someone working through a personal challenge may all need something different.',
          'Instead of asking people to adapt to one model, create more ways for them to engage.',
        ],
      },
      {
        id: 'natural',
        navLabel: 'Experience changes participation.',
        heading: 'People remember what they experience.',
        paragraphs: [
          'Wellbeing isn\u2019t only about having the right information or putting the right support in place. The way people encounter it can influence whether they pause, participate, return to it, or take something from it.',
          'A private environment can invite reflection. An immersive experience can turn an idea into something felt. Guided support can turn that experience into understanding.',
          'When wellbeing feels relevant to real life, it becomes easier to engage with.',
        ],
      },
      {
        id: 'outcome',
        navLabel: 'Make wellbeing part of everyday life.',
        heading: 'Make wellbeing part of the everyday.',
        paragraphs: [
          'The most meaningful changes don\u2019t always happen in a single session. They can come from learning to recognise what you\u2019re feeling, practising how you respond, building confidence, or becoming more comfortable asking for support.',
          'That shift can change the way people experience support, long before support becomes urgent.',
        ],
      },
    ],
    highlights: {
      // FOUR PRINCIPLES — What Guides Us.
      heading: 'What Guides Us',
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
    gallery: [
      // INSIDE BELIEF.
      {
        label: 'Designed around people',
        slot: '/explore/belief/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Our principles in action',
        slot: '/explore/belief/02.webp',
        aspect: '4/3',
      },
      {
        label: 'From reactive to everyday',
        slot: '/explore/belief/03.webp',
        aspect: '16/9',
      },
    ],
    quote:
      'NEXR isn\u2019t reinventing wellbeing. It\u2019s rethinking how people experience it.',
    deeper: [
      {
        label: 'MeloWorld',
        href: '/explore/meloworld',
        note: 'The private space where a first step actually gets taken.',
      },
      {
        label: 'VR Wellness',
        href: '/explore/vr-wellness',
        note: 'Guided experiences, taken at the pace the person sets.',
      },
    ],
    cta: {
      label: 'Book a Demo',
      href: '/contact',
      note: 'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    },
  },

  {
    slug: 'meloworld',
    index: '03',
    word: 'MeloWorld',
    // S5 — SUB PAGE.
    eyebrow: 'MeloWorld',
    title: 'A space built around privacy',
    lede:
      'Mellow World gives people a private space to pause, reflect and make sense of what they\u2019re experiencing, without the pressure of being seen or judged. From exploring what\u2019s on their mind to finding the right kind of support, the experience lets them move forward at their own pace.',
    hero: '/models/imgs/meloworld.webp',
    mark: '/brand/meloworld-mark.webp',
    accent: '#ff8a2a',
    tint: ['#a65f20', '#341c08'],
    readMoreLabel: 'Explore MeloWorld',
    chapters: [
      {
        id: 'privacy',
        navLabel: 'Privacy built into the experience.',
        heading: 'Leave your identity at the door.',
        paragraphs: [
          'MeloWorld doesn\u2019t ask people to put their identity forward before they know what they need. They enter through an avatar, with no photograph or public-facing profile, creating space to explore without the pressure of being recognised or having to explain themselves.',
          'Sometimes, participation starts with knowing you can stay private.',
        ],
      },
      {
        id: 'pace',
        navLabel: 'Explore at your own pace.',
        heading: 'There\u2019s no prescribed way to begin.',
        paragraphs: [
          'MeloWorld gives people the freedom to move through the experience at their own pace. They can look around, explore different spaces and engage with what feels relevant to them, without being pushed towards a particular next step.',
          'Professional support is available within the experience when they choose to access it.',
          'The journey is yours to navigate.',
        ],
      },
      {
        id: 'visibility',
        navLabel: 'What organisations and institutions see.',
        kicker: 'Measure engagement without turning wellbeing into surveillance.',
        heading: 'Organisations and institutions can understand overall platform engagement without accessing individual identities.',
        paragraphs: [
          'That means decision-makers can see how a wellbeing ecosystem is being used while preserving the privacy of the people using it.',
          'Useful insight at the organisational level. Personal privacy at the individual level.',
        ],
      },
    ],
    highlights: {
      // HOW MELOWORLD WORKS.
      heading: 'How MeloWorld Works',
      items: [
        {
          title: 'Enter',
          body: 'Choose an avatar and enter a private virtual environment.',
        },
        {
          title: 'Explore',
          body: 'Move through the space, discover different experiences and take time to understand what feels right.',
        },
        {
          title: 'Connect',
          body: 'When you\u2019re ready, connect with a qualified mental health professional within the platform.',
        },
      ],
    },
    gallery: [
      // INSIDE MELOWORLD.
      {
        label: 'The World \u2014 explore virtual spaces designed to make wellbeing feel less clinical and more approachable.',
        slot: '/explore/meloworld/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Your Avatar \u2014 choose how you appear in the space while keeping your personal identity private.',
        slot: '/explore/meloworld/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Your Session \u2014 move from exploration to professional support when you decide you\u2019re ready.',
        slot: '/explore/meloworld/03.webp',
        aspect: '16/9',
      },
    ],
    quote: 'A different way to enter. A meaningful way to connect.',
    deeper: [
      {
        label: 'VR Wellness',
        href: '/explore/vr-wellness',
        note: 'The other half of the ecosystem, for when someone is ready to go further.',
      },
      {
        label: 'Trust centre',
        href: '/trust',
        note: 'Exactly what an employer can and cannot see.',
      },
    ],
    cta: {
      label: 'Book a Demo',
      href: '/contact',
      note: 'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    },
  },

  {
    slug: 'vr-wellness',
    index: '04',
    word: 'VR Wellness',
    // S6 — SUB PAGE.
    eyebrow: 'VR Wellness',
    title: 'A rehearsal space for real life.',
    lede:
      'VR Wellness creates guided environments where people can practise specific wellbeing skills before applying them outside the experience. From regulating emotions to building confidence and gradually facing fears, each experience is designed around a specific goal. A safe space to practise what real life asks of you.',
    hero: '/models/imgs/vrworld.webp',
    accent: '#ff8422',
    tint: ['#a95e1f', '#361c08'],
    readMoreLabel: 'Explore VR Wellness',
    chapters: [
      {
        id: 'guided',
        navLabel: 'More than immersion.',
        heading: 'Step into the situation.',
        paragraphs: [
          'A screen can show you a situation. VR lets you step into it.',
          'They can experience a scenario, observe their response and practise a different one, within a controlled environment. For certain needs, this can make an abstract idea much more tangible.',
          'A virtual experience with a real-world purpose.',
        ],
      },
      {
        id: 'confidence',
        navLabel: 'Experiences built around real needs.',
        heading: 'Immersion, with intention.',
        paragraphs: [
          'VR Wellness brings together different immersive experiences for different wellbeing goals.',
          'That could mean slowing down and regulating stress, building confidence, practising communication, gradually working through a fear, or complementing professional support.',
          'The goal comes first. The technology follows.',
        ],
      },
      {
        id: 'safety',
        navLabel: 'Controlled by design.',
        heading: 'Designed with direction.',
        paragraphs: [
          'Every experience can be structured, adjusted and repeated around the person and the purpose of the session.',
          'Where professional intervention is involved, practitioners remain part of the process, guiding how the experience is introduced and used.',
          'VR creates the environment. Expertise guides the process.',
        ],
      },
    ],
    highlights: {
      // WHAT VR WELLNESS CAN SUPPORT.
      heading: 'Different needs. Different experiences.',
      items: [
        {
          title: 'Relaxation & Recovery',
          body: 'Immersive environments designed to help people slow down, practise relaxation and create space to recover.',
        },
        {
          title: 'Emotional Regulation',
          body: 'Guided experiences that help people practise ways of responding to stress and difficult emotions.',
        },
        {
          title: 'Confidence & Social Situations',
          body: 'Controlled environments where people can practise situations that may feel difficult or unfamiliar.',
        },
        {
          title: 'Fears & Phobias',
          body: 'Gradual exposure to specific situations under appropriate professional guidance, where clinically suitable.',
        },
        {
          title: 'Learning & Development',
          body: 'Immersive scenarios that allow students, employees and other learners to practise skills in a safe, repeatable environment.',
        },
      ],
    },
    gallery: [
      // INSIDE VR WELLNESS.
      {
        label: 'Immersive Environments',
        slot: '/explore/vr-wellness/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Guided Experiences',
        slot: '/explore/vr-wellness/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Measurable Practice',
        slot: '/explore/vr-wellness/03.webp',
        aspect: '16/9',
      },
    ],
    quote: 'The goal isn\u2019t to escape reality. It\u2019s to practise for it.',
    deeper: [
      {
        label: 'MeloWorld',
        href: '/explore/meloworld',
        note: 'The private first step, for people not ready to go further yet.',
      },
      {
        label: 'The evidence',
        href: '/explore/clinical',
        note: 'Who designs these experiences, and what they are tested against.',
      },
    ],
    cta: {
      label: 'Book a Demo',
      href: '/contact',
      note: 'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    },
  },

  {
    slug: 'clinical',
    index: '05',
    // S7 — WHERE NEXR FITS. The PDF marks this room's own sub-page content
    // "pending" — it gives the home-scene block only, not a distinct long-form
    // page. Rather than invent the missing chapters, this room carries exactly
    // that block and nothing past it, so nothing shown here is fabricated.
    // Replace this comment and the fields below once that content exists.
    word: 'Who It’s For',
    eyebrow: 'Who It’s For',
    title: 'Designed for people. Built for organisations.',
    lede:
      'NEXR adapts to the people and environments it serves, bringing new ways to engage with wellbeing into everyday spaces.',
    hero: '/models/imgs/clinicallygrounded.webp',
    accent: '#ff7d16',
    tint: ['#ad5d1f', '#381c08'],
    chapters: [],
    gallery: [
      {
        label: 'Workplaces',
        slot: '/explore/clinical/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Schools & Colleges',
        slot: '/explore/clinical/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Healthcare',
        slot: '/explore/clinical/03.webp',
        aspect: '16/9',
      },
    ],
    deeper: [
      {
        label: 'Trust centre',
        href: '/trust',
        note: 'Privacy, safeguarding and the clinical basis in full.',
      },
      {
        label: 'Start the conversation',
        href: '/explore/contact',
        note: 'Bring the way in to your people.',
      },
    ],
    cta: {
      label: 'Book a Demo',
      href: '/contact',
      note: 'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    },
  },

  {
    slug: 'contact',
    index: '06',
    // CLOSING CTA — common for all sub pages. As with the "Who It's For" room,
    // the PDF gives no distinct long-form content for this room specifically —
    // only the shared closing block every room ends on. Chapters stay empty
    // rather than inventing a walkthrough script nobody has written yet.
    word: 'Let’s Talk',
    eyebrow: 'Let’s Talk',
    title: 'The next way into wellbeing starts here.',
    lede:
      'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    hero: '/models/imgs/letsconnect.webp',
    accent: '#ff7609',
    tint: ['#b05c1e', '#391c08'],
    chapters: [],
    gallery: [
      {
        label: 'Book a Demo',
        slot: '/explore/contact/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Connect with us',
        slot: '/explore/contact/02.webp',
        aspect: '16/9',
      },
    ],
    quote: 'Better wellbeing starts when the way in feels right.',
    deeper: [
      {
        label: 'Contact',
        href: '/contact',
        note: 'Send the details and we will come back within two working days.',
      },
      {
        label: 'Trust centre',
        href: '/trust',
        note: 'The questions procurement asks, answered up front.',
      },
    ],
    cta: {
      label: 'Book a Demo',
      href: '/contact',
      note: 'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    },
  },
]

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
