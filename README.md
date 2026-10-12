# BombaNotes

Your campus knowledge, all in one place. A clickable frontend prototype of a student-notes marketplace for Indonesian CS students.

> Prototype only. All notes, names, prices, ratings and statistics are fictional. Payments are simulated. There is no backend, login or real file upload.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
npm run typecheck  # TypeScript only
npm test           # 20 end-to-end flow tests (Vitest + Testing Library)
```

Requires Node 18+. Fonts (Bricolage Grotesque, Inter, JetBrains Mono) load from Google Fonts; the app falls back to system fonts offline.

## Demo flows

**Buyer:** Home → search "Database" → open *Database Systems — SQL & Normalization Guide* → read preview → Unlock with Pass → Pay Rp15,000 and unlock → success → Read note or Download PDF → My Library (shows "Pass").

**Seller:** Sell notes → fill basics → content (topics, PDF, cover) → price + rights checkbox → review → Submit → "Your note has been submitted for review." (Pending review) → Seller dashboard.

Use **Profile → Reset demo data** to return to the starting state.

## Where things live

| Need to change | File |
| --- | --- |
| Pass price (Rp15,000), period, commission %, creator pool maths | `src/config.ts` (one place; subscribe, sell, dashboard and copy all read it) |
| Notes, creators, categories, universities, preview pages | `src/data/` |
| Saved state (library, bookmarks, recents, listings, draft, profile) | `src/store/store.ts` → `localStorage` key `bombanotes:v2` |
| Search, filters, sorting | `src/lib/search.ts` |
| Demo PDF download | `src/lib/download.ts` |
| Routes (hash router) | `src/App.tsx`, `src/lib/router.tsx` |
| Cover art (CSS/SVG, no images) | `src/components/Cover.tsx` |
| Design tokens | `tailwind.config.js`, `src/index.css` |

## Revenue model shown in the product

- One subscription: **BombaNotes Pass, Rp15,000 per 30 days**. It unlocks, reads and downloads every Pass note. Free notes stay free.
- BombaNotes keeps 15% of Pass revenue. The other 85% (Rp12,750 per subscriber) goes into a creator pool.
- Creator earnings shown on the dashboard are an **estimate**: the pool is split per download, assuming 5 downloads per subscriber per month (Rp2,550 each). It is not a real per-sale price.
- Cancelling keeps access until the period ends. When the Pass expires, Pass notes lock again and show "Renew Pass".

## Known prototype limits

- Uploaded PDFs are not stored. Only the file name and size are saved (the UI says so).
- Notes show hand-written sample pages, not real PDFs. "Download PDF" generates a PDF in the browser from those sample pages only, not the creator's full document.
- Payment and the 30-day Pass are simulated. There is no auto-renew or real charge.
- "Pending review" listings never go live; there is no moderation.
- Seller earnings, sales and downloads are sample numbers. Nothing is paid out.
- State lives in one browser's `localStorage`; it does not sync across devices.
