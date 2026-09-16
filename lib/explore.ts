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
}

export const EXPLORE_TOPICS: ExploreTopic[] = [
  {
    slug: 'gap',
    index: '01',
    word: 'The Gap',
    eyebrow: 'The workplace wellbeing gap',
    title: 'People need support. But reaching out isn’t always easy.',
    lede:
      'Organisations are investing more in employee wellbeing than ever before. Yet many employees still don’t use the support available to them.',
    hero: '/models/imgs/gap.webp',
    accent: '#ff7901',
    tint: ['#9f6021', '#311c08'],
    chapters: [
      {
        id: 'engagement',
        kicker: 'More support. Still not enough engagement.',
        heading: 'The support is there. So why aren’t people using it?',
        paragraphs: [
          'Employee assistance programmes, counselling, wellbeing apps, workshops and other initiatives are now common parts of workplace benefits.',
          'But not everyone wants to sit across from someone and talk about how they’re feeling. Some people need privacy. Some need time. Some find it easier to explore what they’re feeling before talking to someone.',
          'Good wellbeing support isn’t just about what’s available. It’s about how easily people can connect with it.',
        ],
      },
      {
        id: 'hesitation',
        kicker: 'Why people hesitate to reach out.',
        heading: 'It can be hard to ask for help.',
        paragraphs: [
          'For some people, it is the fear of being judged. For others, it is worrying about who might know. Some may simply prefer to keep their wellbeing private. And sometimes, people don’t know where to begin.',
          'These small concerns can be enough to keep someone from using the support that’s already available to them.',
        ],
      },
      {
        id: 'cost',
        kicker: 'What this means for organisations.',
        heading: 'The gap affects more than just wellbeing.',
        paragraphs: [
          'When people don’t get support early, everyday stress can build over time. It can affect how they work, how they connect with others and how they feel about their workplace.',
          'For organisations, this can eventually show up as lower engagement, more burnout, absenteeism and employee turnover.',
          'The goal isn’t simply to offer more wellbeing programmes. It’s to make wellbeing easier to use.',
        ],
      },
    ],
    highlights: {
      heading: 'How the gap shows up',
      items: [
        {
          title: 'Lower engagement',
          body: 'People who are carrying something quietly have less left to give the work in front of them.',
        },
        {
          title: 'More burnout',
          body: 'Strain that is never named early tends to be handled late, when the options are fewer.',
        },
        {
          title: 'Absenteeism',
          body: 'Time away becomes the only remaining way to get the space that support was meant to provide.',
        },
        {
          title: 'Employee turnover',
          body: 'People rarely leave over one thing, but a workplace that felt unsafe to speak in is often part of it.',
        },
      ],
    },
    stats: [
      { value: '76%', label: 'Employees who don’t openly share their struggles' },
      { value: '<10%', label: 'Typical EAP usage' },
      { value: '1 in 4', label: 'Employees reporting burnout symptoms' },
      { value: '0', label: 'Names needed to start with NEXR' },
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
    quote:
      'Good wellbeing support isn’t just about what’s available. It’s about how easily people can connect with it.',
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
      label: 'Book a demo',
      href: '/contact',
      note: 'See what closing the gap looks like inside your organisation.',
    },
  },

  {
    slug: 'belief',
    index: '02',
    word: 'Belief',
    eyebrow: 'What we believe',
    title: 'Stop making people fit wellbeing. Make wellbeing fit people.',
    lede:
      'Wellbeing is personal. What works for one person may not work for another — and the way in matters as much as what is waiting on the other side of it.',
    hero: '/models/imgs/OurApproach.webp',
    accent: '#ff8118',
    tint: ['#a25f20', '#321c08'],
    chapters: [
      {
        id: 'today',
        kicker: 'The way wellbeing works today.',
        heading: 'Wellbeing often starts with a process. But people don’t all need the same starting point.',
        paragraphs: [
          'Wellbeing is personal. What works for one person may not work for another. Some may prefer a conversation, while others may feel more comfortable starting on their own.',
          'The need may be similar. The way people respond to it can be very different.',
        ],
      },
      {
        id: 'natural',
        kicker: 'A more natural way to experience it.',
        heading: 'Start where you feel comfortable.',
        paragraphs: [
          'It doesn’t always have to begin with a formal session or a difficult conversation. It can start with a private space to explore, an activity that helps you pause, or an experience that helps you understand what you need.',
          'The more natural it feels, the easier it is to make wellbeing part of everyday life.',
          'When people feel comfortable with the way they access wellbeing, taking that first step becomes easier.',
        ],
      },
      {
        id: 'outcome',
        kicker: 'What better wellbeing can create.',
        heading: 'Better wellbeing can shape better workplaces.',
        paragraphs: [
          'When people feel supported, organisations benefit too. Wellbeing isn’t only about helping someone when they are struggling.',
          'It’s also about helping people build healthier habits, feel more comfortable asking for support and take better care of themselves over time.',
          'And when that becomes part of everyday work life, it can contribute to healthier teams and healthier workplace cultures.',
        ],
      },
    ],
    highlights: {
      heading: 'Four principles',
      items: [
        {
          title: 'Private by design',
          body: 'Anonymity is how psychological safety is created. Nobody should have to choose between getting help and protecting their privacy.',
        },
        {
          title: 'Easy to begin',
          body: 'The first step should be small enough that taking it does not feel like a decision about yourself.',
        },
        {
          title: 'Engaging enough to return to',
          body: 'Support that is used once is a moment. Support people come back to is a habit, and habits are what change outcomes.',
        },
        {
          title: 'Clinically grounded',
          body: 'Every experience is built with mental health professionals and tested in practice, not designed around what demos well.',
        },
      ],
    },
    gallery: [
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
      'NEXR isn’t reinventing mental wellness. It’s reinventing how people access it.',
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
      label: 'Book a demo',
      href: '/contact',
      note: 'See what people-first wellbeing looks like inside your organisation.',
    },
  },

  {
    slug: 'meloworld',
    index: '03',
    word: 'MeloWorld',
    eyebrow: 'A private space to explore wellbeing',
    title: 'A private space to explore wellbeing.',
    lede:
      'MeloWorld gives employees a private and anonymous way to explore their wellbeing, connect with mental health professionals and take their first step towards support comfortably.',
    hero: '/models/imgs/meloworld.webp',
    mark: '/brand/meloworld-mark.webp',
    accent: '#ff8a2a',
    tint: ['#a65f20', '#341c08'],
    chapters: [
      {
        id: 'privacy',
        kicker: 'A space built around privacy.',
        heading: 'A space where you can be yourself, anonymously.',
        paragraphs: [
          'Employees enter MeloWorld using an avatar instead of their real identity. They don’t need to share their name or photograph with other people in the space.',
          'This gives people the privacy and comfort to explore their wellbeing in their own way.',
        ],
      },
      {
        id: 'pace',
        kicker: 'Explore at your own pace.',
        heading: 'Explore first. Connect when you’re ready.',
        paragraphs: [
          'MeloWorld feels more like a space than a traditional wellbeing platform. Employees can enter, explore different environments and spend some time there before deciding what they want to do next.',
          'When they’re ready, they can connect with a qualified mental health professional within the platform.',
        ],
      },
      {
        id: 'visibility',
        kicker: 'What organisations can see.',
        heading: 'Private for employees. Clear for organisations.',
        paragraphs: [
          'Organisations can understand overall engagement with the platform without seeing which individual employees are using it.',
          'This gives organisations useful insights while allowing employees to keep their personal wellbeing private.',
        ],
      },
    ],
    highlights: {
      heading: 'How MeloWorld works',
      items: [
        {
          title: 'Choose your avatar',
          body: 'Enter MeloWorld with an avatar instead of your real identity.',
        },
        {
          title: 'Explore the space',
          body: 'Take your time, explore the different spaces and see what feels right for you.',
        },
        {
          title: 'Connect when you’re ready',
          body: 'When you want support, connect with a qualified mental health professional within MeloWorld.',
        },
      ],
    },
    gallery: [
      {
        label: 'The world — explore the virtual spaces',
        slot: '/explore/meloworld/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Your avatar — choose how you appear',
        slot: '/explore/meloworld/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Your session — connect with a qualified professional',
        slot: '/explore/meloworld/03.webp',
        aspect: '16/9',
      },
    ],
    quote: 'A new way to access wellbeing. Built with care.',
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
      label: 'Book a demo',
      href: '/contact',
      note: 'Walk through MeloWorld the way your people would meet it.',
    },
  },

  {
    slug: 'vr-wellness',
    index: '04',
    word: 'VR Wellness',
    eyebrow: 'A different way to experience wellbeing',
    title: 'A different way to experience wellbeing.',
    lede:
      'Guided VR experiences designed to help people relax, build confidence and work through different wellbeing needs, at their own pace.',
    hero: '/models/imgs/vrworld.webp',
    accent: '#ff8422',
    tint: ['#a95e1f', '#361c08'],
    chapters: [
      {
        id: 'guided',
        kicker: 'Guided experiences, not just technology.',
        heading: 'Guided by people. Powered by VR.',
        paragraphs: [
          'VR Wellness uses immersive experiences to help people work through specific challenges in a controlled environment.',
          'Each experience is designed with professional guidance, so people can move through it step by step, at a pace that feels comfortable for them.',
          'The technology creates the experience. The right guidance makes it meaningful.',
        ],
      },
      {
        id: 'confidence',
        kicker: 'Build skills before you need them.',
        heading: 'Wellbeing isn’t only about difficult moments.',
        paragraphs: [
          'VR Wellness isn’t only designed for people going through a challenge. It also includes guided experiences that can help with relaxation, focus, confidence and recovery.',
          'These can become simple ways for people to practise wellbeing regularly, rather than waiting until they need help.',
        ],
      },
      {
        id: 'safety',
        kicker: 'Safety comes first.',
        heading: 'Every experience has a safe way in and a safe way out.',
        paragraphs: [
          'People can move through each experience at their own pace and stop whenever they need to.',
          'The experiences are designed with professional input, with the right guidance and boundaries built into the process.',
          'Because trying something new should always feel safe enough to try.',
        ],
      },
    ],
    highlights: {
      heading: 'Different needs. Different experiences.',
      items: [
        {
          title: 'Relax & reset',
          body: 'Guided experiences designed to help people slow down, relax and recover from everyday stress.',
        },
        {
          title: 'Build confidence',
          body: 'Experiences that help people practise confidence in situations that may feel difficult or unfamiliar.',
        },
        {
          title: 'Work through fears',
          body: 'Structured experiences that can help people gradually work through specific fears and anxieties.',
        },
        {
          title: 'Focus & recover',
          body: 'Short guided experiences designed to support focus, rest and everyday wellbeing.',
        },
      ],
    },
    gallery: [
      {
        label: 'Immersive environment',
        slot: '/explore/vr-wellness/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Guided experience',
        slot: '/explore/vr-wellness/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Build your practice',
        slot: '/explore/vr-wellness/03.webp',
        aspect: '16/9',
      },
    ],
    quote: 'A new way to experience wellbeing. At your own pace.',
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
      label: 'Book a demo',
      href: '/contact',
      note: 'Try a guided experience the way your people would meet it.',
    },
  },

  {
    slug: 'clinical',
    index: '05',
    // Renamed from "Clinical" — on its own that word describes the evidence
    // behind the platform, not who it is for, and this room is as much about
    // workplaces, education and healthcare as it is about the research. It now
    // matches the home beat's own word exactly, so arriving here reads as
    // continuing the same sentence rather than starting a new one.
    word: 'Who It’s For',
    eyebrow: 'Who NEXR is built for',
    title: 'Where clinical expertise meets the realities of the people you serve.',
    lede:
      'Whether you are supporting employees across an enterprise or students within an educational institution, NEXR helps create environments where wellbeing is approachable, engaging and accessible.',
    hero: '/models/imgs/clinicallygrounded.webp',
    accent: '#ff7d16',
    tint: ['#ad5d1f', '#381c08'],
    chapters: [
      {
        id: 'built',
        kicker: 'Developed with mental health professionals.',
        heading: 'Clinicians shaped it before engineers built it.',
        paragraphs: [
          'The content, the pacing and the safeguards come from practising professionals rather than from a product roadmap. Where the two disagreed, the clinical view set the requirement.',
          'That order of work is why the platform can be placed in front of someone who is struggling rather than someone who is curious.',
        ],
      },
      {
        id: 'tested',
        kicker: 'Tested in clinical practice.',
        heading: 'Evaluated where the stakes are real.',
        paragraphs: [
          'The approach has been used in clinical settings, with the observation and adjustment that implies. Feedback from those sessions is what shaped the current experience library.',
          'Technology is the how here. It is never the headline.',
        ],
      },
      {
        id: 'workplaces',
        kicker: 'Designed for the realities of modern workplaces.',
        heading: 'Enterprises and institutions, on their own terms.',
        paragraphs: [
          'Deployment respects what an organisation can actually do: existing devices, existing policies, existing duty of care. Reporting stays at population level so measurement never becomes surveillance.',
          'Educational institutions get the same structure, adapted for students and the people responsible for them.',
        ],
      },
    ],
    highlights: {
      heading: 'The three statements we stand behind',
      items: [
        {
          title: 'Developed with mental health professionals',
          body: 'Clinical input at the design stage, not as a review at the end.',
        },
        {
          title: 'Tested in clinical practice',
          body: 'Used and evaluated in real settings, with the findings folded back in.',
        },
        {
          title: 'Designed for modern workplaces',
          body: 'Built for the devices, policies and pressures organisations actually have.',
        },
      ],
    },
    gallery: [
      {
        label: 'Clinical team at work',
        slot: '/explore/clinical/01.webp',
        aspect: '4/3',
      },
      {
        label: 'Enterprise deployment',
        slot: '/explore/clinical/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Education settings',
        slot: '/explore/clinical/03.webp',
        aspect: '16/9',
      },
    ],
    quote:
      'Technology is the how. It is never the headline.',
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
      label: 'Book a demo',
      href: '/contact',
      note: 'Meet the clinicians behind the platform.',
    },
  },

  {
    slug: 'contact',
    index: '06',
    word: 'Let’s Talk',
    eyebrow: 'One connected ecosystem',
    title: 'The next way into wellbeing starts here.',
    lede:
      'Bring the way in to your people. We will shape the right entry point for your workplace or campus, and show you the whole ecosystem in a live walkthrough.',
    hero: '/models/imgs/letsconnect.webp',
    accent: '#ff7609',
    tint: ['#b05c1e', '#391c08'],
    chapters: [
      {
        id: 'walkthrough',
        kicker: 'What a demo actually is.',
        heading: 'Forty minutes, your context, no deck.',
        paragraphs: [
          'We walk through MeloWorld and VR Wellness as your people would meet them, then talk about where the entry point belongs inside what you already run.',
          'You leave knowing what deployment would involve, what it would cost and what you would be able to measure.',
        ],
      },
      {
        id: 'fit',
        heading: 'Who this is for.',
        paragraphs: [
          'Enterprises with a wellbeing budget that is not being used, and educational institutions carrying a duty of care for students who will not come forward.',
          'If your programmes are strong but underused, the problem is likely the way in, and that is the part we work on.',
        ],
      },
    ],
    gallery: [
      {
        label: 'The team',
        slot: '/explore/contact/01.webp',
        aspect: '4/3',
      },
      {
        label: 'A walkthrough session',
        slot: '/explore/contact/02.webp',
        aspect: '16/9',
      },
    ],
    quote:
      'Healthier organisations begin with people who feel safe enough to seek support.',
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
      label: 'Book a demo',
      href: '/contact',
      note: 'Pick a time and we will shape the walkthrough around your organisation.',
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
