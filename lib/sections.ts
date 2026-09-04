/**
 * The six beats of the home experience.
 *
 * One entry per beat and everything downstream derives from the array length:
 * the scroll track is divided evenly, the character's pose clip is sampled at
 * `SECTIONS.length` checkpoints, the sky lerps between consecutive `sky` pairs,
 * and the HUD rail draws one tick per entry. Adding a seventh beat means adding
 * one object here and nothing else.
 *
 * Copy is lifted from NEXR_STRATEGY.md — this file is the runtime mirror of the
 * approved home narrative, so edits there belong here too.
 */

export type Section = {
  id: string
  /** Small mono label above the big word, reference-style ("01 / The gap"). */
  index: string
  /** The large serif word pinned to the bottom of the frame. */
  word: string
  headline: string
  body: string
  cta: { label: string; route: string }
  /** Panel artwork drawn around the character during this beat. */
  images: string[]
  /**
   * Optional product mark shown beside the beat's label.
   *
   * MeloWorld's is the same infinity mark the character wears on her chest, so
   * showing it here ties the figure in the room to the product being described
   * without a caption having to say so.
   */
  mark?: string
  /**
   * Sky gradient for this beat: [horizon, zenith]. The environment sphere
   * cross-fades between the current and next beat's pair as you scroll, which
   * is what makes the 360 read as one continuous space rather than six rooms.
   */
  sky: [string, string]
  /** Fog colour — kept close to the horizon so panels dissolve into the sky. */
  fog: string
  /** Accent used by the HUD, panel edges and rim light during this beat. */
  accent: string
}

export const SECTIONS: Section[] = [
  {
    id: 'gap',
    index: '01',
    word: 'The Gap',
    headline: 'The barrier isn’t always the support. It’s the way in.',
    body:
      'Organisations invest more in wellbeing than ever. Yet burnout rises, programmes go unused, and people hesitate because of stigma, judgement and privacy.',
    cta: { label: 'See the gap', route: '/approach#gap' },
    images: ['/models/imgs/gap.webp'],
    sky: ['#59684f', '#1b2419'],
    fog: '#4a5843',
    accent: '#d8f35d',
  },
  {
    id: 'belief',
    index: '02',
    word: 'Belief',
    headline: 'Stop making people fit wellbeing. Make wellbeing fit people.',
    body:
      'Support should feel natural, private and engaging. Designed around people instead of processes, it becomes something they actually begin.',
    cta: { label: 'Read the manifesto', route: '/approach#belief' },
    images: ['/models/imgs/OurApproach.webp'],
    sky: ['#6d7a55', '#20281b'],
    fog: '#5b6749',
    accent: '#e4f78a',
  },
  {
    id: 'meloworld',
    index: '03',
    word: 'MeloWorld',
    headline: 'A private first step, taken as someone nobody can recognise.',
    body:
      'An anonymous, avatar-led space where employees meet psychologists without meeting judgement. Every person gets an ID, never a name.',
    cta: { label: 'Enter MeloWorld', route: '/platform/meloworld' },
    images: ['/models/imgs/meloworld.webp'],
    mark: '/brand/meloworld-mark.webp',
    sky: ['#4f6f66', '#131f1c'],
    fog: '#3f5c54',
    accent: '#9ff2d4',
  },
  {
    id: 'vr-wellness',
    index: '04',
    word: 'VR Wellness',
    headline: 'Guided immersion, paced by a clinician, never by a headset.',
    body:
      'Exposure work for heights, flying, speaking and social anxiety — assessed, consented, monitored, and stopped the moment it should be.',
    cta: { label: 'See VR Wellness', route: '/platform/vr-wellness' },
    images: ['/models/imgs/vrworld.webp'],
    sky: ['#5b5a7d', '#16151f'],
    fog: '#4a4a68',
    accent: '#b9b4ff',
  },
  {
    id: 'clinical',
    index: '05',
    word: 'Clinical',
    headline: 'Where clinical expertise meets immersive technology.',
    body:
      'Built with mental health professionals, tested in clinical practice, and used in hospital contexts. Technology is the how, never the headline.',
    cta: { label: 'Open the trust centre', route: '/trust' },
    images: ['/models/imgs/clinicallygrounded.webp'],
    sky: ['#4c6a6b', '#121b1c'],
    fog: '#3d5657',
    accent: '#8fe3e8',
  },
  {
    id: 'contact',
    index: '06',
    word: 'Let’s Talk',
    headline:
      'Healthier organisations begin with people who feel safe enough to seek support.',
    body:
      'Bring the way in to your people. We will shape the right entry point for your workplace or campus.',
    cta: { label: 'Book a demo', route: '/contact' },
    images: ['/models/imgs/letsconnect.webp'],
    sky: ['#78834a', '#232717'],
    fog: '#646e3e',
    accent: '#e8ff7a',
  },
]

export const SECTION_COUNT = SECTIONS.length

/** Every panel image in the deck, used to seed the ambient background field. */
export const ALL_PANEL_IMAGES = SECTIONS.flatMap((s) => s.images)
