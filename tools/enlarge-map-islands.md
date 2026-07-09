# Engagement map — island pre-processing

`public/data/engagement-map-wiki.svg` is not the raw Wikipedia blank map: it has
been processed once so that small island states show their real coastline
instead of a marker circle. Feedback came from country presentations where the
Caribbean read as a grid of dots.

What the processing does:

1. Removes every `.circle` marker element (75 of them).
2. For each `.land` element whose bounding box is smaller than 12 SVG user
   units (~5 px at the rendered 1387 px map width), appends a
   `translate(cx cy) scale(k) translate(-cx -cy)` transform that enlarges the
   shape around its own center up to 18 units (~7 px), and sets an inline
   `stroke-width: 1.5/k` on its paths so the white halo stays visually thin.

The geometry is baked into the file on purpose: a runtime version of this logic
(DOM mutation in an effect) proved fragile — React re-sets the injected SVG and
the PNG export can capture the un-mutated tree.

## Regenerating

If the base map is ever replaced, restore the raw file, open the site in the
browser, and run this in DevTools on any page that can fetch the SVG:

```js
const raw = await fetch('/data/engagement-map-wiki.svg').then(r => r.text())
const doc = new DOMParser().parseFromString(raw, 'image/svg+xml')
const svg = doc.documentElement
const host = document.createElement('div')
host.style.cssText = 'position:absolute;left:-99999px;top:0;width:1387px;height:898px'
host.appendChild(svg)
document.body.appendChild(host)
for (const c of Array.from(host.querySelectorAll('.circle'))) c.remove()
const MIN = 12, TARGET = 18
for (const el of host.querySelectorAll('.land')) {
  const box = el.getBBox()
  const size = Math.max(box.width, box.height)
  if (size <= 0 || size >= MIN) continue
  const k = TARGET / size
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2
  const grow = `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${k.toFixed(3)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`
  const prior = el.getAttribute('transform')
  el.setAttribute('transform', prior ? `${prior} ${grow}` : grow)
  const paths = el.tagName === 'path' ? [el] : Array.from(el.querySelectorAll('path'))
  for (const p of paths) p.style.strokeWidth = (1.5 / k).toFixed(3)
}
host.remove()
const out = new XMLSerializer().serializeToString(svg)
const a = document.createElement('a')
a.href = URL.createObjectURL(new Blob([out], { type: 'image/svg+xml' }))
a.download = 'engagement-map-wiki.svg'
a.click()
```

Then move the downloaded file over `public/data/engagement-map-wiki.svg`.
