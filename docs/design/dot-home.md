# Dot home: Direction C

Approved design for the home page and side panel of the DI design portal.

Goal: rebuild the home page and the side panel to the approved design
"Direction C". The portal has one entry point: Dot's box (Dot is the portal's
assistant, shown as a green orb). Format tiles sit under the box, templates appear
only after a format is picked, and recent work lives in the side panel.
There is NO AI in this step: Dot's replies are scripted and typed text is
matched with simple keywords.

## Design tokens

Use the existing Tailwind/CSS variables where they exist.

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

- Width 264px, background #FAFAFA, right border 1px #EBEEF2,
  padding 20px 12px, gap 18px between blocks. Keep the existing shadcn Sidebar
  behaviour (collapse, mobile off-canvas, cookie for state).
- Top: the real DI logo (/logos/unicef-digital-inclusion-blue.svg) on the left,
  "Beta" badge on the right (11px, 600, navy text on #F7761F, pill, 2px 8px).
- Search button: full width, 34px high, radius 8, background #F3F5F7,
  border 1px #E6EAEE, text #5C6B7A 14px, search icon 16px, label "Search",
  "⌘K" key hint on the right (11px, white bg, border #E3E8EE, radius 6).
  Opens the search/command palette (see section 4). ⌘K / Ctrl+K also opens it.
- "New chat" row: 16px Dot orb + "New chat". Goes to / and clears any
  conversation state.
- Groups (rows 34px, 14px, #3B4A5A, 16px lucide icons, radius 8, gap 10px;
  chevron right when closed, down when open; children rows 30px, 13px,
  left padding 36px):
  - Create (open by default): Deck, Social post, Two-pager, Map,
    Engagement map, Virtual background, Email signature.
    Deck and Two-pager keep a small "Soon" tag if those tools are not built.
    Each goes to its existing tool page (Deck goes to the deck step, section 3).
  - Knowledge (closed by default): Audiences, Facilities, Systems, Offerings,
    plus the existing "Soon" items.
  - Assets (open by default): Logos, Illustrations, Image galleries, Photo awards.
  - Brand (closed by default): Colors, Typography, Brand guidelines,
    Video guidelines.
  - AI skills (single row, no children).
- Recent (open by default, only shown if not empty): last 3 items started from
  Dot (format + template/audience if any, e.g. "Deck · Master deck"),
  stored in localStorage (wrap every read/write in try/catch). No "See all" yet.
- Selected state (for New chat on the home page, and for the current page):
  background #EEF1F4, text #1A2A3C, weight 600. Same style everywhere so the
  hierarchy stays even.

## 2. Home page (/)

Main area: content centred vertically and horizontally, max width 760px,
padding 40px 32px 120px.

a) Heading row (centred, gap 14px, margin-bottom 24px):
   40px Dot orb + h1 "Hi there, what do you need today?"
   (Manrope 600, 28px, letter-spacing -0.02em, line-height 1.2).
   There is no login yet; when a user name exists later, it replaces "there".

b) Dot's box: white, border 1px #E3E8EE, radius 22px,
   shadow 0 10px 32px rgba(26,42,60,.07).
   - Textarea, 2 rows, auto-grow to ~6 rows, no border, padding 20px 22px 4px,
     Open Sans 15px/1.5, placeholder "Describe what you want to make or find".
     Visually hidden label "Ask Dot".
   - Bottom row, right aligned: "Use DI knowledge" switch (on by default,
     track #01689D when on, 13px label #3B4A5A) and a 36px round send button
     (#01689D, white up-arrow icon, aria-label "Send to Dot").
   - Enter sends, Shift+Enter adds a line. Send is disabled when empty.
   - "Use DI knowledge" is stored in the brief (lib/brief.ts, add
     useKnowledge: boolean). Tools that already read knowledge data may use it;
     otherwise it is only stored for now.

c) Bento under the box: margin-top 16px, CSS grid,
   columns 2fr 1fr 1fr 0.55fr, rows 96px 112px, gap 10px, tiles radius 16px.
   - Row 1, col 1, "Create a deck" + sub "From a template or from scratch".
     Background #F3F8FB, border 1px #E3E8EE. Art on the right: three
     overlapping rounded "slide" cards (64x44, radius 8): back one
     linear-gradient(160deg,#82D3FF,#01689D) rotated -9deg; middle and front ones
     frosted glass (white gradient over rgba of 500/300, white 1px border)
     rotated -3deg and 5deg. Title Manrope 600 15px, sub 12px #3B4A5A.
     Opens the deck step (section 3).
   - Row 1, col 2, "Make a social post": background #FDEEF2, small art top right
     (34x40 #EC6A8C card with two white lines). Goes to the social media tool.
   - Row 1, col 3, "Write a two-pager": background #EEF0FF, art top right
     (32x42 white page, border #C9CEFF, lines #7E8CFF/#C9CEFF). Goes to the
     two-pager tool, or if it is "Soon", Dot replies (see section 3e).
   - Col 4, rows 1-2, "More": white, 1px dashed #C9D2DB, centred 30px grey
     circle (#F2F4F6) with a + icon, label "More" 12px #3B4A5A.
     Opens the + menu (2d).
   - Row 2, cols 1-3, "DI Master deck": background #EEF9FF, border 1px #DAF1FF.
     Left: "Recommended" pill (11px 600, #01689D text, white bg, border #DAF1FF),
     title "DI Master deck" (Manrope 600 17px), sub "All 18 offerings. Dot
     tailors it to your audience." (12px #3B4A5A).
     Right: a small grid of mini slides (columns 76px 52px 52px, rows 38px 38px,
     gap 6px): a tall blue cover (gradient 500 to 700, two white lines) spanning
     both rows, then four white mini slides with 1px #DAF1FF border showing a
     palette strip, two text lines, a 3-bar chart, and a 2x2 card grid in DI blues.
     Opens the deck step with "Master deck" already picked.
   - Responsive: under 720px wide, 2 columns (Deck and Master deck full width,
     More becomes a normal full-width tile). Under 420px, 1 column.

d) + menu (shadcn DropdownMenu or Popover, anchored to the More tile, 260px
   wide, radius 14, shadow 0 16px 40px rgba(26,42,60,.16), padding 6px):
   heading "More formats" (12px #5C6B7A), then items with 22px coloured icon
   squares: Make a map, Make an engagement map, Make a virtual background,
   Make an email signature. Each goes to its tool. Full keyboard support.

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
