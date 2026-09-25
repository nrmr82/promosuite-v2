# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

PromoSuite: a marketing studio for individual real estate agents (teams/brokerages are "coming soon").
Available now: Design Studio (flyers from templates, saved to Supabase), photo editor, profile/settings.
Roadmap (shown in-app as "Soon", see `src/lib/roadmap.js`): brand kit and listings (Phase 1), AI writer
(2), listing pages with lead capture (3), social planner (4), video reels (5).

Stack: React 18 + **Vite 8** (Create React App was removed), Tailwind CSS 4 with shadcn/ui-style
components on Radix in `src/components/ui/`, React Router, Supabase (auth + Postgres + storage),
Fabric.js editors, Stripe Checkout. Hosted on **Cloudflare Pages**; server code lives in `functions/`
as Pages Functions (Workers AI, Stripe checkout, account deletion). See `CLOUDFLARE_SETUP.md`.

Only free services: don't add paid SDKs or APIs (the app previously used Polotno and Replicate) or
put any secret in a `VITE_*` variable, since those ship to the browser. Secrets belong in Pages
Functions (`context.env`).

## Commands

```bash
npm install                     # dependencies (runs automatically in cloud sessions via .claude/hooks)
npm run dev                     # Vite dev server on http://localhost:3000 (/api proxied to :8788)
npm run build                   # production build into build/ (Cloudflare Pages output dir)
npm test                        # Vitest (tests/)
npm run lint                    # ESLint 9 flat config
npm run functions:dev           # serve functions/ on :8788 (needs `npx wrangler login` for the AI binding)
npm run pages:dev               # build + serve app and functions on :8788
```

## Environment variables

- `.env.development` / `.env.test` / `.env.production` (committed): public Supabase URL and anon key
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); the anon key is browser-safe by design.
- Optional public build values (Stripe price IDs `VITE_STRIPE_PRO_{MONTHLY,YEARLY}_PRICE_ID`) go in
  `.env.local` or the Cloudflare build settings; without them "Upgrade" shows a "launching soon" toast.
- Server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) are Cloudflare Pages secrets, or
  `.dev.vars` locally; public server values and the Workers AI binding are in `wrangler.toml`.

## Code layout

- `src/main.jsx` providers (theme, tooltip, router, auth, toasts); `src/App.jsx` routes
- `src/layouts/`: `public-layout` (marketing/auth pages) and `app-layout` (sidebar app shell)
- `src/pages/`: landing, pricing, auth (login/signup/forgot/reset/callback), dashboard, designs,
  flyer-editor, photo-editor, settings, coming-soon, not-found
- `src/components/ui/`: design-system components; `src/components/designs/`: template gallery, design grid
- `src/components/FlyerStudio/`: Fabric.js flyer editor, templates, `templateObjects.js` (builder + previews)
- `src/components/PortraitStudio/`: Fabric.js photo editor
- `src/lib/`: `supabase`, `auth` (sign-in/up, profile), `designs` (CRUD), `stripe`, `ai`, `roadmap`, `utils` (`cn`)
- `src/contexts/auth.jsx`: session, user, profile (`useAuth`)
- `src/styles/app.css`: Tailwind entry and theme tokens (light default, `.dark` class)
- `functions/`: Cloudflare Pages Functions (`/api/*`); `functions/_lib/auth.js` verifies the Supabase token
- `supabase/migrations/`: database scripts to run in the Supabase SQL editor; `supabase/archive/`: old ones
- `public/templates/*.png`: pre-rendered template previews (regenerate when templates change)

## Conventions

- Style with Tailwind classes and the theme tokens (`bg-background`, `text-muted-foreground`,
  `bg-primary`, `text-gold`...); never hard-code colors, so light and dark both work.
- Mark unfinished features honestly (a "Soon" badge, a coming-soon page); no fake data or stats.
- **Desktop only for now**: don't add mobile/tablet-specific work.

## Cloud sessions

The cloud container's network policy may block `*.supabase.co`, `*.cloudflare.com` and Stripe, so
login, AI and data calls fail in in-container previews. To see logged-in pages here, mock Supabase in
Playwright (seed `sb-<ref>-auth-token` in localStorage and fulfil `*.supabase.co` requests). To
smoke-test functions, run `wrangler pages dev` from a copy of `wrangler.toml` without the `[ai]`
block. Check real behavior on the Cloudflare preview for the branch.
