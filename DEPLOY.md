# Come pubblicare il sito online (Vercel)

## Opzione 1: Vercel (consigliato — gratuito)

1. **Vai su [vercel.com](https://vercel.com)** e accedi (puoi usare “Continue with GitHub”).

2. **Importa il progetto**
   - Clicca **“Add New…”** → **“Project”**
   - Seleziona il repository **brand-asset-generator-9f** (o il nome della tua repo)
   - Clicca **“Import”**

3. **Configurazione (di solito va bene così)**
   - **Framework Preset:** Next.js (rilevato in automatico)
   - **Root Directory:** lascia vuoto
   - **Build Command:** `pnpm build` (o `npm run build` se usi npm)
   - **Output Directory:** lascia il default
   - Clicca **“Deploy”**

4. **Dopo il deploy**
   - Vercel ti darà un URL tipo:  
     **`https://brand-asset-generator-9f.vercel.app`**
   - Ogni push su `main` su GitHub farà un nuovo deploy in automatico.

---

## Opzione 2: Netlify

1. Vai su [netlify.com](https://www.netlify.com) e accedi con GitHub.
2. **Add new site** → **Import an existing project** → **GitHub** → scegli la repo.
3. Build command: `pnpm build` (o `npm run build`)
4. Publish directory: `out` **oppure** lascia che Netlify rilevi Next.js (usa il loro plugin).
5. Deploy. Avrai un URL tipo: `https://nome-random.netlify.app`.

---

## Note

- **Variabili d’ambiente:** se in futuro aggiungi `.env` (es. API key), impostale nella dashboard Vercel/Netlify in **Settings → Environment Variables**.
- **Dominio personalizzato:** in Vercel/Netlify puoi aggiungere un tuo dominio (es. `brand.giga.org`) dalle impostazioni del progetto.
