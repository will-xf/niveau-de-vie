# Niveau de vie

A small public calculator: enter your household composition and income, and see
your "niveau de vie" (equivalised income) plotted against three French
benchmarks — seuil de pauvreté, niveau de vie médian, seuil de richesse — both
per consumption unit and for your whole household. No accounts, no personal
data collected.

## Stack

- **Next.js (App Router, TypeScript) + Tailwind CSS**, deployed on Vercel.
  Calculations are plain arithmetic (see `lib/calculations.ts`), so there's no
  Python runtime involved. If a future feature genuinely needs one, Vercel
  supports mixed-runtime projects — a `/api/*.py` function can be added later
  without restructuring this app.
- **Upstash Redis** (free tier) for the anonymous visit counter — just an
  incrementing integer, no personal data. The counter hides itself if the
  Upstash env vars aren't set.

## Project layout

```
app/
  layout.tsx        # fonts, metadata, OG/Twitter tags
  page.tsx           # page content (masthead, calculator, footer)
  globals.css        # design tokens (Tailwind v4 CSS-based theme)
  icon.tsx           # generated favicon (next/og)
  opengraph-image.tsx # generated OG/share image (next/og)
  sitemap.ts, robots.ts
  api/counter/route.ts # GET: increments and returns the visit counter
components/
  CalculatorForm.tsx     # household + income inputs, holds all calculator state
  LivingStandardBar.tsx  # the SVG gauge (per-UC ticks left, household ticks right)
  VisitorCounter.tsx     # fetches /api/counter on mount
lib/
  constants.ts       # fixed variables: thresholds and consumption-unit weights
  calculations.ts    # pure calculation + formatting functions
  redis.ts           # Upstash client wrapper
```

## Fixed variables (`lib/constants.ts`)

| Variable | Value |
| --- | --- |
| Seuil de pauvreté | 1 288 €/mois |
| Niveau de vie médian | 2 147 €/mois |
| Seuil de richesse | 4 292 €/mois |

Consumption units: first adult = 1, each additional adult = 0.5, each child
≥15 = 0.5, each child <15 = 0.3.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` to wire up the visit counter (get a
free Redis database at [upstash.com](https://upstash.com) or via the Vercel
Marketplace) and to set `NEXT_PUBLIC_SITE_URL` once a domain/slug is chosen.
Without it, the app still runs fully — the counter just doesn't appear.

## Deploying

Push to GitHub and import the repo on Vercel, or run `vercel`. Set
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and
`NEXT_PUBLIC_SITE_URL` as environment variables in the Vercel project.
