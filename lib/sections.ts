/**
 * The six beats of the home experience.
 *
 * One entry per beat and everything downstream derives from the array length:
 * the scroll track is divided evenly, the character's pose clip is sampled at
 * `SECTIONS.length` checkpoints, the sky lerps between consecutive `sky` pairs,
 * and the HUD rail draws one tick per entry. Adding a seventh beat means adding
 * one object here and nothing else.
 *
 * The narrative the script hands us has eight blocks — hero, problem, belief,
 * ecosystem, products, audience, credibility, call to action — and the scene has
 * six poses. The hero lives in StoryOverlay rather than here, the ecosystem line
 * rides in as the kicker on the MeloWorld beat, and the audience statement is
 * the kicker on the credibility beat. Nothing from the script is dropped.
 */

export type Section = {
  id: string
  /** Small mono label above the big word, reference-style ("01 / The gap"). */
  index: string
  /** The large serif word pinned to the bottom of the frame. */
  word: string
  /**
   * The quieter line that sets up the headline. The script writes several beats
   * as a small line followed by a large one, and this is the small one.
   */
  kicker?: string
  headline: string
  body: string
  /** Short statements drawn as a stack of tiles under the body. */
  tiles?: string[]
  /** Pull quote set beside the beat, used to close the page. */
  quote?: string
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
    kicker: 'The barrier isn’t always the support.',
    headline: 'It’s the way in.',
    body:
      'Organisations today invest more in employee wellbeing than ever before. Yet burnout continues to rise, wellbeing programmes remain underused, and many employees hesitate to seek support because of stigma, fear of judgement or concerns around privacy.',
    cta: { label: 'Explore the gap', route: '/explore/gap' },
    images: ['/models/imgs/gap.webp'],
    sky: ['#59684f', '#1b2419'],
    fog: '#4a5843',
    accent: '#ff7901',
  },
  {
    id: 'belief',
    index: '02',
    word: 'Belief',
    kicker: 'Stop making people fit wellbeing.',
    headline: 'Make wellbeing fit people.',
    body:
      'At NEXR, we believe workplace wellbeing should feel natural, private and engaging. When support is designed around people instead of processes, organisations create healthier cultures and employees are more likely to begin their wellbeing journey.',
    cta: { label: 'Explore our belief', route: '/explore/belief' },
    images: ['/models/imgs/OurApproach.webp'],
    sky: ['#6d7a55', '#20281b'],
    fog: '#5b6749',
    accent: '#ffa863',
  },
  {
    id: 'meloworld',
    index: '03',
    word: 'MeloWorld',
    kicker: 'Different ways in. One way forward.',
    headline: 'A private space where the first step feels easy.',
    body:
      'MeloWorld creates a private, anonymous space where employees can take their first step towards support comfortably. It is one half of a connected ecosystem designed for modern workplaces.',
    cta: { label: 'Explore MeloWorld', route: '/explore/meloworld' },
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
    kicker: 'The other way in.',
    headline: 'Immersive experiences, taken at your own pace.',
    body:
      'VR Wellness offers immersive, guided experiences that help people work through challenges and build resilience at their own pace. Together with MeloWorld, it forms one connected wellbeing ecosystem.',
    cta: { label: 'Explore VR Wellness', route: '/explore/vr-wellness' },
    images: ['/models/imgs/vrworld.webp'],
    sky: ['#5b5a7d', '#16151f'],
    fog: '#4a4a68',
    accent: '#b9b4ff',
  },
  {
    id: 'clinical',
    index: '05',
    word: 'Clinical',
    kicker: 'Creating psychologically safer workplaces.',
    headline: 'Where clinical expertise meets immersive technology.',
    body:
      'Whether you are supporting employees across an enterprise or students within an educational institution, NEXR helps create psychologically safer environments where wellbeing becomes approachable, engaging and accessible.',
    tiles: [
      'Developed with mental health professionals.',
      'Tested in clinical practice.',
      'Designed for the realities of modern workplaces.',
    ],
    cta: { label: 'Explore the evidence', route: '/explore/clinical' },
    images: ['/models/imgs/clinicallygrounded.webp'],
    sky: ['#4c6a6b', '#121b1c'],
    fog: '#3d5657',
    accent: '#8fe3e8',
  },
  {
    id: 'contact',
    index: '06',
    word: 'Let’s Talk',
    kicker: 'One connected ecosystem.',
    headline: 'The next way into wellbeing starts here.',
    body:
      'Bring the way in to your people. We will shape the right entry point for your workplace or campus, and show you the whole ecosystem in a live walkthrough.',
    quote:
      'Healthier organisations begin with people who feel safe enough to seek support.',
    cta: { label: 'Book a demo', route: '/contact' },
    images: ['/models/imgs/letsconnect.webp'],
    sky: ['#78834a', '#232717'],
    fog: '#646e3e',
    accent: '#ffb589',
  },
]

export const SECTION_COUNT = SECTIONS.length

/** Every panel image in the deck, used to seed the ambient background field. */
export const ALL_PANEL_IMAGES = SECTIONS.flatMap((s) => s.images)
