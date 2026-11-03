/**
 * Shapes shared by the content files in this folder.
 *
 * Every string the site shows lives in lib/content (and the home story in
 * lib/sections.ts). Components only lay the words out — they never hold copy
 * of their own.
 */

export type ExploreChapter = {
  id: string
  heading: string
  /** Shorter label for the "In this room" strip. Falls back to `heading`. */
  navLabel?: string
  paragraphs: string[]
  /** Optional artwork drawn beside this chapter. */
  image?: string
}

export type ExploreHighlight = {
  /** Anchor id, so a card can be linked to directly. */
  id?: string
  title: string
  body: string
  /** A call to action on the card, where the document gives one. */
  cta?: { label: string; href: string }
}

export type ExploreLink = {
  label: string
  href: string
}

export type ExploreTopic = {
  slug: string
  word: string
  /** Small line above the hero title. Hidden when it repeats `word`. */
  eyebrow: string
  /** The line under this room's name on the Explore page. */
  listNote: string
  title: string
  /** One paragraph or several. */
  lede: string | string[]
  hero: string
  /**
   * An intro video beside the hero copy, where the document asks for one.
   * Until `youtubeId` is set the hero image stands in.
   */
  video?: { title: string; youtubeId?: string }
  mark?: string
  /** Melo's face for this room, used on the previous/next cards. */
  face: string
  accent: string
  tint: [string, string]
  chapters: ExploreChapter[]
  /**
   * A set of cards under the chapters. `layout` picks the component, so each
   * room reads differently: a bento grid for principles, a path for steps,
   * link cards for audiences.
   */
  highlights?: {
    heading: string
    layout: 'bento' | 'steps' | 'audiences'
    items: ExploreHighlight[]
  }
  quote?: string
  deeper: ExploreLink[]
  /** Secondary hero link, e.g. "Keep Reading". */
  readMoreLabel?: string
}
