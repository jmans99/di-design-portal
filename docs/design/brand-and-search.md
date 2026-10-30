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
  row. Asset pages (Logos, Illustrations, Image galleries) get the **brand
  filter**: "All" (the default), "Digital Inclusion", "Giga". All shows
  everything; Digital Inclusion shows `di` + `both`; Giga shows `giga` +
  `both`. Colors keeps the two tabs ("Digital Inclusion" first and default),
  with no "All".
- A page with **only Giga** material gets a **Giga pill** next to its title.
- A page whose material is **shared** by both brands, and so has no tabs, gets
  a **"DI + Giga" pill** next to its title (Typography).
- On pages with brand tabs, material tagged `both` shows under both tabs. In
  the registries the pages use, that means `brand: 'both'` on the entry (Logos:
  `lib/brand-registry.ts`; Image galleries: `components/media-section.tsx`).
  On Logos, the Giga + UNICEF + ITU partnership logo is shared, so it is listed
  under both tabs, after each brand's own logos.
- A page's pill follows its own list: when every item on it is shared, a
  Giga-only page's pill becomes "DI + Giga" (Photo awards). A page with the
  brand filter has no pill: Illustrations dropped its Giga pill when it got
  the filter (its Digital Inclusion view is the shared General set).
- A tool that only has one brand's templates today is single-brand. The other
  brand is not invented.

Current pages (audit, October 2026):

| Page | Brand | Marker |
| --- | --- | --- |
| Colors | DI and Giga, separate | brand tabs |
| Logos | DI, Giga and shared | brand filter (All, DI, Giga) |
| Image galleries | DI and Giga, separate | brand filter (Giga: Flickr, YouTube; DI: UNICEF WeShare and the DI SharePoint libraries) |
| Illustrations | Giga (pillars, Giga Meter) and shared (the General set) | brand filter (no pill) |
| Photo awards | shared (all 48 Giga Photo Award photos) | "DI + Giga" pill |
| Video guidelines | Giga | Giga pill |
| Typography | shared fonts (Manrope, Open Sans) | "DI + Giga" pill |
| Social media, Email signature, Engagement map | DI templates that also carry the Giga logo | none |
| Backgrounds, Maps, DI guidelines, Knowledge, AI skills | DI (Maps and Backgrounds use Giga Maps data) | none |

## 2. Tokens

**Brand tabs** (`<BrandTabs />`, `components/brand/brand-tabs.tsx`), a segmented control:

| Part | Value |
| --- | --- |
| Track | `#01689D` (DI 700), radius 999px, padding 3px, height 36px |
| Segment | Open Sans 600, 14px, padding 0 16px, radius 999px |
| Selected | background `#FFFFFF`, text `#01689D`, shadow `0 1px 2px rgba(26,42,60,.15)` |
| Unselected | transparent, text `#FFFFFF`, hover `rgba(255,255,255,.14)` |
| Focus | 2px outline in the main text colour (`#1A2A3C`; dark theme `#F8F8F8`), offset 2px |
| Labels | "Digital Inclusion", "Giga" |

Contrast: white on `#01689D` and `#01689D` on white are both 6.05:1. The
track keeps these colours in the dark theme too (it reads well on `#0F1823`).

**Brand pills** (`<BrandPill />`): 12px, 600, radius 999px, padding 2px 10px.
The same size and shape for every brand.

| Brand | Label | Background | Text | Where |
| --- | --- | --- | --- | --- |
| giga | Giga | `#EEF1F4` | `#1A2A3C` | Giga-only page titles, result cards, ⌘K |
| both | DI + Giga | `#F2F4F6` | `#3B4A5A` | shared page titles (Typography), result cards, ⌘K |
| di | Digital Inclusion | `#EEF9FF` | `#01689D` | result cards and ⌘K only (DI pages get no pill) |

Dark theme: every pill is on `#22364C`, with text `#F8F8F8` (giga), `#B8C4D0`
(both) and `#82D3FF` (di), all above 6.9:1.

**Result previews**: 4:3, radius 12px, contain-fit with padding. White artwork
sits on `#1A2A3C`, everything else on `#F8F8F8`, in both themes: the preview
shows the real file. The card around it follows the theme.

## 3. Brand tabs and filter behaviour

- Placement: in `PageHeader`'s `actions` slot. The title is on the left and the
  tabs on the right, centred with the title. Under a 640px content width (a
  container query on the header), the tabs move below the title at full width,
  in equal segments.
- Built on Radix Tabs: arrow keys move between tabs, with tab and tabpanel roles.
  The filter has the same look, with "All" first.
