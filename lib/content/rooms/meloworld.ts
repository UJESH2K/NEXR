import type { ExploreTopic } from '../types'

/** Doc tab: "Meloworld". */
export const meloworld: ExploreTopic = {
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
  // The tab asks for an embedded intro/tutorial video beside the hero.
  // Paste the YouTube video id here (the part after "v=") to put it live.
  video: { title: 'MeloWorld intro and tutorial' },
  mark: '/brand/meloworld-mark.webp',
  face: '/brand/melo/face-3.webp',
  accent: '#ff8a2a',
  tint: ['#a65f20', '#341c08'],
  readMoreLabel: 'Explore MeloWorld',
  chapters: [
    {
      id: 'be-yourself',
      heading: 'A space where you can be yourself',
      paragraphs: [
        'MeloWorld lets people enter through an avatar, without a photograph or public-facing profile. This creates space to explore what’s on their mind without the added pressure of being recognized or having to explain themselves to others.',
      ],
    },
    {
      id: 'belong',
      heading: 'Support feels different when you feel you belong',
      paragraphs: [
        'Taking the first step can feel easier when you have a space where you feel comfortable being yourself. MeloWorld aims to make wellbeing more approachable by bringing together a welcoming virtual environment, opportunities to explore, and access to qualified professionals.',
        'Whether you’re figuring things out on your own or ready to seek guidance, you can take the next step when it feels right for you.',
      ],
      image: '/models/imgs/art/connect.webp',
    },
    {
      id: 'insight',
      heading: 'Get insight without intrusion',
      paragraphs: [
        'Organizations and educational institutions need to understand whether their wellbeing initiatives are reaching people. MeloWorld provides insight into overall platform engagement without giving organizations access to individual identities.',
        'This helps decision-makers understand how the platform is being used while respecting the privacy of the people who use it.',
      ],
    },
  ],
  highlights: {
    heading: 'How to use MeloWorld?',
    layout: 'steps',
    items: [
      {
        title: 'Enter your own space.',
        body: 'Choose an avatar and step into MeloWorld’s virtual world. Begin exploring in an environment designed to make wellbeing feel more approachable, with less pressure to present yourself as you would offline.',
      },
      {
        title: 'Find what feels right for you.',
        body: 'Explore the virtual space, discover different experiences, and take the time to understand what feels relevant to you. There’s no need to rush or follow a prescribed path.',
      },
      {
        title: 'Connect when you’re ready.',
        body: 'When you’re ready for additional support, connect with a qualified mental health professional within the platform. Explore what’s on your mind in a supportive setting and take the next step at a pace that feels comfortable for you.',
      },
    ],
  },
  deeper: [
    { label: 'VR Wellness', href: '/explore/vr-wellness' },
    { label: 'Trust', href: '/trust' },
  ],
}
