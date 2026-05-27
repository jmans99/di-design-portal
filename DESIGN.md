---
name: Giga Brand Asset Generator
description: The on-brand home for every Giga asset, bright-utility design language led by Giga Blue and real-world classroom imagery.
colors:
  giga-blue: "#277AFF"
  giga-blue-deep: "#0050E6"
  giga-blue-800: "#002D9C"
  giga-blue-100: "#D4E5FF"
  giga-blue-tint: "#EAF2FF"
  ink: "#0A1B3F"
  muted-ink: "#5C7187"
  hairline: "#DDE6F0"
  canvas: "#F7F9FC"
  surface: "#FFFFFF"
  scrim: "#0A0A0C"
  status-green: "#00D661"
  status-amber: "#FFC93D"
  status-red: "#ED1C24"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 4.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.18em"
rounded:
  sm: "5px"
  md: "8px"
  chip: "16px"
  card: "24px"
  block: "28px"
  pill: "9999px"
spacing:
  gap: "1rem"
  tile: "1.25rem"
  gutter: "1.5rem"
  section: "6rem"
  container: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.giga-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 1.75rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.giga-blue-deep}"
    textColor: "{colors.surface}"
  button-on-accent:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.giga-blue-deep}"
    rounded: "{rounded.pill}"
    padding: "0 1.75rem"
    height: "3rem"
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.tile}"
  icon-chip:
    backgroundColor: "{colors.giga-blue-tint}"
    textColor: "{colors.giga-blue}"
    rounded: "{rounded.chip}"
    size: "2.75rem"
  eyebrow:
    textColor: "{colors.giga-blue}"
    typography: "{typography.label}"
---

# Design System: Giga Brand Asset Generator

## 1. Overview

**Creative North Star: "The Bright Utility"**

This is the brand site that *is* the brand. It enforces the Giga design system by embodying it, so every surface must look like it was made to the standard it asks others to meet. The personality is institutional precision warmed by mission: a calm, generous, white-space-led baseline (UNICEF/ITU-grade trust) that comes alive with two things only, **Giga Blue** and **real photography of connected classrooms**. The blue is the voice; the photography is the reason. Everything else stays quiet.

Density is low and deliberate. Sections breathe at a `6rem` vertical rhythm inside a centered `72rem` column, with full-bleed media (the video hero, the closing CTA) breaking the column for emphasis. Layout alternates a centered section intro with left-aligned, asymmetric content so the page never reads as a single monotonous stack. Motion is choreographed but restrained: one orchestrated entrance per view, scroll-reveal fade-ups, and small character-rich hover micro-animations, never decoration for its own sake.

What this system explicitly rejects: clutter and "too much". No decorative illustration spam, no rainbow of accent colors, no black slabs, no gradient-text or glassmorphism-by-default, no SaaS hype. When in doubt, remove. Balance, elegance, and cleanliness win over cleverness every time.

**Key Characteristics:**
- One voice color (Giga Blue) over a tinted near-white canvas, no second accent.
- Real classroom/connectivity photography carries warmth; it is used sparingly, never as wallpaper.
- Manrope headlines, tight tracking; Open Sans body; generous whitespace.
- Soft Stripe-grade shadows on flat surfaces; depth is a response to state, not a default.
- Choreographed-but-quiet motion; everything honors `prefers-reduced-motion`.

## 2. Colors

A monochrome-blue system: a single saturated Giga Blue carries identity over a cool, tinted near-white field, with real photography (not color) providing the warmth.

### Primary
- **Giga Blue** (`#277AFF`): the brand. The only colored background and the only accent. Primary buttons, links, eyebrows, icon glyphs, the palette tile, and media scrims all resolve to it. Hover deepens to **Giga Blue Deep** (`#0050E6`); the darkest tints (`#002D9C`) anchor photo gradients and bold fields.
- **Giga Blue Tint** (`#EAF2FF`) and **Giga Blue 100** (`#D4E5FF`): the wash used for icon chips and quiet "featured" surfaces. This is how a tile signals importance without shouting.

### Neutral
- **Ink** (`#0A1B3F`, canonical `hsl(222 78% 14%)`): all primary text and headings. A deep navy, never pure black.
- **Muted Ink** (`#5C7187`): secondary copy, descriptions, tile subtitles.
- **Canvas** (`#F7F9FC`, canonical `hsl(210 40% 98.3%)`): the page background. A blue-tinted near-white, never pure white.
- **Surface** (`#FFFFFF`): cards, tiles, the solid header band.
- **Hairline** (`#DDE6F0`): borders and dividers. 1px only.
- **Scrim** (`#0A0A0C`): the *neutral* dark overlay laid over the hero video and the CTA photo for legibility. It carries no hue, this is intentional.

