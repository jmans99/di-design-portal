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
   `PAGE_ROUTES` in `lib/site.ts`.
2. Add the path to the `routes` list of each site that should have it (or
   remove it to take the page off that site).
3. If it should be in the menu, add it to a group in `lib/nav.ts`.

`proxy.ts` (Next.js 16 request proxy, formerly middleware) returns the normal
404 for any path in `PAGE_ROUTES` that the current site does not list. Menu
links, home page tiles and FAQ answers that point to a disabled page are
hidden automatically. API routes are not gated: they work on both sites.

### How the menu groups work

`lib/nav.ts` holds one list of groups. The desktop header (dropdowns and the
sliding active indicator), the mobile menu and the footer all read from it.

| Group     | Items                                                                      |
| --------- | -------------------------------------------------------------------------- |
| Brand     | Colors, Typography, Video (giga) / Brand guidelines (di)                   |
| Assets    | Logos, Illustrations, Image galleries, Photo awards                        |
| Create    | Maps, Social media, Engagement map, Email signature, Backgrounds, (Slides) |
| AI skills | AI skills (di)                                                             |

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
