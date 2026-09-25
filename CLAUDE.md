# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

PromoSuite V2: a React marketing suite for real estate agents.
- **FlyerPro**: flyer creation from templates (Fabric.js / Polotno editors)
- **SocialSpark**: social media post creation and scheduling
- Landing page, auth, pricing/subscriptions (Stripe), profile/settings, collections and favorites

Stack: Create React App 5 (`react-scripts`), React 18, Supabase (auth + Postgres), Fabric.js
(flyer and photo editors), Stripe Checkout. Hosted on **Cloudflare Pages** (free, commercial use OK):
server code lives in `functions/` as Pages Functions (AI via Workers AI, Stripe checkout, account
deletion); see `CLOUDFLARE_SETUP.md`. `vercel.json` only remains until the Vercel project is retired.

Only free services: don't add paid SDKs or APIs (the app previously used Polotno and Replicate) or
any secret in a `REACT_APP_*` variable, since those ship to the browser. Secrets belong in
Pages Functions (`context.env`).

## Commands

```bash
npm install                     # dependencies (runs automatically in cloud sessions via .claude/hooks)
npm start                       # dev server on http://localhost:3000 with hot reload
npm run build                   # production build into build/ (CI=false, so lint warnings don't fail it)
npm run pages:dev               # build + serve app and functions/ on :8788 (needs `npx wrangler login`)
npm run functions:dev           # serve functions/ on :8788; `npm start` proxies /api there (src/setupProxy.js)
npx eslint src/path/to/file.js  # lint a file
CI=true npm test -- --watchAll=false            # run tests once
CI=true npm test -- --watchAll=false <pattern>  # run a single test file
```

Many existing tests are stale and fail (e.g. `src/App.test.js` still looks for CRA's "learn react" text).

## Environment variables

- `.env.development` / `.env.test` / `.env.production` (committed): public Supabase URL and anon key,
  so `npm start`, `npm test` and every build (including deploy previews) work without setup. The anon
  key is browser-safe by design. Build variables set in the hosting dashboard override these.
- `.env.local` (gitignored): optional public build values such as Stripe price IDs
  (`REACT_APP_STRIPE_*_PRICE_ID`). Run `grep -rhoE "process\.env\.[A-Z_0-9]+" src | sort -u` for the list.
- Server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) are Cloudflare Pages secrets, or
  `.dev.vars` locally; public server values and the Workers AI binding are in `wrangler.toml`.
- `src/utils/supabase.js` throws if the Supabase vars are missing, which blanks the whole app.

## Code layout

- `src/App.js`: top-level app, routing and auth state
- `src/components/`: pages and UI (Dashboard, FlyerPro, SocialSpark, LandingPage, editors, modals)
- `src/pages/`: Profile, Settings, admin
- `src/services/`: business logic and Supabase calls (`authService`, `subscriptionService`, ...)
- `src/contexts/`: AuthContext, TemplateContext, ProductContext
- `src/utils/supabase.js`: the Supabase client; `src/utils/stripe.js`: starts checkout via `/api`
- `src/services/aiService.js`: AI text/images via `/api/ai/*`
- `src/components/FlyerStudio/`: Fabric.js flyer editor and starter templates
- `functions/`: Cloudflare Pages Functions (`/api/*`); `functions/_lib/auth.js` verifies the Supabase token
- `src/platforms/desktop/`, `src/shared/`: platform split (see `IMPORTANT_PROJECT_STRUCTURE.md`)
- `supabase/migrations/`, `database/`, `*.sql`: database schema and fixes
- `backend/`: old FastAPI mock AI service; not deployed or used
- `backup*/`: old copies of components; not used by the app

## Constraints

- **Desktop only for now**: don't add mobile/tablet or touch-specific work (see
  `DEVELOPMENT_CONSTRAINTS.md`, `WARP_SESSION_NOTE.md`).
- The many `*_FIX*.md` / `*_SETUP*.md` files at the root are notes from earlier AI sessions;
  they may be out of date.

## Cloud sessions

The cloud container's network policy may block `*.supabase.co`, `*.cloudflare.com` and Stripe, so
login, AI and data calls fail in in-container previews. `wrangler pages dev` needs a Cloudflare login
for the AI binding; to smoke-test functions here, run it from a copy of `wrangler.toml` without the
`[ai]` block. Check real behavior on a deployed preview.
