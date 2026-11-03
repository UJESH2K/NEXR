import type { ExploreTopic } from '../types'

/** Doc tab: "Belief page". */
export const belief: ExploreTopic = {
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
      image: '/models/imgs/art/vr-left.webp',
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
  // The tab marks the rest of this page as staying the same.
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
}
