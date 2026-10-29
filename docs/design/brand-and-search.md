# Brand tabs and search

How the portal tells Digital Inclusion (DI) and Giga material apart, how assets
are indexed, and how keyword search works in Dot's box and ⌘K. There is no AI
and no external API: everything is fixed rules over a JSON index. Builds on
[Dot home: Direction C](dot-home.md).

## 1. Brand rules

- Material has one of three brand values: `di`, `giga`, or `both` (shared by
  DI and Giga, e.g. the fonts).
- DI is the default brand. A page with only DI material gets no brand marker.
- A page with separate DI material and Giga material gets **brand tabs** in its title
  row. "Digital Inclusion" is always the first tab and the default.
- A page with **only Giga** material gets a **Giga pill** next to its title.
- A page whose material is **shared** by both brands, and so has no tabs, gets
  a **"DI + Giga" pill** next to its title (Typography).
- On pages with brand tabs, material tagged `both` shows under both tabs. In
  the registries the pages use, that means `brand: 'both'` on the entry (Logos:
  `lib/brand-registry.ts`; Image galleries: `components/media-section.tsx`).
  Nothing on those pages is tagged `both` yet.
- A tool that only has one brand's templates today is single-brand. The other
  brand is not invented.

Current pages (audit, October 2026):

| Page | Brand | Marker |
| --- | --- | --- |
| Colors | DI and Giga, separate | brand tabs |
| Logos | DI and Giga, separate | brand tabs |
| Image galleries | DI and Giga, separate | brand tabs (Giga: Flickr, YouTube; DI: UNICEF WeShare and the DI SharePoint libraries) |
| Illustrations | Giga | Giga pill |
| Photo awards | Giga | Giga pill |
| Video guidelines | Giga | Giga pill |
| Typography | shared fonts (Manrope, Open Sans) | "DI + Giga" pill |
| Social media, Email signature, Engagement map | DI templates that also carry the Giga logo | none |
| Backgrounds, Maps, Brand guidelines, Knowledge, AI skills | DI (Maps and Backgrounds use Giga Maps data) | none |

## 2. Tokens

**Brand tabs** (`<BrandTabs />`, `components/brand/brand-tabs.tsx`), a segmented control:

| Part | Value |
| --- | --- |
| Track | `#01689D` (DI 700), radius 999px, padding 3px, height 36px |
| Segment | Open Sans 600, 14px, padding 0 16px, radius 999px |
| Selected | background `#FFFFFF`, text `#01689D`, shadow `0 1px 2px rgba(26,42,60,.15)` |
| Unselected | transparent, text `#FFFFFF`, hover `rgba(255,255,255,.14)` |
| Focus | 2px `#1A2A3C` outline, offset 2px |
| Labels | "Digital Inclusion", "Giga" |

Contrast: white on `#01689D` and `#01689D` on white are both 6.05:1.

**Brand pills** (`<BrandPill />`): 12px, 600, radius 999px, padding 2px 10px.
The same size and shape for every brand.

| Brand | Label | Background | Text | Where |
| --- | --- | --- | --- | --- |
| giga | Giga | `#EEF1F4` | `#1A2A3C` | Giga-only page titles, result cards, ⌘K |
| both | DI + Giga | `#F2F4F6` | `#3B4A5A` | shared page titles (Typography), result cards, ⌘K |
| di | Digital Inclusion | `#EEF9FF` | `#01689D` | result cards and ⌘K only (DI pages get no pill) |

**Result previews**: 4:3, radius 12px, contain-fit with padding. White artwork
sits on `#1A2A3C`, everything else on `#F8F8F8`.

## 3. Brand tabs behaviour

- Placement: in `PageHeader`'s `actions` slot. The title is on the left and the
  tabs on the right, centred with the title. Under a 640px content width (a
  container query on the header), the tabs move below the title at full width,
  in two equal segments.
- Built on Radix Tabs: arrow keys move between tabs, with tab and tabpanel roles.
- The choice lives in the URL, `?brand=di|giga` (default `di`), so links and
  Back work. The old Colors link `?palette=giga` opens the Giga tab.
- Page code: wrap the page in `<BrandTabsRoot>`, put `<BrandTabs />` in the
  header, and add one `<BrandTabsContent brand="di|giga">` per brand.
- Logos: each entry in `lib/brand-registry.ts` has a `brand`; the generator
  lists one tab's logos. UNICEF Digital Inclusion comes first on the DI tab.

## 4. Asset index

`data/assets.json` is built by `scripts/build-asset-index.mjs`. It runs in
`prebuild`, so it is rebuilt before every build.

```ts
{
  id, title,            // "Digital Inclusion logo, black, horizontal"
  type,                 // logo | illustration | photo | icon | background | template | font | palette | guideline
  brand,                // di | giga | both (shared by DI and Giga)
  colour,               // full-colour | black | white | blue | navy | null
  layout,               // horizontal | vertical | stacked | square | null
  formats: [{ ext, url }],
  preview,              // image to show (null for fonts)
  page,                 // portal page, with ?brand= where the page has tabs
  tags: []              // product, event and story names, keywords
}
```

- **Sources** are the same registries the pages use: `lib/brand-registry.ts`
  (Logos), `lib/illustration-registry.ts`, `lib/photo-awards.ts`,
  `lib/color-tokens.ts`, plus the files in `public/backgrounds`,
  `public/images/video-guidelines` and `public/fonts`. The script imports the
  `.ts` registries directly, using Node 22's type stripping.
