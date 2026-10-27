# Brand asset portal

Next.js (App Router), Tailwind and shadcn/ui. One codebase that runs as two
sites: the **Giga brand portal** and the **Digital Inclusion brand portal**.

```bash
npm install --legacy-peer-deps
npm run dev
```

Deploy notes: see [DEPLOY.md](DEPLOY.md).

## Two sites

### What `NEXT_PUBLIC_SITE` does

One setting picks the site: `NEXT_PUBLIC_SITE=giga` or `NEXT_PUBLIC_SITE=di`.
If it is missing (or has any other value) the app runs as **giga**; in
development an unknown value logs a warning.

It decides:

- the site name, page title and description, and the browser theme colour
- the header and footer logos
- Hotjar (giga only for now; no script when the ID is `null`)
- which pages exist (other pages return the normal 404)
- the colour tokens: `<html data-site="giga|di">`, and `app/globals.css`
  overrides the colour tokens under `[data-site='di']`
- the organisation name in copy about the portal itself ("Giga" / "Digital Inclusion")
- the shell (`shell` in `lib/site.ts`): Giga uses the marketing shell (top
  header, marketing home, footer); DI uses the app shell (side panel, slim top
  bar with a Beta badge, and the "What are you generating today?" home)

Everything site-specific lives in **`lib/site.ts`**. The value is read at
build time, so change it and rebuild (or restart `npm run dev`).

### Run each site locally

```bash
npm run dev                       # Giga (default)
NEXT_PUBLIC_SITE=di npm run dev   # Digital Inclusion
```

Production build: `NEXT_PUBLIC_SITE=di npm run build && npm start`.

### Add or remove a page from a site

1. New page: create it under `app/(main)/…` as usual and add its path to
   `PAGE_ROUTES` in `lib/site.ts` (dynamic segments as `[id]`, e.g.
   `/knowledge/audiences/[id]`).
2. Add the path to the `routes` list of each site that should have it (or
   remove it to take the page off that site).
3. If it should be in the menu, add it to a group in `lib/nav.ts`.

`proxy.ts` (Next.js 16 request proxy, formerly middleware) returns the normal
404 for any path in `PAGE_ROUTES` that the current site does not list. Menu
links, home page tiles and FAQ answers that point to a disabled page are
hidden automatically. API routes are not gated: they work on both sites.

### How the menu groups work

`lib/nav.ts` holds one list of groups and items (with their side panel
icons). Each shell picks its order from it: `NAV_GROUPS` for the Giga header
(dropdowns and the sliding active indicator), mobile menu and footer;
`SIDEBAR_GROUPS` for the DI side panel (Home, Create, Knowledge, Assets,
Brand, AI skills). Items marked `soon: true` show in the side panel as
disabled with a "Soon" label, and never in the header or footer.

| Group     | Items                                                                      |
| --------- | -------------------------------------------------------------------------- |
| Brand     | Colors, Typography, Video (giga) / Brand guidelines (di)                   |
| Assets    | Logos, Illustrations, Image galleries, Photo awards                        |
| Create    | Maps, Social media, Engagement map, Email signature, Backgrounds, (Slides, Two-pagers: soon) |
| AI skills | AI skills (di)                                                             |
| Home      | Home (di side panel only)                                                  |
| Knowledge | Audiences, Facilities, Offerings, (KPIs, Case studies: soon) (di side panel only) |

Each item is dropped when its page is not enabled for the current site. A group
left with one item shows as a plain link (no dropdown); an empty group is
hidden. Slides has no page yet and stays hidden on both sites while
`SLIDES_HIDDEN` is `true`.

### Vercel setup

- **Existing project (Giga):** set `NEXT_PUBLIC_SITE=giga` explicitly for
  Production and Preview (it is also the default).
- **Second project (Digital Inclusion):** in Vercel, Add New → Project, import
  this same repository, production branch `main`, and set
  `NEXT_PUBLIC_SITE=di` for Production and Preview. Same build settings as the
  Giga project (`vercel.json` is shared).

Both projects deploy every push to `main`, and each pull request gets a
preview on both.

## Knowledge data (DI)

The Knowledge pages (`/knowledge/audiences`, `/knowledge/facilities`,
`/knowledge/offerings`) read
`data/knowledge/*.json`, imported from the review cockpit
([jmans99/review-cockpit](https://github.com/jmans99/review-cockpit),
`data/appdata.json`). To refresh after the cockpit changes, clone it next to
this repo and run:

```bash
git clone https://github.com/jmans99/review-cockpit ../review-cockpit
node scripts/import-knowledge.mjs            # or: node scripts/import-knowledge.mjs path/to/appdata.json
```

Commit the updated `data/knowledge/` files. Only names, descriptions,
groupings and links are imported (no evidence, excerpts, sources or counts).
The tables at the top of `scripts/import-knowledge.mjs` hold everything you
may want to correct: the mapping from the cockpit's audience groups to the
nine audience groups, which cockpit audiences are facilities (schools and
health institutions), the official list of 18 offerings in six categories
with the cockpit offering each one is matched to, and name and text fixes.
The script lists anything it could not map.
