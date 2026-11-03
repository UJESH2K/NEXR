# Site copy

Every word on the site comes from the **NEXR web content** Google Doc. Each
doc tab has one file here, so a copy change means opening the file named after
its tab. Components only lay the words out; they hold no copy of their own.

| Doc tab            | File                              | Shows up on                          |
| ------------------ | --------------------------------- | ------------------------------------ |
| Drafts (Brainstorm)| — not used on the site            |                                      |
| Animation page     | `lib/sections.ts`                 | Home scene (the six beats)           |
|                    | `lib/content/closing.ts`          | Let's Talk block closing every page  |
| Explore page       | `lib/content/explore.ts`          | `/explore` intro and Let's Talk row  |
| Gap page           | `lib/content/rooms/gap.ts`        | `/explore/gap`                       |
| Belief page        | `lib/content/rooms/belief.ts`     | `/explore/belief`                    |
| Meloworld          | `lib/content/rooms/meloworld.ts`  | `/explore/meloworld`                 |
| VR Wellness        | `lib/content/rooms/vr-wellness.ts`| `/explore/vr-wellness`               |
| Our approach page  | `lib/content/approach.ts`         | `/approach`                          |
| Trust              | `lib/content/trust.ts`            | `/trust`                             |

Other places with words:

- `lib/explore.ts` puts the rooms in order — change the order of the Explore
  list there.
- `lib/melo/script.ts` is Melo's guide lines (interface help only; page
  messages are read from the files above).
- `lib/contact.ts` holds the contact email.
- `components/site/SiteFooter.tsx` holds the footer link lists and legal line.

## Still waiting on

- **MeloWorld intro video** — set `video.youtubeId` in
  `lib/content/rooms/meloworld.ts` (the id is the part after `v=` in the
  YouTube link). Until then the room shows its artwork.
- **Social links and company details** for the footer.