- **One file is one asset**, with one entry in `formats` per file type. The
  Logos page builds colour variants and PNG exports in the browser. The script
  writes the same variants once to `public/generated/logos/`, as recoloured
  SVGs (`scripts/lib/svg-recolor.mjs`, a port of `lib/svg-processing.ts`) and
  PNGs (2x, 1000–2400px wide, via sharp). It also writes 640px JPEG previews
  and palette swatch sheets. Generated files are committed. They are rebuilt
  only when their source changes (`data/assets.generated.json` holds the
  source hashes). Without sharp, the existing files are kept.
- **Existing files are never moved or renamed.**
- **Inference** from folder and file names:
  - brand: `digital-inclusion` means di; a name starting `giga` means giga.
    Otherwise the folder decides: illustrations, photo-awards and
    video-guidelines are Giga, backgrounds are DI.
  - type: the folder.
  - colour: `black` / `white` / `blue` / `navy` in the name. `dark` means
    black and `light` means white. bicolour or fill means full-colour.
  - layout: `horizontal` / `vertical` / `stacked` / `square` in the name, else
    the image's proportions (≥ 1.6 horizontal, ≤ 0.85 vertical, else square).
- **Overrides**: `data/assets.overrides.json` (`{ "<id>": { "brand": "di" } }`)
  is hand-edited and merged on top. The script lists every asset whose brand,
  type or colour it could not infer. `both` is only ever set here; names never
  imply it.

  | Assets | Brand | Status |
  | --- | --- | --- |
  | UNICEF logo (blue, black, white) | di | **confirmed** by the portal owner |
  | UNICEF Digital Impact Division logos (boxed, unboxed) | di | **confirmed** by the portal owner |
  | GEP and Connectivity Forum event logos | giga | **confirmed** by the portal owner |
  | Manrope and Open Sans fonts | both | **confirmed** by the portal owner |

  The boxed Digital Impact Division file named `-black` is the full-colour
  lockup, so its colour is also overridden (`full-colour`).

## 5. Keyword matching (`lib/search/`)

1. **Normalise**: lowercase, strip punctuation, split into words.
2. **Synonyms** (`lib/search/synonyms.ts`) map words to facets. Multi-word
   phrases are matched before single words ("unicef blue" is a colour,
   "unicef di" a brand). The first value found for a facet wins.

   | Facet | Value | Words |
   | --- | --- | --- |
   | brand | di | di, digital inclusion, unicef di, unicef digital inclusion |
   | brand | giga | giga |
   | colour | black | black, dark, mono, monochrome |
   | colour | white | white, reversed, negative, knockout, light |
   | colour | blue | blue, cyan, unicef blue |
   | colour | full-colour | colour, color, full colour, full color, coloured |
   | type | logo | logo, logos, logotype, wordmark, lockup, mark |
   | type | illustration | illustration, illustrations, drawing, artwork |
   | type | photo | photo, photos, picture, image, images, photograph |
   | type | icon | icon, icons, pictogram |
   | type | background | background, backgrounds, wallpaper |
   | type | font | font, fonts, typeface, typography |
   | type | palette | palette, colours, colors, hex |
   | layout | horizontal | horizontal, landscape, wide |
   | layout | vertical | vertical, portrait, stacked |
   | format | svg / png / pdf / jpg | svg, png, pdf, jpg, jpeg; vector = svg or pdf |

3. **Filler words** are dropped: i, want, need, the, a, an, of, in, for, me,
   please, can, you, give, show, find, get, download, some, our, with, to, my.
4. **Filter**: a named type returns only that type. A named brand returns that
   brand plus shared material: "di" returns `di` + `both`, "giga" returns
   `giga` + `both`. No brand named returns every brand.
5. **Score**: colour +3, layout +2, format +1, and +1 for each other word found
   in the title or tags (a plural "s" is ignored). With no brand or type, only
   assets that score are returned.
6. **Sort**: by score, then brand, then the order the asset pages list them in
   (the index order), then title. Brand order with no brand named: DI, then
   both, then Giga. With a brand named: that brand, then both. Page order
   puts the DI logo first and the main Giga logo before product and event
   logos.
7. **Returns** `{ facets, results }`. For example "I want the logo of Digital
   Inclusion in black" returns `{ type: 'logo', brand: 'di', colour: 'black' }`.

Unit tests: `lib/search/match.test.mjs` runs on the real index (`npm test`).

## 6. Dot's box: create or find (`lib/dot/intent.ts`)

Rules, in this order:

1. A create verb (make, create, write, build, design, generate) with a format
   word starts the create flow.
2. A format word with no asset type word starts the create flow.
3. An asset type word, or a find verb (find, get, download, need the, where
   is), starts an asset search.
4. "background" is both a format and an asset type. With a create verb it
   opens the virtual background tool. Otherwise it searches, and Dot's reply
   adds a button: "Or make a virtual background".
5. Nothing matched gives the existing "I couldn't match that yet" reply.

The search reply lives at `/?find=<query>&without=<facets>`.

- The user bubble shows the query. Dot says: "Here's what I found for “<query>”."
- Under that, the understood facets show as removable chips. Removing one adds
  it to `without` and re-runs the search.
- Up to 6 result cards follow: 3 columns wide, 2 medium, 1 on a phone. Each
  card has one real download link per format (`download` attribute) and "Open
  page".
- With more than 6 results, "See all N results" opens ⌘K with the query.
- With no results, Dot says: "I couldn't find that. Try 'DI logo' or browse
  Assets.", with links to the Assets pages.
- Searches are not added to Recent. Brief chips belong to the create flow only.

## 7. ⌘K

- It uses the same index and matcher. Groups appear in this order: Assets
  (when the query has asset words, meaning any facet), Formats, Pages. An
  empty query shows Formats and Pages.
- Asset rows have a 32px thumbnail, title and brand pill. Enter opens the
  asset's page. ⌘Enter (Ctrl+Enter), or the row's download button, downloads
  the first format.
