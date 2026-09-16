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
   * blocks are named things — "For Workplaces", "For Education" — and a bare
   * sentence loses the name that makes the set scannable.
   */
  tiles?: { title: string; body: string; href: string }[]
  /**
   * Short single-line statements, set as a compact row under the body.
   *
   * Distinct from `tiles` on purpose. The credibility lines are assertions, not
   * destinations: they want to be read in one sweep, not clicked, and giving
   * them the card treatment made them look like three more things to go and do.
   */
  proof?: string[]
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
    kicker: 'People need support.',
    headline: 'But reaching out isn’t always easy.',
    body:
      'Organisations today invest more in employee wellbeing than ever before. Yet burnout continues to rise, wellbeing programmes remain underused, and many employees hesitate to seek support because of stigma, fear of judgement or concerns around privacy.',
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
    kicker: 'Stop making people fit wellbeing.',
    headline: 'Make wellbeing fit people.',
    body:
      'At NEXR, we believe workplace wellbeing should feel natural, private and engaging. When support is designed around people instead of processes, organisations create healthier cultures and employees are more likely to begin their wellbeing journey.',
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
    kicker: 'A new ecosystem for workplace wellbeing.',
    headline: 'A private space, explored anonymously.',
    body:
      'MeloWorld is a private virtual space where employees can explore their wellbeing anonymously. Choose your avatar, explore different spaces and connect with trained mental health professionals in a comfortable setting.',
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
    kicker: 'The other way in.',
    headline: 'Guided immersion, built around real needs.',
    body:
      'VR Wellness is a guided VR experience designed to support mental wellbeing. From relaxation to building confidence, employees can explore experiences shaped around different wellbeing needs. Together with MeloWorld it forms one connected ecosystem, designed for modern workplaces.',
    cta: { label: 'Explore VR Wellness', route: '/explore/vr-wellness' },
    images: ['/models/imgs/vrworld.webp'],
    sky: ['#a95e1f', '#361c08'],
    fog: '#8c4f1c',
    accent: '#ff8422',
  },
  {
    /*
     * Two blocks of the script share this beat: who NEXR is for, and what it is
     * built on. There are six poses in the character's clip and therefore six
     * beats, and the alternative was to drop one block from the page entirely.
     *
     * They merge cleanly because they answer the same buyer question from two
     * sides — the audience cards say who it is for, the proof line says why it
     * can be trusted — and the two treatments stay visually distinct: cards on
     * the far side of the figure, a single quiet row under the copy.
     */
    id: 'clinical',
    index: '05',
    word: 'Who It’s For',
    kicker: 'Designed for people. Built for organisations.',
    headline: 'Expertise meets innovation.',
    body:
      'NEXR works with organisations, educational institutions and healthcare teams to make mental wellbeing more accessible, engaging and easy to approach.',
    tiles: [
      {
        title: 'For Workplaces',
        body: 'Private, engaging ways for employees to access and explore wellbeing.',
        href: '/for/workplaces',
      },
      {
        title: 'For Education',
        body: 'Help students make mental wellbeing a more natural part of everyday life.',
        href: '/for/education',
      },
      {
        title: 'For Healthcare',
        body: 'Immersive tools designed to complement the work of mental health professionals.',
        href: '/for/healthcare',
      },
    ],
    proof: [
      'Developed with mental health professionals.',
      'Tested in clinical practice.',
      'Designed for the realities of modern workplaces.',
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
    word: 'Let’s Talk',
    kicker: 'One connected ecosystem.',
    headline: 'The next way into wellbeing starts here.',
    body:
      'Bring the way in to your people. We will shape the right entry point for your workplace or campus, and show you the whole ecosystem in a live walkthrough.',
    quote:
      'Healthier organisations begin with people who feel safe enough to seek support.',
    cta: { label: 'Book a demo', route: '/contact' },
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