- The choice lives in the URL, so links and Back work.
  - Filter pages: `?brand=all|di|giga`. No parameter means All, and choosing
    All removes it. Old links still work: `?brand=di`, `?brand=giga`, and
    `?palette=giga` (opens Giga).
  - Colors: `?brand=di|giga` (default `di`); `?palette=giga` opens Giga.
- Page code (`components/brand/brand-tabs.tsx`):
  - Colors: `<BrandTabsRoot>`, `<BrandTabs />` in the header, one
    `<BrandTabsContent brand="di|giga">` per brand.
  - Filter pages: `<BrandTabsRoot withAll>`, `<BrandTabs />` in the header,
    and the page in one `<BrandTabsPanel>`. Components read the filter with
    `useBrandFilter()` and `inBrandFilter()` (`lib/brand.ts`). The panel stays
    mounted, so the page keeps its selection.
- When the filter hides the selected item (a logo, an illustration), the first
  item the filter allows is selected. An item that is still allowed stays
  selected.
- Logos: each entry in `lib/brand-registry.ts` has a `brand`;
  `logosForFilter()` lists All as Digital Inclusion's logos (its own logo
  first), then the shared ones, then Giga's. Image galleries list DI first
  under All.

## 3a. Searchable dropdowns

Every dropdown with more than 7 options uses `<SearchableSelect>`
(`components/ui/searchable-select.tsx`), the pattern of the old Illustrations
picker: a search field at the top, a grouped list, a check mark on the
selected row, and an optional tag on the right of each row (the category or
type) or a code chip on the left (country codes).

- Search: every typed word must appear in the row's label, group, tag, code or
  keywords; rows whose label starts with the first word come first.
- Keyboard: on the trigger, Enter, Space or the arrow keys open the list, and
  typing a letter opens it with that letter in the search. In the list, type
  to filter, arrows move (starting from the selected row), Enter picks, Esc
  closes and returns focus to the trigger.

| Dropdown | Options | Groups | Searches |
| --- | --- | --- | --- |
| Logos, Brand | 16 | Digital Inclusion, DI + Giga, Giga (only the ones the filter allows) | name, group, brand, type tag ("logo", "product", "event"), versions, and the colours each logo comes in ("black") |
| Illustrations | 44 | Pillars, General, Giga Meter | name, category, synonyms |
| Social post, Country | 222 | none | name, country code |
| Maps and Abstract maps, Area | regions + countries | Regions, Countries | name, code |

Left as plain selects (7 options or fewer): Backgrounds "Background"
(3: Standard 1, Standard 2, Custom map) and Email signature "Office location"
(2: Geneva, Barcelona). The home + menu (5 formats) is an action menu, not a
select.

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
  | Giga + UNICEF + ITU partnership logo (8: horizontal and vertical, 4 colours each) | both | **set** by the portal owner |
  | Giga Photo Award photos (48) | both | **set** by the portal owner |
  | General illustrations (35 pictograms in fill, outline white and outline blue: 105) | both | **set** by the portal owner |

- **Giga symbol**: there is no symbol-only Giga file, so the script writes one
  from `/logos/giga-main-horizontal.svg`: every path left of the "giga"
  wordmark (x < 115), cropped to its box, as
  `/generated/logos/giga-symbol.svg` (full colour), `-white` and `-black`,
  with PNGs. They are indexed as "Giga symbol, full colour / white / black"
  (brand giga, page `/logos?brand=giga`). The original file is not edited.

  Not shared, on purpose: the Grey and Connectivity colour scales (they stay
  inside each palette), the pillar pictograms (15) and Giga Meter
  illustrations (4), which stay Giga.

  The shared brand is set in both places: in the overrides (search) and in
  each page's own list (`lib/brand-registry.ts`, `lib/illustration-registry.ts`,
  `PHOTO_AWARD_BRAND` in `lib/photo-awards.ts`, written by
  `tools/photo-awards/build.mjs`). The index build warns when an asset's brand
  in the index differs from its page, and `lib/search/brands.test.mjs` fails.

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
  Brand assets.", with links to the Brand assets pages.
- Searches are not added to Recent. Brief chips belong to the create flow only.

## 7. ⌘K

- It uses the same index and matcher. Groups appear in this order: Assets
  (when the query has asset words, meaning any facet), Formats, Pages. An
  empty query shows Formats and Pages.
- Page rows are grouped under their side panel group ("Pages · Brand assets",
  "Pages · Brand guidelines"). A page is found by its title first, then by its
  other names (DI guidelines still answers to "brand guidelines"), then by its
  group's names, old ones included ("assets", "brand").
- Asset rows have a 32px thumbnail, title and brand pill. Enter opens the
  asset's page. ⌘Enter (Ctrl+Enter), or the row's download button, downloads
  the first format.
