# Dot home: Direction C

Approved design for the home page and side panel of the DI design portal.

Goal: rebuild the home page and the side panel to the approved design
"Direction C". The portal has one entry point: Dot's box (Dot is the portal's
assistant, shown as a green orb). Format tiles sit under the box, templates appear
only after a format is picked, and recent work lives in the side panel.
There is NO AI in this step: Dot's replies are scripted and typed text is
matched with simple keywords.

## Design tokens

Use the existing Tailwind/CSS variables where they exist. The values below
are the light theme; the dark theme is in "Theme" at the end.

- DI blue: 50 #EEF9FF, 100 #DAF1FF, 200 #B5E4FF, 300 #82D3FF, 400 #49BCF6,
  500 #00AEEF, 600 #008AC5, 700 #01689D, 800 #0F4772, 900 #1A2A3C (navy).
- Text: #1A2A3C main, #3B4A5A secondary, #5C6B7A muted.
- Lines: #E3E8EE (cards), #EBEEF2 (dividers), #C9D2DB (dashed).
- Buttons and links use 700 (#01689D) for AA contrast; hover 800.
- Orange #F7761F is used ONLY for the Beta badge.
- Fonts: Manrope 500/600 for headings and tile titles; Open Sans 400/600 for body.
  Never use Open Sans 700/bold. Sentence case everywhere.
- Dot orb: border-radius 999px; background
  radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D9FFF0 18%, #6EF2C4 46%,
  #22B99A 68%, #0B6E5C 100%);
  large orb also has box-shadow 0 6px 18px rgba(34,185,154,.35),
  inset 0 -3px 8px rgba(11,110,92,.35). Make it one `<DotOrb size>` component.
- Format colours (tile icons): Deck #01689D, Social post #EC6A8C,
  Two-pager #7E8CFF, Map #00AEEF, Engagement map #22B99A,
  Background #5C6B7A, Email signature #1A2A3C.
- Focus ring: 2px #01689D, offset 2px, on every interactive element.

## 1. Side panel

Replaces the current side panel styling and structure.

- Width 264px, background #F5F6F8 (darker than the white main area), right
  border 1px #EBEEF2,
  padding 20px 12px, gap 18px between blocks. Keep the existing shadcn Sidebar
  behaviour (collapse, mobile off-canvas, cookie for state).
- Header: the Dot orb (28px, static) and, 10px to its right, two lines:
  "Welcome to Dot" (Manrope 600, 14px, #1A2A3C) and the caption
  "Your AI content designer" (Open Sans 400, 12px, #5C6B7A). The orb and the
  two lines link to / (accessible name "Dot home"). "Beta" badge on the right
  (11px, 600, navy text on #F7761F, pill, 2px 8px).
- Footer (shadcn SidebarFooter, pinned to the bottom), one row with a 1px
  #EBEEF2 line above it: the DI logo on the left and the theme toggle on the
  right (see "Theme"), vertically centred. The logo
  (/logos/unicef-digital-inclusion-blue.svg; the existing white file
  /logos/unicef-digital-inclusion-white.svg in the dark theme) is 16px high
  (width auto), and its left edge lines up with the row icons above. It links
  to / (alt "UNICEF Digital Inclusion"). The groups scroll above the footer, so
  it stays at the bottom when they are short and never overlaps them when they
  are long.
- Collapsed (icons only): the header shows only the orb; the footer is hidden.
  The mobile sheet has the same header and footer as desktop.
- Search button: full width, 34px high, radius 8, background #FFFFFF,
  border 1px #E3E8EE, text #5C6B7A 14px, search icon 16px, label "Search",
  "⌘K" key hint on the right (11px, #F2F4F6 bg, border #E3E8EE, radius 6;
  dark: #1A2A3C bg).
  Opens the search/command palette (see section 4). ⌘K / Ctrl+K also opens it.
- "New chat" row: 16px Dot orb + "New chat". Goes to / and clears any
  conversation state.
- Menu order, top to bottom: Welcome header, Search, New chat, Create,
  Brand assets, Brand guidelines, AI skills, Knowledge, then Recent (if any),
  then the footer (`SIDEBAR_MENU` in lib/nav.ts).
- Groups (radius 8, gap 10px between icon and label; children rows 30px,
  13px, #1A2A3C / dark #F8F8F8, left padding 36px, so they start where the
  group label starts):
  - Group titles (Create, Brand assets, Brand guidelines, Knowledge, Recent):
    the title, icon and chevron share one colour, which is only very gray when
    the group is open. Each colour is one token in app/globals.css:

    | State | Token | Light | Dark |
    | --- | --- | --- | --- |
    | Closed | `--sidebar-group-title` | #3B4A5A | #DAE2EA |
    | Closed, hover | `--sidebar-group-title-hover` | #1A2A3C | #F8F8F8 |
    | Open (12px label) | `--sidebar-group-title-open` | #626E7C | #8A9AAB |
    | Open, hover | `--sidebar-group-title-open-hover` | #3B4A5A | #DAE2EA |

    All pass AA on the side panel (#F5F6F8 light, #0F1823 dark): closed 8.4:1
    / 13.7:1, open 4.8:1 / 6.2:1. On the hover fill (#EDF0F3 light, #1A2A3C
    dark) the hover colours are 12.8:1 / 13.7:1 (closed) and 7.9:1 / 11.1:1
    (open). The open light colour was #6B7785 (4.2:1, under AA for the 12px
    label) and is now #626E7C, the closest value that passes.
  - Closed: row 34px, label 14px weight 500, icon 16px. Open: row 28px, label
    12px weight 600, icon 14px (kept in a 16px slot). The change animates
    (150ms ease); with prefers-reduced-motion it is instant.
  - The chevron sits right after the label (gap 6px), 12px, in the title
    colour: right-pointing when closed, down when open.
  - Links (all sub-items, plus New chat and AI skills): #1A2A3C (dark
    #F8F8F8), not gray.
  - Every group is closed by default, Recent included. The group that holds
    the current page opens by itself, so the selected item shows. Open and
    closed groups are not saved between visits.
  - Create: Deck, Social post, Two-pager, Map, Engagement map,
    Virtual background, Email signature. Deck and Two-pager open the external
    builder (see "External tools"); the others go to their tool page.
  - Brand assets: Logos, Illustrations, Image galleries, Photo awards.
  - Brand guidelines: Colors, Typography, DI guidelines (/guidelines/brand),
    Video guidelines.
  - AI skills (single row, no children).
  - Knowledge: Audiences, Facilities, Systems, Offerings, plus the existing
    "Soon" items.
  - Renamed in October 2026: "Assets" became "Brand assets", "Brand" became
    "Brand guidelines", and its child "Brand guidelines" became "DI guidelines"
    (no two items share a name). ⌘K still finds the old names.
- Recent (closed by default, only shown if not empty): last 3 items started from
  Dot (format + template/audience if any, e.g. "Deck · Master deck"),
  stored in localStorage (wrap every read/write in try/catch). No "See all" yet.
- Selected state (for New chat on the home page, and for the current page):
  background #E9EDF1 (dark #22364C), text #1A2A3C, weight 600. Hover
  #EDF0F3 (dark #1A2A3C). Same style everywhere so the hierarchy stays even.

## 2. Home page (/)

Main area: content centred vertically and horizontally, max width 760px,
padding 40px 32px 120px.

a) Heading row (centred, gap 14px, margin-bottom 24px):
   40px Dot orb + h1 "Hi there, what do you need today?"
   (Manrope 600, 28px, letter-spacing -0.02em, line-height 1.2).
   There is no login yet; when a user name exists later, it replaces "there".
   This orb is the only animated one (`<DotOrb animated />`, see "Dot orb
   animation" below); every other orb is static.

b) Dot's box: white, border 1px #E3E8EE, radius 22px,
   shadow 0 10px 32px rgba(26,42,60,.07).
   - Textarea, 2 rows, auto-grow to ~6 rows, no border, padding 20px 22px 4px,
     Open Sans 15px/1.5, placeholder "Describe what you want to make or find".
     Visually hidden label "Ask Dot".
   - Bottom row, right aligned: the "Use DI knowledge" switch, then a 36px
     round send button (#01689D, white up-arrow icon, aria-label "Send to
     Dot").
   - "Use DI knowledge" is shown again for a proof-of-concept demo
     (`showKnowledgeToggle = true` in lib/dot/settings.ts; false hides it).
     It is in Dot's box on the home page and in the reply bar (between the
     input and the send button). It has no effect yet: it only sets
     useKnowledge in the brief, on by default. One component,
     `<KnowledgeSwitch>` (components/dot/format-tiles.tsx), on the theme
     tokens:

     | Part | Light | Dark |
     | --- | --- | --- |
     | Track, on | #01689D | #49BCF6 |
     | Track, off | #C9D2DB | #3A5068 |
     | Knob | #FFFFFF | #0F1823 |
     | Label (13px) | #3B4A5A | #B8C4D0 |

     36x20px track, 16px knob, visible focus ring (2px, the theme's ring
     colour); Space toggles it, and clicking the label does too.
   - Enter sends, Shift+Enter adds a line. Send is disabled when empty.
   - "Use DI knowledge" is stored in the brief (lib/brief.ts, add
     useKnowledge: boolean). Tools that already read knowledge data may use it;
     otherwise it is only stored for now.

c) Bento under the box: margin-top 16px, CSS grid,
   columns 2fr 1fr 1fr 0.55fr, rows 96px 112px, gap 10px, tiles radius 16px.
   - Row 1, col 1, "Create a deck" + sub "From a template or from scratch".
     Background #FFFFFF, border 1px #E3E8EE. Art on the right: three
     overlapping rounded "slide" cards (64x44, radius 8): back one
     linear-gradient(160deg,#82D3FF,#01689D) rotated -9deg; middle and front ones
     frosted glass (white gradient over rgba of 500/300, white 1px border)
     rotated -3deg and 5deg. Title Manrope 600 15px, sub 12px #3B4A5A.
     Opens the deck step (section 3).
   - Row 1, col 2, "Make a map": background #E5F6FD, small art top right
     (40x36 folded map, three panels in #00AEEF, with a white location pin).
     Goes to the Maps page (/materials/maps). It replaced "Make a social
     post", which moved to the + menu.
   - Row 1, col 3, "Write a two-pager": background #EEF0FF, art top right
     (32x42 white page, border #C9CEFF, lines #7E8CFF/#C9CEFF). Opens the
     two-pager builder (see "External tools").
   - Col 4, rows 1-2, "More": white, 1px dashed #C9D2DB, centred 30px grey
     circle (#F2F4F6) with a + icon, label "More" 12px #3B4A5A.
     Opens the + menu (2d).
   - Row 2, cols 1-2, "DI Master deck": background #EEF9FF, border 1px #DAF1FF.
     Left: "Recommended" pill (11px 600, #01689D text, white bg, border #DAF1FF),
     title "DI Master deck" (Manrope 600 17px), sub "All 18 offerings. Dot
     tailors it to your audience." (12px #3B4A5A).
     Right: three mini slides (columns 76px 52px, rows 38px 38px, gap 6px): a
     tall blue cover (gradient 500 to 700, two white lines) spanning both rows,
     then two white mini slides with 1px #DAF1FF border showing two text lines
     and a 3-bar chart. Opens the deck step with "Master deck" already picked
     (while it is "Coming soon", see "External tools").
   - Row 2, col 3, "Get a logo": background #FFFFFF, border 1px #E3E8EE,
     title "Get a logo", sub "DI and Giga logos" (12px #3B4A5A). Art top
     right, at the same offsets as the two-pager page art (12px from the top
     and right): a 42x42 card, #FFFFFF in both themes, border 1px #DAF1FF,
     radius 8px, with the full-colour Giga symbol (no "giga" word) centred
     inside, 26px wide, keeping its aspect ratio. No DI logo. There is no
     symbol-only Giga file, so scripts/build-asset-index.mjs generates one
     from /logos/giga-main-horizontal.svg (every path left of the wordmark,
     cropped) into /generated/logos/giga-symbol{,-white,-black}.svg and adds
     it to the asset index as "Giga symbol". The original file is not edited.
     Links to the Logos page (/logos).
   - Responsive (container queries on the content column): under 720px wide,
     2 columns: Deck, Master deck and Get a logo each take a full row, Map and
     Two-pager share a row, More becomes a normal full-width tile at the end.
     Under 420px, 1 column (the Master deck art is hidden).

d) + menu (shadcn DropdownMenu or Popover, anchored to the More tile, 260px
   wide, radius 14, shadow 0 16px 40px rgba(26,42,60,.16), padding 6px):
   heading "More formats" (12px #5C6B7A), then items with 22px coloured icon
   squares: Make a social post (icon #EC6A8C), Make a map, Make an engagement
   map, Make a virtual background, Make an email signature. Each goes to its
   tool. Full keyboard support. Typed requests for social posts still go to
   the social media tool.

## 3. Conversation (scripted, no AI)

When the user picks a tile or sends text, the home page turns into a short
conversation in the same page (no full reload). Keep state in the URL where
useful (e.g. /?new=deck) so refresh and Back work.

a) Layout: top bar with the format name (e.g. "New deck", 14px 600) on the
   left and a "Start over" link on the right (goes back to the empty home).
   Messages column max 760px. User message: right aligned, #F2F4F6 bubble,
   radius 14, with the format's coloured icon. Dot message: 28px orb on the
   left, text 15px/1.55.
   Sticky reply bar at the bottom: white, border #E3E8EE, radius 20.
   Top line "Brief" (12px #5C6B7A) followed by chips for what is chosen so far
   (Format, Template, Audience). Filled chip: #F2F4F6 bg with a 16px colour
   square. Empty chip: dashed #C9D2DB, muted text. Below it the input
   "Reply to Dot, or pick one above" + send button.

b) Deck step: user bubble "Create a deck". Dot: "Nice, a deck. Want to start
   from one of ours, or from scratch?" Then a template bento: grid 4 equal
   columns, rows 136px 136px, gap 12px, radius 18:
   - Col 1, rows 1-2: "From scratch", white, 1px dashed #C9D2DB, 36px grey
     circle with +, sub "Start blank. Dot asks a few questions and builds it."
   - Cols 2-3, rows 1-2: "Master deck", #F3F8FB, border #E3E8EE, the same
     three-slide art larger (120x84), "Recommended" pill, title 20px,
     sub "All 18 offerings. Dot tailors it to the audience you pick."
   - Col 4, row 1: "Partnership deck", navy #1A2A3C, white text,
     sub "For funders and partners" (#DAF1FF), three small blue blocks top right.
   - Col 4, row 2: "Government briefing", #DAF1FF, sub "Short, for ministries"
     (#0F4772), two short bars top right.
   Under it: "Or tell me who it's for and what it should cover, and I'll build
   it from what we know." (13px #5C6B7A)

c) After a template is picked: fill the Template chip, then Dot asks
   "Who is it for?" and shows audience group chips from the knowledge data
   (data/knowledge), plus "Skip". Picking one fills the Audience chip.

d) Other formats: tools that exist (social post, map, engagement map,
   background, email signature) go straight to the tool page, passing the brief
   the same way the current code does.

e) Tools marked "Soon" (deck builder, two-pager): after the brief is complete,
   Dot says "The [deck builder] is coming soon. I've saved your brief in
   Recent so you can pick it up later." and adds it to Recent. Be honest;
   never pretend something was generated.

f) Typed text: lowercase it and match keywords to formats:
   deck/slides/presentation -> Deck; social/post/instagram/linkedin -> Social post;
   two-pager/2-pager/one-pager/brief -> Two-pager; map (but not engagement) ->
   Map; engagement -> Engagement map; background/zoom/teams -> Virtual
   background; signature/email signature -> Email signature.
   If "master" also appears with Deck, pre-pick Master deck.
   If nothing matches, Dot replies: "I couldn't match that yet. Pick one of
   these to start:" and shows the four format tiles small (no AI step yet;
   asset search comes in the next step). Put the matcher in lib/dot/intent.ts
   with unit-testable functions so the next step can add asset search there.

## 4. Search (⌘K)

If a search/command palette already exists, restyle it to match. Otherwise
add one with shadcn Command: searches all side panel pages and formats by
title. Keep the search logic in one module (lib/search/) so the next step can
add assets to the same index.

## 5. Small fixes

- /media/photo-awards: the side panel should highlight "Photo awards",
  not "Image galleries".
- Video guidelines page: the button labelled "Digital Inclusion Brand
  Guidelines" is wrong on a Giga page. Check where it links; label it to match
  the target (e.g. "Giga brand guidelines") and say in the PR what you did.
- Delete public/ images that only the removed marketing home used
  (check nothing else references them).
- DESIGN.md: replace the old Giga colour names/values with the DI tokens above
  and link to docs/design/dot-home.md.

## Dot orb animation

Only the 40px orb in the home heading moves. The side panel orb, the New chat
row and Dot's messages stay static. CSS only (components/dot/dot-orb.module.css),
no animation library, and only transform and opacity animate (never
box-shadow or background), so it stays smooth.

- Look: the same radial gradient as the static orb
  (circle at 32% 28%, #FFFFFF 0%, #D9FFF0 18%, #6EF2C4 46%, #22B99A 68%,
  #0B6E5C 100%) and the outer drop shadow 0 6px 18px rgba(34,185,154,.35).
  The fixed inset shadow (inset 0 -3px 8px …) is not used on the animated orb:
  it would read as a second, fixed light.
- One light source, and it moves: the whole gradient (its white highlight and
  its dark edge) is on an inner layer, a circle the size of the orb, clipped by
  the orb (overflow hidden, radius 999px). That layer sways with transform:
  rotate(-40deg) ↔ rotate(40deg), 6s, ease-in-out, infinite, alternate, so the
  highlight and the shaded side move together and the light always comes from
  above. There is no separate highlight layer.
- Breathing: the orb scales 1 → 1.04 → 1 from its centre, 4s, ease-in-out,
  infinite.
- Glow: a pseudo-element behind the orb, a #22B99A circle with 12px blur. Its
  opacity goes 0.35 → 0.6 → 0.35, 4s, in step with the breathing. It is not a
  light on the orb's surface.
- Reduced motion (prefers-reduced-motion: reduce): no animation; the inner
  layer stays at rotate(0), the original static look, with the drop shadow
  and no glow.
- The orb is decorative (aria-hidden). Its box keeps its size, so the scaling
  never moves the heading text.

## External tools

Added after the first build of this spec.

- Decks and two-pagers are made in the deck builder, which lives outside the
  portal. Decks open https://un-deck-builder.vercel.app/ and two-pagers open
  its two-pager builder, https://un-deck-builder.vercel.app/two-pager. The URLs
  live in one place, `lib/external-tools.ts` (`EXTERNAL_TOOLS.deck`,
  `EXTERNAL_TOOLS.twoPager`), and everything else reads from there.
- Every deck and two-pager entry point opens the builder in a new tab
  (`target="_blank"`, `rel="noopener noreferrer"`), with a 14px external-link
  icon (lucide ArrowUpRight) and an accessible name such as "Create a deck
  (opens the deck builder in a new tab)" or "Write a two-pager (opens the
  two-pager builder in a new tab)". The entry points are the home bento
  tiles, the side panel Create rows (no "Soon" tags), the ⌘K format rows, and
  the small tiles in Dot's "couldn't match" reply.
- On the bento tiles the icon stays on the line of the title's last word
  (`<ExternalTitle>`, no break between them), so "Write a two-pager ↗" never
  puts the icon alone on a new line.
- Typed requests for a deck or a two-pager don't open a tab. Dot replies
  "Decks are made in the deck builder." with a primary "Open deck builder"
  button, or "Two-pagers are made in the deck builder." with a primary "Open
  two-pager builder" button (to the two-pager link). These replies are not
  added to Recent. The side panel drops old "Soon" deck and two-pager briefs
  from Recent on load.
- The in-portal deck flow (template bento, audience step, "coming soon" reply)
  is kept but switched off with `inPortalDeckFlow = false`. While it is off,
  `/?new=deck` and `/?new=two-pager` show the same reply and button.
- The DI Master deck is "Coming soon" (`masterDeckAvailable = false`).
  - Its home tile keeps its look, with a "Coming soon" pill (white, `#5C6B7A`
    text, 1px `#E3E8EE` border; dark: `#22364C`, `#DAF1FF` text) instead of
    "Recommended".
  - The tile is a plain block: no link, no hover, not focusable, and read as
    "DI Master deck, coming soon".
  - A typed "master deck" gets: "The DI Master deck is coming soon. In the
    meantime, you can start a deck in the deck builder.", with the same button.

## Theme

Added in October 2026. Light, dark or system.

- next-themes (`components/theme-provider.tsx`, in `app/layout.tsx`), class
  strategy on `<html>`, default "system", saved per browser (localStorage
  `theme`). Its inline script sets the class before the page paints, so there
  is no flash of the wrong theme; `<html>` has `suppressHydrationWarning`.
- Every colour is a CSS variable in `app/globals.css` (`:root` for light,
  `.dark` for dark): the shadcn tokens plus the DI tokens (`ink`, `link`,
  `line`, `subtle`, `selected`, `hover`, `field`, `chosen`, `pill`, `tile`,
  shadows), exposed through `tailwind.config.ts`. Components use the tokens,
  never hex values for surfaces, text, borders or buttons. Hex values stay
  only in decorative art (`dot-art.tsx`), format colours and the tools'
  generated output.
- The main area is lighter than the side panel in both themes.
- Light: main area and its top bar #FFFFFF, side panel #F5F6F8 (right border
  #EBEEF2), surfaces #FFFFFF. Cards, tiles and tool panels on the page are
  #FFFFFF with a 1px #E3E8EE border.
- Dark:

  | Token | Value |
  | --- | --- |
  | Main area | `#142130` |
  | Side panel | `#0F1823`, right border `#22364C` |
  | Surfaces (Dot's box, cards, menus, ⌘K, dialogs) | `#1A2A3C` |
  | Hover / selected row | `#22364C` (side panel hover `#1A2A3C`) |
  | Borders / dashed borders | `#2A3E55` / `#3A5068` |
  | Text main / secondary / muted | `#F8F8F8` / `#B8C4D0` / `#8A9AAB` |
  | Side panel group titles | closed `#DAE2EA` (hover `#F8F8F8`), open `#8A9AAB` (hover `#DAE2EA`) |
  | Toggle icons | `#8A9AAB` |
  | Primary buttons | `#49BCF6`, text `#0F1823`, hover `#82D3FF` (8.4:1) |
  | Links | `#82D3FF` (hover `#B5E4FF`) |
  | Focus ring | 2px `#82D3FF` |
  | Chosen option (format, colour variant…) | `#22364C`, border `#49BCF6`, text `#82D3FF` |
  | Pills | `#22364C` with `#DAF1FF` (Coming soon), `#82D3FF` (Recommended, DI) |
  | Destructive | `#F5666D`, text `#0F1823` |

- Bento tiles in dark: Create a deck and Get a logo `#1A2A3C` with border
  `#2A3E55`; Make a map `rgba(0,174,239,.14)`; Write a two-pager
  `rgba(126,140,255,.16)`; Master deck `rgba(0,174,239,.10)` with border
  `rgba(0,174,239,.25)`; More dashed `#3A5068`.
- Unchanged in both themes: the Dot orb, the BrandTabs track (`#01689D`,
  white text and selected segment), the deck template previews, and asset
  previews (white artwork on navy, dark artwork on light; Logos,
  Illustrations and Email signature previews stay white) because they show
  the real file. Tools with their own canvases (maps, social post, email
  signature, backgrounds, engagement map) theme the controls around them; the
  generated output never changes.
- Theme toggle (`components/app-shell/theme-toggle.tsx`), on the right of the
  side panel footer: a segmented control of three round buttons, System
  (lucide Monitor), Light (Sun), Dark (Moon).
  - Track: 32px high, radius 999px, padding 3px, #E9EDF1 (dark #22364C).
  - Buttons: 26px circles, 16px icons. Unselected icon #6B7785 (dark #8A9AAB).
    Selected: #FFFFFF circle, shadow 0 1px 3px rgba(26,42,60,.18), icon
    #1A2A3C (dark: #2A3E55 circle, icon #F8F8F8).
  - `role="radiogroup"` ("Theme"), each button `role="radio"` named "System
    theme", "Light theme", "Dark theme". Arrow keys move the choice and focus
    (wrapping); only the selected button is in the tab order; visible focus
    ring.
  - Hidden with the footer when the side panel is collapsed to icons; the
    mobile sheet has the same footer.

## Checks

- npm run build passes; lint adds no new errors.
- Click through in dev at 1440px, 1024px, 768px and 390px wide: home, every
  bento tile, the + menu, the deck step to the end, a typed request for each
  format, a typed request that matches nothing, Start over, Back button,
  ⌘K, every side panel link, Recent after a "Soon" brief.
- Keyboard only: tab through the home page, open/close the + menu, send a
  message.
- Add screenshots of the home and the deck step (1440px) to the PR description.
  Do not commit screenshots to the repo.

## Do not

- touch mdelprete91-cpu/brand-asset
- change Vercel settings
- add AI or any external API
- change the tools themselves (maps, social media, etc.), only how you reach them
