# DI design portal

The UNICEF Digital Inclusion (DI) design portal: brand and design material for
DI, together with the Giga brand material (Giga logos, colours and video
guidelines), in one site with the DI look. Built with Next.js 16 (App Router),
Tailwind and shadcn/ui.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` makes a production build and
`npm run lint` runs ESLint. A `.npmrc` sets `legacy-peer-deps=true`, so a plain
`npm install` works.

## Structure

- `app/(main)/…`: the pages, all inside the side panel app shell
  (`components/app-shell/`).
- `lib/nav.ts`: the side panel groups and items (Home, Create, Knowledge,
  Assets, Brand, AI skills). Add a new page here to put it in the menu.
- `lib/site.ts`: portal name, page title and description, header logo and
  browser theme colour.
- `app/globals.css`: the DI colour tokens. The Giga palette stays available on
  the Colors page (`/colors?palette=giga`).

## Deploy

Deployed on Vercel from `main`; every pull request gets a preview.

## Knowledge data

The Knowledge pages (`/knowledge/audiences`, `/knowledge/facilities`,
`/knowledge/systems`, `/knowledge/offerings`) read
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
nine audience groups, which cockpit audiences are facilities (places: schools
and health facilities) or systems (education and health systems, services and
institutions), the official list of 18 offerings in six categories
with the cockpit offering each one is matched to, and name and text fixes.
The script lists anything it could not map.
