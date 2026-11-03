import type { ExploreTopic } from '../types'

/**
 * Doc tab: "VR Wellness". The hero is kept as it is (the tab marks it the
 * same), followed by the three environments.
 */
export const vrWellness: ExploreTopic = {
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
    heading: 'Designed for different environments',
    layout: 'audiences',
    items: [
      {
        id: 'workplaces',
        title: 'Workplaces',
        body: 'Give employees guided VR experiences to practise relaxation, build confidence, manage everyday stress, and develop skills that support their wellbeing.',
        cta: { label: 'Book a Demo', href: '/contact' },
      },
      {
        id: 'education',
        title: 'Educational Institutions',
        body: 'Create engaging opportunities for students to practice emotional resilience, build confidence, and develop healthier ways to navigate academic and everyday challenges.',
        cta: { label: 'Book a Demo', href: '/contact' },
      },
      {
        id: 'healthcare',
        title: 'Healthcare Providers',
        body: 'Extend your existing wellbeing toolkit with guided VR experiences that allow individuals to practice useful skills, explore challenging situations, and complement ongoing professional support.',
        cta: { label: 'Book a Demo', href: '/contact' },
      },
    ],
  },
  deeper: [
    { label: 'MeloWorld', href: '/explore/meloworld' },
    { label: 'Trust', href: '/trust' },
  ],
}
