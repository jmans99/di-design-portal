# Report di consistenza con le linee guida Giga Design

Riferimento: cartella **Giga Design** (`/Users/mariodelprete/Desktop/Giga Design`)  
App: **Brand Asset Generator**

---

## ✅ Elementi già allineati

| Area | Stato | Dettaglio |
|------|--------|-----------|
| **Font** | OK | Import Manrope + Open Sans in `app/globals.css`; `font-sans` (Open Sans) su `body`; `font-heading` (Manrope) per titoli. |
| **Primary** | OK | Scale 50–900 e semantic `--primary: 214 100% 58%` (#277aff) come da Giga. |
| **Grey** | OK | Scale 50–950 in Tailwind e in `lib/color-tokens.ts` coerente con Giga. |
| **Connectivity (token singoli)** | OK | Green #00D661, Yellow #FFC93D, Red #ED1C24 in Tailwind e nella sezione Connectivity della palette. |
| **Semantic CSS variables** | OK | `--foreground`, `--muted`, `--border`, `--destructive` (357 88% 52%), `--accent` (primary-50), light/dark come da Giga. |
| **Border radius button** | OK | Button e controlli principali a 6px (`rounded-[6px]` / `--radius: 6px`). |
| **Uso tipografia** | OK | Manrope 400 per headings, Open Sans 400/500/600 per body e interattivi. |

---

## ❌ Incongruenze rilevate e correzioni

### 1. Scale “Accent Green” e “Accent Red” nella palette colori

**Linee guida Giga:**  
- **Connectivity Green** è una scale precisa: 50 #d6ffe9 → 100 #adffd2 → 200 #85ffbc → 300 #5cffa5 → 400 #33ff8f → 500 #0aff78 → **600 #00d661** (base) → 700–900.  
- **Red** è un token singolo: **#ed1c24** (non una scale Tailwind generica).

**Situazione in app:**  
- In `lib/color-tokens.ts`, “Accent Green” usava una scale tipo emerald (#EDFAF6, #059669, …) e “Accent Red” una scale rossa generica (#FEF2F2, #DC2626, …). Non sono le scale/token Giga.

**Correzione applicata:**  
- “Accent Green” sostituita con la **Connectivity Green** Giga (stessa scale di `giga-design-tokens.json`).  
- “Accent Red” sostituita con un unico token **Red #ed1c24** (e scale ridotta/rimossa dove non prevista da Giga), così la pagina Color Palette riflette i token di brand.

---

### 2. Font di fallback su `body` (e file `styles/globals.css`)

**Linee guida Giga:**  
- Solo Manrope e Open Sans; body esplicitamente Open Sans.

**Situazione in app:**  
- `app/globals.css` non imposta `font-family` su `body`; il font viene da `layout.tsx` con `className="font-sans"` (Open Sans). Corretto.  
- In `styles/globals.css` (non importato dall’app) c’è `font-family: Arial, Helvetica, sans-serif`, in contrasto con le linee guida.

**Raccomandazione:**  
- Aggiungere in `app/globals.css` in `@layer base`: `body { font-family: 'Open Sans', sans-serif; }` per allineamento esplicito alle linee guida.  
- Ignorare o rimuovere la regola Arial in `styles/globals.css` se il file non è usato; altrimenti sostituire con Open Sans.

---

### 3. Radius per card (grande vs piccolo)

**Linee guida Giga:**  
- card-sm: 6px, card-lg: 8px, button/input: 6px, badge: 4px.

**Situazione in app:**  
- In Tailwind è definito solo `--radius: 6px`; `rounded-lg` usa lo stesso `var(--radius)`, quindi anche le card “grandi” sono a 6px.  
- Non sono definite `--radius-sm` (4px) e `--radius-lg` (8px).

**Raccomandazione:**  
- Aggiungere in `app/globals.css`: `--radius-sm: 4px`, `--radius-lg: 8px`, `--radius-pill: 9999px`.  
- Nel `tailwind.config.ts` mappare `borderRadius.lg` a `var(--radius-lg)` (8px) per card grandi e mantenere 6px per button/input/card piccole.

---

### 4. Shadow su elementi interattivi (hover)

**Linee guida Giga:**  
- “All interactive elements go UP one shadow step on hover” (es. shadow-sm → shadow-md).

**Situazione in app:**  
- Sui blocchi di preview l’hover è stato rimosso (come richiesto).  
- Non sono presenti le utility `.shadow-hover`, `.shadow-sm-hover`, ecc. definite in `giga-globals.css`.

**Raccomandazione:**  
- Per elementi interattivi (pulsanti, card cliccabili, link-card) considerare l’aggiunta delle utility shadow-hover da Giga, oppure applicare manualmente “un passo in più” di shadow on hover.

---

### 5. Chart colors

**Linee guida Giga:**  
- Chart possono usare primary, green, yellow, red; in `giga-globals.css`: chart-1 primary, chart-2 green, chart-3 yellow, chart-4/5 altri.

**Situazione in app:**  
- In `app/globals.css` chart-1 e chart-2 sono alineati; chart-3/4/5 sono valori generici.  
- Per piena coerenza si possono allineare chart-2/3/4/5 ai colori connectivity (green, yellow, red) e primary come in Giga.

---

## Riepilogo azioni

| # | Azione | Priorità |
|---|--------|----------|
| 1 | **Fatto:** Allineare scale “Accent Green” e “Accent Red” in `lib/color-tokens.ts` ai token Giga (Connectivity Green + Red #ed1c24). | Alta |
| 2 | Aggiungere `body { font-family: 'Open Sans', sans-serif; }` in `app/globals.css`. | Media |
| 3 | Aggiungere `--radius-sm`, `--radius-lg`, `--radius-pill` e usare 8px per card grandi. | Media |
| 4 | Valutare utility shadow-hover per elementi interattivi. | Bassa |
| 5 | Allineare chart colors a primary/green/yellow/red Giga se si usano grafici. | Bassa |

---

*Report generato dal confronto con: `giga-design-tokens.json`, `giga-globals.css`, `GIGA_SYSTEM_PROMPT.md`, `GIGA_SHADCN_SETUP.md`, `tailwind.config.ts` (Giga Design).*
