/**
 * The six beats of the home experience.
 *
 * One entry per beat and everything downstream derives from the array length:
 * the scroll track is divided evenly, the character's pose clip is sampled at
 * `SECTIONS.length` checkpoints, the sky lerps between consecutive `sky` pairs,
 * and the HUD rail draws one tick per entry. Adding a seventh beat means adding
 * one object here and nothing else.
 *
 * The script hands us six numbered blocks — NEXR, MeloWorld, VR Wellness, Our
 * Approach, Built on Trust, Let's Talk — and the scene has six poses, so the
 * two line up one to one. There is no separate opening title frame any more:
 * the page starts on beat 01. The audience block the script leaves unnumbered
 * rides along as the aside on the VR Wellness beat, which is where the script
 * places it and the only reading that keeps 04 as Our Approach rather than 05.
 * Nothing from the script is dropped.
 */

export type Section = {
  id: string
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
   * blocks are named things — "Workplaces", "Educational Institutes",
   * "Healthcare" — and a bare sentence loses the name that makes the set
   * scannable.
   */
  tiles?: { title: string; body: string; href: string }[]
  /**
   * Marks the closing beat, whose call to action is drawn as a card in the
   * aside column rather than as a text link.
   *
   * This was a `quote` field and the card was built around a pull quote.
   * That line was not in the approved script, so it is gone; a flag is what
   * is left, because the card is layout rather than copy.
   */
  closing?: boolean
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
    id: 'nexr',
    word: 'NEXR',
    // 01 / NEXR. The opening beat, and now the first thing on the page: the
    // held title frame that used to sit above it has been removed, so this is
    // where the visit starts.
    headline: 'Step into wellbeing. On your terms.',
    body:
      'Experience a more private way to prioritize your well-being through immersive VR experiences and anonymous access to expert support, all designed around you.',
    cta: { label: 'Explore NEXR', route: '/explore' },
    images: ['/models/imgs/gap.webp'],
    sky: ['#9f6021', '#311c08'],
    fog: '#84501d',
    accent: '#ff7901',
  },
  {
    id: 'meloworld',
    word: 'MeloWorld',
    // 02 / MELOWORLD.
    headline: 'A safe space to begin with',
    body:
      'Share what’s on your mind in an immersive VR environment, speak with professionals through virtual characters, and get guidance anonymously, without the pressure of revealing your identity or fear of being judged.',
    cta: { label: 'Explore Meloworld', route: '/explore/meloworld' },
    images: ['/models/imgs/meloworld.webp'],
    mark: '/brand/meloworld-mark.webp',
    sky: ['#a25f20', '#321c08'],
    fog: '#87501d',
    accent: '#ff8118',
  },
  {
    /*
     * 03 / VR WELLNESS.
     *
     * This beat also carries the three audiences. The script places that block
     * immediately after the VR Wellness copy and leaves it unnumbered, and the
     * numbering only stays consistent — 04 is Our Approach, not 05 — if the
     * audiences ride along with a beat rather than taking one of their own. So
     * they sit in the aside beside this beat (and in the tab strip below it on
     * a phone), with their copy unchanged apart from the renamed first tile.
     */
    id: 'vr-wellness',
    word: 'VR Wellness',
    headline: 'A new way to face what life brings.',
    body:
      'Explore immersive VR experiences designed to help you practice relaxation, build confidence, and develop emotional resilience in a guided virtual environment.',
    tiles: [
      {
        title: 'Workplaces',
        body: 'Create more approachable ways for employees to explore wellbeing, build healthier habits and access professional support.',
        href: '/explore/vr-wellness#workplaces',
      },
      {
        title: 'Educational Institutes',
        body: 'Give students safe, engaging ways to understand their wellbeing, build emotional skills and access support when they need it.',
        href: '/explore/vr-wellness#education',
      },
      {
        title: 'Healthcare',
        body: 'Extend the toolkit available to mental health professionals with immersive environments and digital experiences that can complement existing care.',
        href: '/explore/vr-wellness#healthcare',
      },
    ],
    cta: { label: 'Explore Solutions', route: '/explore/vr-wellness' },
    images: ['/models/imgs/vrworld.webp'],
    sky: ['#a65f20', '#341c08'],
    fog: '#89501c',
    accent: '#ff8a2a',
  },
  {
    id: 'approach',
    word: 'Our Approach',
    // 04 / OUR APPROACH.
    kicker: 'Wellbeing doesn’t need another rulebook.',
    headline: 'Different people. Different needs. A more human approach.',
    body:
      'Not everyone finds support in the same way. We combine immersive VR experiences, anonymity, and expert guidance to give people more choice in how they engage with wellbeing. Less pressure to take a prescribed path. More freedom to find what feels right for them.',
    cta: { label: 'Discover Our Approach', route: '/approach' },
    images: ['/models/imgs/OurApproach.webp'],
    sky: ['#a95e1f', '#361c08'],
    fog: '#8c4f1c',
    accent: '#ff8422',
  },
  {
    id: 'trust',
    word: 'Built on Trust',
    // 05 / BUILT ON TRUST.
    headline: 'Feel safe enough to take the first step.',
    body:
      'Your wellbeing journey should begin with comfort, not concern. NEXR brings together anonymous access, immersive virtual spaces, and expert guidance to help you explore what’s on your mind without the pressure of being judged or sharing more than you’re comfortable with.',
    cta: { label: 'Our Standards', route: '/trust' },
    images: ['/models/imgs/clinicallygrounded.webp'],
    sky: ['#ad5d1f', '#381c08'],
    fog: '#8f4f1c',
    accent: '#ff7d16',
  },
  {
    id: 'contact',
    word: 'Let’s Talk',
    // 06 / LET'S TALK.
    headline: 'Make space for a better kind of wellbeing',
    body:
      'Discover how NEXR brings immersive VR experiences, anonymous access, and expert guidance together to make wellbeing more private, engaging, and accessible across workplaces, educational institutions, and healthcare settings.',
    // The script gives this beat a headline, a body and a call to action and
    // nothing else, so that is all it carries. The flag only tells BeatAside
    // to draw that call to action as the closing card.
    closing: true,
    cta: { label: 'Book A Demo', route: '/contact' },
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
