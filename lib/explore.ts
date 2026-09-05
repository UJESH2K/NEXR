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
    title: 'The barrier isn’t always the support. It’s the way in.',
    lede:
      'Organisations today invest more in employee wellbeing than ever before. Yet burnout continues to rise, wellbeing programmes remain underused, and many employees hesitate to seek support.',
    hero: '/models/imgs/gap.webp',
    accent: '#ff7901',
    tint: ['#2a2f26', '#0b0d0a'],
    chapters: [
      {
        id: 'spend',
        kicker: 'The spend is not the problem.',
        heading: 'More support than ever, used less than ever.',
        paragraphs: [
          'Employee assistance programmes, counselling benefits, apps, awareness weeks and training all sit inside the modern benefits stack. The budget line has grown for a decade.',
          'Utilisation has not grown with it. Support that is bought and never opened costs an organisation twice: once in spend, and again in the belief that the problem has been handled.',
        ],
      },
      {
        id: 'hesitation',
        kicker: 'Three reasons people stop at the door.',
        heading: 'Stigma, visibility and privacy.',
        paragraphs: [
          'Stigma is the fear of being seen differently afterwards. Visibility is the practical worry of who notices the calendar entry, the absence or the referral. Privacy is the question of where the record goes and who can read it.',
          'None of these are objections to therapy. They are objections to the way in. That distinction is the whole reason NEXR exists.',
        ],
      },
      {
        id: 'cost',
        heading: 'What the gap costs an organisation.',
        paragraphs: [
          'Unaddressed strain does not stay quiet. It shows up as absence, as attrition, as a slow decline in the quality of decisions, and as managers absorbing work they were never trained to hold.',
          'The organisations that close this gap are rarely the ones that spend the most. They are the ones that make the first step small enough to take.',
        ],
      },
    ],
    stats: [
      { value: '76%', label: 'Employees who hide struggles at work' },
      { value: '<10%', label: 'Typical annual EAP utilisation' },
      { value: '1 in 4', label: 'Report burnout symptoms' },
      { value: '0', label: 'Names required to start on NEXR' },
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
      'Everyone talks about mental health. Far fewer people ask for help.',
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
      'At NEXR, we believe workplace wellbeing should feel natural, private and engaging. When support is designed around people instead of processes, employees are more likely to begin.',
    hero: '/models/imgs/OurApproach.webp',
    accent: '#ffa863',
    tint: ['#3b4426', '#0d0f0a'],
    chapters: [
      {
        id: 'process',
        kicker: 'Traditional wellbeing starts with a process.',
        heading: 'A form, a queue, a room, a record.',
        paragraphs: [
          'Every one of those steps asks the person to adapt: to disclose before they are ready, to be seen before they feel safe, to book before they know what they need.',
          'People who are already struggling are the least able to absorb that cost. So the support goes unused by exactly the people it was bought for.',
        ],
      },
      {
        id: 'people',
        kicker: 'We start at the other end.',
        heading: 'Natural, private and engaging.',
        paragraphs: [
          'Natural means the first step happens in a space that already feels familiar rather than clinical. Private means anonymity is the default state, not a setting to find. Engaging means the experience is worth returning to before anything is wrong.',
          'Designed this way, wellbeing becomes proactive: daily, intentional resilience building rather than a response to a crisis that has already arrived.',
        ],
      },
      {
        id: 'culture',
        heading: 'Healthier cultures follow, not the other way round.',
        paragraphs: [
          'Psychological safety is not created by a policy announcement. It is created by many small, low-stakes experiences of asking for something and not being penalised for it.',
          'Give people a first step that costs them nothing socially, and the culture around it changes on its own.',
        ],
      },
    ],
    highlights: {
      heading: 'Four principles we design against',
      items: [
        {
          title: 'Private by design',
          body: 'Anonymity is how psychological safety is created. Nobody should choose between getting help and protecting their privacy.',
        },
        {
          title: 'Accessible first',
          body: 'The wider platform runs on the phones and laptops people already own. No hardware purchase, no queue, no waiting room.',
        },
        {
          title: 'Immersive engagement',
          body: 'Interactive, guided and safe experiences, engaging enough to become part of everyday life.',
        },
        {
          title: 'Clinically grounded',
          body: 'Established psychological practice, delivered by trained professionals and tested in clinical contexts.',
        },
      ],
    },
    gallery: [
      {
        label: 'Designed around people',
        slot: '/explore/belief/01.webp',
        aspect: '3/4',
      },
      {
        label: 'Principles in practice',
        slot: '/explore/belief/02.webp',
        aspect: '4/3',
      },
      {
        label: 'From reactive to proactive',
        slot: '/explore/belief/03.webp',
        aspect: '16/9',
      },
    ],
    quote:
      'NEXR isn’t reinventing mental wellness. It’s reinventing how people access it.',
    deeper: [
      {
        label: 'Our approach',
        href: '/approach#belief',
        note: 'The philosophy in full, including the design principles.',
      },
      {
        label: 'The ecosystem',
        href: '/explore/meloworld',
        note: 'What the belief becomes in practice: MeloWorld.',
      },
    ],
    cta: {
      label: 'Book a demo',
      href: '/contact',
      note: 'Walk through the philosophy with the team that built it.',
    },
  },

  {
    slug: 'meloworld',
    index: '03',
    word: 'MeloWorld',
    eyebrow: 'Different ways in. One way forward.',
    title: 'A private, anonymous space where the first step feels easy.',
    lede:
      'MeloWorld creates a private, anonymous space where employees can take their first step towards support comfortably, as someone nobody in the building can recognise.',
    hero: '/models/imgs/meloworld.webp',
    mark: '/brand/meloworld-mark.webp',
    accent: '#9ff2d4',
    tint: ['#52665a', '#101815'],
    chapters: [
      {
        id: 'anonymous',
        kicker: 'Every person gets an identifier, never a name.',
        heading: 'Anonymity that is structural, not promised.',
        paragraphs: [
          'People arrive as an avatar. There is no photograph, no directory entry and no way for a colleague to place them in the room. The anonymity is a property of how the space is built rather than a policy written about it.',
          'That is what makes a first conversation possible for someone who would never book one under their own name.',
        ],
      },
      {
        id: 'space',
        kicker: 'A space, not a form.',
        heading: 'Familiar enough to enter without preparing.',
        paragraphs: [
          'MeloWorld is closer to a place than to an application. People can look around, spend time there, and reach a professional when they decide to, rather than being asked to declare a problem before anything begins.',
          'Sessions run with qualified psychologists. What changes is the doorway, not the standard of care behind it.',
        ],
      },
      {
        id: 'organisation',
        heading: 'What the organisation sees.',
        paragraphs: [
          'Employers see engagement at the level of the population, never the individual. Nobody is identified for having used the platform, because the platform never held their identity in the first place.',
          'That separation is the point. It is what allows an organisation to measure whether support is working without becoming a reason people avoid it.',
        ],
      },
    ],
    highlights: {
      heading: 'How the first step works',
      items: [
        {
          title: 'Enter as an avatar',
          body: 'No photo, no real name, no colleague able to identify who is in the room.',
        },
        {
          title: 'Look around first',
          body: 'Spend time in the space before speaking to anyone. Nothing is required up front.',
        },
        {
          title: 'Speak when ready',
          body: 'Reach a qualified psychologist inside the same private space, on your own timing.',
        },
      ],
    },
    gallery: [
      {
        label: 'MeloWorld environment',
        slot: '/explore/meloworld/01.webp',
        aspect: '16/9',
      },
      {
        label: 'Avatar and identity',
        slot: '/explore/meloworld/02.webp',
        aspect: '3/4',
      },
      {
        label: 'A session in the space',
        slot: '/explore/meloworld/03.webp',
        aspect: '4/3',
      },
    ],
    quote:
      'The doorway changes. The standard of care behind it does not.',
    deeper: [
      {
        label: 'MeloWorld platform',
        href: '/platform/meloworld',
        note: 'The product page, in detail.',
      },
      {
        label: 'VR Wellness',
        href: '/explore/vr-wellness',
        note: 'The other half of the ecosystem.',
      },
    ],
    cta: {
      label: 'Book a demo',
      href: '/contact',
      note: 'See MeloWorld running, and how it would sit in your workplace.',
    },
  },

  {
    slug: 'vr-wellness',
    index: '04',
    word: 'VR Wellness',
    eyebrow: 'The other way in',
    title: 'Immersive, guided experiences, taken at your own pace.',
    lede:
      'VR Wellness offers immersive, guided experiences that help people work through challenges and build resilience at a pace they set themselves.',
    hero: '/models/imgs/vrworld.webp',
    accent: '#b9b4ff',
    tint: ['#4a4270', '#0e0c17'],
    chapters: [
      {
        id: 'guided',
        kicker: 'Paced by a clinician, never by a headset.',
        heading: 'Immersion is the method, not the attraction.',
        paragraphs: [
          'Every experience is assessed, consented and monitored, and it stops the moment it should. The technology is there because graded, repeatable exposure is difficult to arrange in the real world, not because it is novel.',
          'Progress that felt impossible in a consulting room becomes possible when the situation can be entered a step at a time and left at will.',
        ],
      },
      {
        id: 'resilience',
        kicker: 'Not only for acute difficulty.',
        heading: 'Building resilience before it is needed.',
        paragraphs: [
          'Alongside structured work on specific challenges, the library covers regulation, focus and recovery: short guided experiences people use regularly rather than in a crisis.',
          'This is what turns wellbeing from something an organisation offers into something its people practise.',
        ],
      },
      {
        id: 'safety',
        heading: 'Safety is designed in.',
        paragraphs: [
          'Sessions are bounded in length, supervised where the content requires it, and always under the participant’s control. Nobody is held in an experience they want to leave.',
          'Clinical oversight covers what is offered, to whom, and when to stop, which is the difference between a therapeutic tool and a demo.',
        ],
      },
    ],
    highlights: {
      heading: 'What the experiences cover',
      items: [
        {
          title: 'Graded exposure',
          body: 'Structured work on heights, flying, speaking and social anxiety, assessed and consented before it begins.',
        },
        {
          title: 'Regulation and recovery',
          body: 'Short guided sessions for stress, focus and sleep, designed for regular use.',
        },
        {
          title: 'Clinician in the loop',
          body: 'Progression, pacing and stopping points are set by a professional, not by the software.',
        },
      ],
    },
    gallery: [
      {
        label: 'Immersive environment',
        slot: '/explore/vr-wellness/01.webp',
        aspect: '16/9',
      },
      {
        label: 'Guided session',
        slot: '/explore/vr-wellness/02.webp',
        aspect: '4/3',
      },
      {
        label: 'Resilience library',
        slot: '/explore/vr-wellness/03.webp',
        aspect: '3/4',
      },
    ],
    quote:
      'The pace belongs to the person in the experience, always.',
    deeper: [
      {
        label: 'VR Wellness platform',
        href: '/platform/vr-wellness',
        note: 'The product page, in detail.',
      },
      {
        label: 'Clinical grounding',
        href: '/explore/clinical',
        note: 'Who built it, and how it was tested.',
      },
    ],
    cta: {
      label: 'Book a demo',
      href: '/contact',
      note: 'Try a guided experience with our clinical team.',
    },
  },

  {
    slug: 'clinical',
    index: '05',
    word: 'Clinical',
    eyebrow: 'Creating psychologically safer workplaces',
    title: 'Where clinical expertise meets immersive technology.',
    lede:
      'Whether you are supporting employees across an enterprise or students within an educational institution, NEXR helps create environments where wellbeing is approachable, engaging and accessible.',
    hero: '/models/imgs/clinicallygrounded.webp',
    accent: '#8fe3e8',
    tint: ['#1f3a3a', '#080e0e'],
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
    accent: '#ffb589',
    tint: ['#6b7a2e', '#12150a'],
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
