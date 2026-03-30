---
name: giga-design-system
description: Builds product UIs using the Giga Product Design System. Use when building interfaces with Next.js, React, Tailwind, or shadcn/ui, or when the user mentions Giga design system, Giga UI, or brand-compliant components.
---

# Giga Product Design System

Every UI element MUST follow these rules. Stack: **Next.js + React + Tailwind CSS + shadcn/ui** (vanilla, `npx shadcn@latest add`). Theme shadcn via CSS variables and Tailwind config; use only Giga palette colors.

## Stack and components

- **Stack**: Next.js, React, Tailwind CSS, shadcn/ui.
- **Install components**: `npx shadcn@latest add` for Button, Input, Card, Dialog, Table, Tabs, Select, Form, Sidebar, Navigation Menu, Sheet, Badge, Toast (Sonner), Tooltip, Charts (Recharts).

## Fonts (only two allowed)

- **Manrope** → headings only (`text-2xl` through `text-9xl`), weight **500** only.
- **Open Sans** → everything else (`text-xs` through `text-xl`), weights 400, 500, 600.

**Import** (e.g. in `globals.css` or layout):

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap');
```

**Tailwind**: Map `font-sans` to Open Sans and a dedicated font for headings to Manrope (e.g. `font-heading`), and use Manrope 500 for all heading classes.

**Font weights**: 400 = body/paragraphs; 500 = buttons, links, tags; 600 = section titles, leading headers.

## Typography scale

| Role | Font | Classes | Size/line (approx) |
|------|------|--------|---------------------|
| Headings | Manrope 500 | text-2xl … text-9xl | text-2xl: 24/36 → text-9xl: 128/136/-1px |
| Body | Open Sans | text-xs … text-xl | text-xs: 12/18 → text-xl: 20/30 |

Use the scale in Tailwind; avoid arbitrary font sizes unless matching this scale.

## Colors and theming

- **Primary base**: `#277aff` (Primary600). Use for primary buttons, links, focus rings.
- **Semantic**: Good = Green600 `#00d661`; Moderate = Yellow `#ffc93d`; Bad = Red `#ed1c24`.
- **Light mode**: Text primary = Grey950; secondary = Grey600. Background = White. Dividers = Grey200 (default), Grey100 (light). Primary btn = fill Primary600, hover Primary700, text White. Secondary btn = outline Primary600, hover Primary700. Links = Primary600.
- **Dark mode (e.g. Giga Maps)**: Text primary = Grey50; secondary = Grey400. Background = Grey950. Dividers = Grey800 (default), Grey900 (light). Buttons and links same as light.

Use only Giga palette colors. For full hex scales (Primary, Grey, Green), see [reference.md](reference.md).

## CSS variables (globals.css)

Apply in `:root` and `.dark` so shadcn and Tailwind use Giga tokens:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 9%;
  --primary: 214 100% 58%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 91%;
  --muted-foreground: 0 0% 44%;
  --accent: 214 100% 95%;
  --accent-foreground: 0 0% 9%;
  --destructive: 357 88% 52%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 91%;
  --input: 0 0% 91%;
  --ring: 214 100% 58%;
  --radius: 6px;
}

.dark {
  --background: 0 0% 9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 9%;
  --popover-foreground: 0 0% 98%;
  --primary: 214 100% 58%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 22%;
  --muted-foreground: 0 0% 79%;
  --accent: 0 0% 22%;
  --accent-foreground: 0 0% 98%;
  --destructive: 357 88% 52%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 22%;
  --input: 0 0% 22%;
  --ring: 214 100% 58%;
}
```

## Border radius

- Small card: 6px · Big card: 8px · Badge: 4px · Small btn: 4px · Standard btn: 6px · Pill btn: 9999px · Inputs: 6px.

Use Tailwind `rounded-*` or `--radius` so components match (e.g. buttons 6px, badges 4px, inputs 6px).

## Shadows and hover

- **Usage**: `shadow` = form controls; `shadow-sm` = small cards; `shadow-md` = medium cards; `shadow-lg` = dropdowns/tooltips; `shadow-xl` = modals/dialogs; `shadow-2xl` = fullscreen overlays; `shadow-inner` = focused inputs.
- **Hover**: Every interactive element goes **up one shadow step** on hover (e.g. `shadow-sm` → `hover:shadow-md`).

## Motion

- **Medium/large**: spring `mass: 1, stiffness: 180, damping: 30` (~400ms).
- **Small**: spring `mass: 1, stiffness: 720, damping: 60` (~200ms).

Use CSS or Framer Motion with these values for transitions and micro-interactions.

## Rules checklist

1. **Fonts**: Only Manrope (headings, weight 500) and Open Sans (body, 400/500/600).
2. **UI**: shadcn/ui vanilla, themed via CSS variables above.
3. **Stack**: Next.js + React + Tailwind.
4. **Colors**: Only Giga palette (see reference.md for full scales).
5. **Hover**: Shadow up one step on interactive elements.
6. **Radius**: Per component (see Border radius table).
7. **Animation**: Spring-based motion as above.

## Additional resources

- Full Primary, Grey, and Green hex palettes: [reference.md](reference.md)