### Tertiary (status only)
- **Connectivity Green / Amber / Red** (`#00D661` / `#FFC93D` / `#ED1C24`): reserved exclusively for connectivity status and data viz (maps). Never decorative, never a background.

### Named Rules
**The One Voice Rule.** Giga Blue is the only color that may fill a background. There is no secondary accent. Variety comes from blue *tints* (`#EAF2FF` to `#0050E6`) and from photography, not from new hues.

**The No-Black Rule.** Solid black or Grey-950 backgrounds are forbidden everywhere except Giga Maps. Dark areas are either a real photograph or the neutral `#0A0A0C` scrim *over* a photograph, never a flat black panel.

**The No-Yellow Rule.** Reference layouts may use a yellow/lime accent; we do not. CTAs and accents are Giga Blue.

## 3. Typography

**Display & Headings Font:** Manrope (with `sans-serif` fallback)
**Body Font:** Open Sans (with `sans-serif` fallback)

**Character:** Manrope gives confident, slightly geometric headlines with tight negative tracking; Open Sans keeps body copy plain, legible, and institutional. One family for voice, one for reading, no third typeface.

### Hierarchy
- **Display** (Manrope 600, `clamp(2.6rem, 6.4vw, 4.75rem)`, line-height 1.02, tracking `-0.04em`): hero headline only. White over media.
- **Headline** (Manrope 600, `clamp(1.9rem, 3.4vw, 2.6rem)`, line-height 1.1, tracking `-0.03em`): section titles. Often `text-balance`.
- **Title** (Manrope 600, 1.125rem): tile and card titles, the "Aa" specimen.
- **Body** (Open Sans 400, 0.9375rem/15px, line-height ~1.6): paragraphs and descriptions. Cap measure at ~65ch (`max-w-sm`/`max-w-2xl`).
- **Label / Eyebrow** (Manrope 700, 0.625rem/10px, uppercase, tracking `0.18em`, Giga Blue): the section eyebrow above every headline ("WHY IT EXISTS", "THE SYSTEM").

### Named Rules
**The Eyebrow Rule.** Every section opens with a Giga-Blue uppercase 10px eyebrow, then the headline, then one line of muted body. This three-beat intro is the section signature; reuse it on every page.

**The Tight-Headline Rule.** Headlines always carry negative letter-spacing (`-0.03em` to `-0.04em`) and weight 600. Never set a headline at default tracking or below 500.

## 4. Elevation

Flat surfaces, soft "Stripe-grade" shadows, no hard drop shadows. Depth is conveyed through layered low-opacity shadows and, on hover, a small lift. The system is light and airy; shadows whisper.

### Shadow Vocabulary
- **shadow-stripe** (`0 1px 2px rgba(50,50,93,.06), 0 2px 5px rgba(50,50,93,.08), 0 1px 1.5px rgba(0,0,0,.05)`): resting state of cards, tiles, and the solid header band.
- **shadow-stripe-md** (`0 4px 6px rgba(50,50,93,.07), 0 1px 3px rgba(0,0,0,.06), 0 8px 20px rgba(50,50,93,.05)`): primary buttons and raised media frames.
- **shadow-stripe-lg** (`0 13px 27px rgba(50,50,93,.1), 0 8px 16px rgba(0,0,0,.07)`): the largest photo blocks.

### Named Rules
**The Lift-On-Hover Rule.** Cards rest flat with `shadow-stripe`. On hover they rise via `.hover-lift` (translateY ~2px + a hair of rotation, snappy 180ms in / graceful 350ms out) and deepen to `shadow-stripe-md`. Elevation is a *response to state*, never a default.

## 5. Components

### Buttons
- **Shape:** fully pill (`9999px`), height `3rem` (h-12), horizontal padding `1.75rem`.
- **Primary:** Giga Blue (`#277AFF`) fill, white text, `shadow-stripe-md`. Hover deepens to `#0050E6`; `:active` scales to `0.98`. A trailing arrow icon nudges `+2px` on hover.
- **On-accent (over a blue or photo block):** inverted, white fill with Giga Blue Deep (`#0050E6`) text; hover to `#EAF2FF`.
- **Ghost over media (hero):** transparent `white/10` fill, `white/30` border, `backdrop-blur`, white text; hover to `white/20`. Used only over the dark scrim.

### Cards / Tiles (the bento)
- **Corner Style:** `24px` (`rounded-3xl`); the largest full-bleed blocks use `28px`.
- **Background:** white surface by default. The calm baseline.
- **Shadow Strategy:** `shadow-stripe` at rest, `.hover-lift` to `shadow-stripe-md` (see Elevation).
- **Border:** 1px hairline (`#DDE6F0`).
- **Internal Padding:** `1.25rem` (`p-5`). Media/colour tiles drop padding to `0` and lay the label over a bottom gradient.
- **Accent tiles:** at most a few per grid. The palette tile (full Giga-Blue tonal bands) and two photo tiles (Maps, Media) are the accents; everything else is a white tile with a Giga-Blue **icon chip**. Never let colored/photo tiles outnumber the calm ones.

