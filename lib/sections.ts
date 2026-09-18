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
  /**
   * Card blocks drawn on the far side of the figure, one per entry.
   *
   * These carry a title as well as a line of copy because the script's card
   * blocks are named things — "Workplaces", "Schools & Colleges", "Healthcare"
   * — and a bare sentence loses the name that makes the set scannable.
   */
  tiles?: { title: string; body: string; href: string }[]
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
   *
   * The run barely travels at all, and that is deliberate.
   *
   * The character's suit is #ff7901, hue 28°. The six beats span 30° to 25.5° —
   * four and a half degrees, start to finish. Lightness moves three points,
   * saturation five. It is one colour breathing rather than a journey through
   * several, and it stays orange the whole way.
   *
   * Two earlier versions overshot in opposite directions and both were wrong
   * for the same reason. One slid to hue 10°, which is red: the room stopped
   * belonging to the figure standing in it. Another opened on a pale amber,
   * which erased the interface. The colour's job here is to be a constant the
   * visitor navigates by, not a variable that tells them where they are — the
   * rail, the numerals and the big word already do that.
   *
   * Brightness is the constrained axis, and it was constrained the hard way. A
   * much lighter version of this palette (horizons around 65% lightness) looked
   * good in isolation and destroyed everything drawn on top of it: the orange
   * mark, the orange numerals and the outlined buttons all sat within a few
   * percent of that value, so the interface fell to a contrast ratio of about
   * 1.4 against its own background and simply vanished.
   *
   * The horizons now sit at 35–41% lightness, and that is close to the ceiling.
   * The mark measures about 5.7 against the scrimmed frame here, down from 6.7
   * at 28–34% and heading toward the 3.0 floor where a control stops being
   * reliably visible. There is perhaps one more step of this available; there is
   * not two. If these values are raised again, check that ratio rather than the
   * swatch — the swatch is what made the 1.4 version look reasonable.
   *
   * Horizon is always the lighter of the pair, and the shader mixes toward white
   * in the denser cloud noise above it, which is what gives the sky its lit
   * tops.
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
    // S2 — THE PROBLEM. The PDF gives this as one two-line headline rather
    // than a kicker-then-headline pair, so both lines live in `headline` and
    // wrap naturally rather than being split across two type sizes.
    headline: 'We\u2019ve solved for availability. Have we solved for approachability?',
    body:
      'Having support available is only one part of the journey. What matters is how comfortable someone feels taking that first step. Reaching out can be difficult when you\u2019re unsure what to say, who to speak to, or whether you\u2019re ready at all. Sometimes, people simply need a little time, privacy, or a different way to begin. Wellbeing works better when the way in feels as personal as the need itself.',
    cta: { label: 'Explore the gap', route: '/explore/gap' },
    images: ['/models/imgs/gap.webp'],
    sky: ['#9f6021', '#311c08'],
    fog: '#84501d',
    accent: '#ff7901',
  },
  {
    id: 'belief',
    index: '02',
    word: 'Belief',
    // S3 — BELIEF.
    kicker: 'Stop making people fit wellbeing.',
    headline: 'Make wellbeing fit people.',
    body:
      'People don\u2019t experience wellbeing in the same way. The right starting point could be a private space, a guided experience, a conversation with a professional, or simply the opportunity to understand what you\u2019re feeling first. At NEXR, we believe wellbeing should adapt to the person, the setting and the need. Because wellbeing should work around people, not the other way around.',
    cta: { label: 'Explore our belief', route: '/explore/belief' },
    images: ['/models/imgs/OurApproach.webp'],
    sky: ['#a25f20', '#321c08'],
    fog: '#87501d',
    accent: '#ff8118',
  },
  {
    id: 'meloworld',
    index: '03',
    word: 'MeloWorld',
    // S5 — PRODUCTS / MELOWORLD.
    headline: 'A private space to begin.',
    body:
      'An anonymous virtual environment where people can explore their wellbeing, move at their own pace and connect with qualified mental health professionals when they\u2019re ready.',
    cta: { label: 'Explore MeloWorld', route: '/explore/meloworld' },
    images: ['/models/imgs/meloworld.webp'],
    mark: '/brand/meloworld-mark.webp',
    sky: ['#a65f20', '#341c08'],
    fog: '#89501c',
    accent: '#ff8a2a',
  },
  {
    id: 'vr-wellness',
    index: '04',
    word: 'VR Wellness',
    // S6 — PRODUCTS / VR WELLNESS.
    headline: 'Experience it before you face it.',
    body:
      'Guided virtual experiences designed around specific wellbeing, learning and therapeutic needs, from relaxation and emotional regulation to confidence-building and gradual exposure.',
    cta: { label: 'Explore VR Wellness', route: '/explore/vr-wellness' },
    images: ['/models/imgs/vrworld.webp'],
    sky: ['#a95e1f', '#361c08'],
    fog: '#8c4f1c',
    accent: '#ff8422',
  },
  {
    /*
     * S7 — WHERE NEXR FITS. There are six poses in the character's clip and
     * therefore six beats, and this is the one the audience block occupies.
     */
    id: 'clinical',
    index: '05',
    word: 'Who It\u2019s For',
    headline: 'Designed for people. Built for organisations.',
    body:
      'NEXR adapts to the people and environments it serves, bringing new ways to engage with wellbeing into everyday spaces.',
    tiles: [
      {
        title: 'Workplaces',
        body: 'Create more approachable ways for employees to explore wellbeing, build healthier habits and access professional support.',
        href: '/for/workplaces',
      },
      {
        title: 'Schools & Colleges',
        body: 'Give students safe, engaging ways to understand their wellbeing, build emotional skills and access support when they need it.',
        href: '/for/education',
      },
      {
        title: 'Healthcare',
        body: 'Extend the toolkit available to mental health professionals with immersive environments and digital experiences that can complement existing care.',
        href: '/for/healthcare',
      },
    ],
    cta: { label: 'Explore the evidence', route: '/explore/clinical' },
    images: ['/models/imgs/clinicallygrounded.webp'],
    sky: ['#ad5d1f', '#381c08'],
    fog: '#8f4f1c',
    accent: '#ff7d16',
  },
  {
    id: 'contact',
    index: '06',
    word: 'Let\u2019s Talk',
    // CLOSING CTA — common for all sub pages.
    headline: 'The next way into wellbeing starts here.',
    body:
      'Discover how NEXR can bring a new approach to your organisation, institution or practice.',
    quote: 'Better wellbeing starts when the way in feels right.',
    cta: { label: 'Book a Demo', route: '/contact' },
    images: ['/models/imgs/letsconnect.webp'],
    sky: ['#b05c1e', '#391c08'],
    fog: '#924e1b',
    accent: '#ff7609',
  },
]

export const SECTION_COUNT = SECTIONS.length

/**
 * Look a beat up by id.
 *
 * The product pages (`/platform/meloworld`, `/trust`, and so on) are not part
 * of the scroll — each one is a single beat's argument told at length. They
 * used to carry their own copy of that beat's colours, keyed by matching a
 * page title string against a dictionary in PageShell. The keys and the titles
 * drifted apart within a few edits, silently: three of the five pages were
 * falling through to a default gradient and never showing their hero image at
 * all. Looking the beat up by its stable id instead of its display title means
 * a page can only be wrong about its own colours if it names the wrong beat.
 */
export function sectionById(id: string): Section {
  const found = SECTIONS.find((section) => section.id === id)
  if (!found) {
    throw new Error(`No section with id "${id}" — check the beatId prop.`)
  }
  return found
}

/** Every panel image in the deck, used to seed the ambient background field. */
export const ALL_PANEL_IMAGES = SECTIONS.flatMap((s) => s.images)
