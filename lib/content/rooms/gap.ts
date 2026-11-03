import type { ExploreTopic } from '../types'

/** Doc tab: "Gap page". */
export const gap: ExploreTopic = {
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
      image: '/models/imgs/art/clinical.webp',
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
}