### Icon Chip
- `2.75rem` (h-11 w-11) square, `16px` radius, Giga Blue Tint (`#EAF2FF`) background, Giga Blue (`#277AFF`) glyph (Lucide, 20px). The standard way to mark any utility tile.
- **Hover micro-animation:** on card hover the glyph plays a single transform-only animation (~0.5s) then settles, twist/wiggle/send/share/bounce per icon. Characterful, never looping, GPU-only, disabled under reduced-motion.

### Navigation (Header)
- **Style:** a full-width band (height `4.5rem`), content held in the `72rem` column. Not a floating pill.
- **Over the hero:** transparent, white logo (Giga + UNICEF + ITU lockup) and `white/85` nav links; an extra top gradient guarantees legibility over bright video frames.
- **Solid (scrolled / inner pages):** frosted white band (`surface/80` + `backdrop-blur`) with a 1px bottom hairline; navy links, color logo.
- **The Constant-Logo Rule.** The logo lockup and its width never change between states; only its color flips (white over hero, full-color when solid). No size jump on scroll.

### Inputs & Fields
- **Style:** white surface, 1px hairline border (`#DDE6F0`), `8px` radius (`md`), comfortable padding (~`0.625rem 0.875rem`), Open Sans body text in Ink, muted-ink placeholder.
- **Focus:** border shifts to Giga Blue (`#277AFF`) with a soft 3px Giga-Blue ring (`ring`/`#277AFF` at low alpha). No glow, no inset shadow.
- **Error / Disabled:** error uses Connectivity Red (`#ED1C24`) for border + helper text (never color alone, pair with an icon or message); disabled drops to `canvas` fill with muted-ink text.
- **Labels:** small, literal, sentence case in Ink above the field. On tool surfaces, clarity beats cleverness.

### Disclosure (accordion)
- **Use:** FAQ and the "Everything on brand, in seconds" feature list. A trigger row (title in Ink, a Plus/Chevron in Giga Blue that rotates on open) over a panel that expands.
- **Motion:** animate `grid-template-rows` from `0fr` to `1fr` (never `height`) at ~500ms `ease-out` expo. One item open at a time is the default.
- **Numbered variant:** the feature list prefixes each row with a tabular `01`–`04`, Giga Blue when active, muted otherwise.

### Hero (signature)
- Full-bleed (`100vw`) media (autoplay-muted-loop video, photo poster + reduced-motion fallback), pulled under the header by `-4.5rem`. A **neutral** `#0A0A0C` gradient scrim (no blue cast) plus a focused top gradient keep white type legible. Centered display headline, one line of body, primary + ghost buttons. Staggered entrance with `ease-out` expo.

### Section Intro (signature)
- Eyebrow (label) + headline + one muted body line. Centered for overview-style sections, left-aligned for content-led ones. This is the reusable header pattern for every page.

## 6. Do's and Don'ts

### Do:
- **Do** lead every section with the eyebrow + headline + one-line body pattern, eyebrow in Giga Blue uppercase 10px.
- **Do** keep Giga Blue (`#277AFF`) as the single voice; build variety from its tints (`#EAF2FF` to `#0050E6`) and from photography.
- **Do** keep surfaces flat with `shadow-stripe`; reserve lift and `shadow-stripe-md` for hover/state.
- **Do** use real, on-mission photography (connected classrooms, students, connectivity) for hero and a *few* feature tiles, with a neutral `#0A0A0C` scrim when text sits on top.
- **Do** set headlines in Manrope 600 with negative tracking; body in Open Sans at ~15px, measure capped near 65ch.
- **Do** keep motion choreographed but quiet, one orchestrated entrance, scroll fade-ups, single-shot hover micro-animations, all `prefers-reduced-motion` safe.
- **Do** prefer removing over adding. Balance, elegance, cleanliness.

### Don't:
- **Don't** use any background color other than Giga Blue. No second accent, no yellow/lime (that belongs to reference layouts, not Giga).
- **Don't** place a solid black or Grey-950 background anywhere outside Giga Maps. Dark = photo or neutral scrim over photo, never a flat black panel.
- **Don't** fill tiles with decorative illustration SVGs, and don't let photo/color tiles outnumber the calm white ones. The bento was explicitly de-cluttered; keep it that way.
- **Don't** use gradient text, decorative glassmorphism, or glowing/"magical AI" SaaS marketing styling.
- **Don't** use em dashes in copy. Use commas, colons, periods, or parentheses.
- **Don't** let the connectivity colors (green/amber/red) become decorative; they are status/data only.
- **Don't** change logo size between header states, and don't reintroduce a floating pill header.
