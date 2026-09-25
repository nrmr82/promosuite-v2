# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

PromoSuite V2: a React marketing suite for real estate agents.
- **FlyerPro**: flyer creation from templates (Fabric.js / Polotno editors)
- **SocialSpark**: social media post creation and scheduling
- Landing page, auth, pricing/subscriptions (Stripe), profile/settings, collections and favorites

Stack: Create React App 5 (`react-scripts`), React 18, React Router 6, Supabase (auth + Postgres),
Stripe, Replicate/Hugging Face for AI features. Deployed to Vercel (`vercel.json`); a Netlify
function (`netlify/functions/delete-account.js`) handles account deletion.

## Commands

```bash
npm install                     # dependencies (runs automatically in cloud sessions via .claude/hooks)
npm start                       # dev server on http://localhost:3000 with hot reload
npm run build                   # production build into build/ (CI=false, so lint warnings don't fail it)
npx eslint src/path/to/file.js  # lint a file
CI=true npm test -- --watchAll=false            # run tests once
CI=true npm test -- --watchAll=false <pattern>  # run a single test file
```

Many existing tests are stale and fail (e.g. `src/App.test.js` still looks for CRA's "learn react" text).

## Environment variables

- `.env.development` / `.env.test` / `.env.production` (committed): public Supabase URL and anon key,
  so `npm start`, `npm test` and every build (including Vercel previews) work without setup. The anon
  key is browser-safe by design. Variables set in the Vercel dashboard override these.
- `.env.local` (gitignored): put private or optional keys here, e.g. `REACT_APP_STRIPE_PUBLISHABLE_KEY`,
  `REACT_APP_REPLICATE_API_TOKEN`, `REACT_APP_HF_API_KEY`, OAuth client IDs. Run
  `grep -rhoE "process\.env\.[A-Z_0-9]+" src | sort -u` for the full list.
- `src/utils/supabase.js` throws if the Supabase vars are missing, which blanks the whole app.

## Code layout

- `src/App.js`: top-level app, routing and auth state
- `src/components/`: pages and UI (Dashboard, FlyerPro, SocialSpark, LandingPage, editors, modals)
- `src/pages/`: Profile, Settings, admin
- `src/services/`: business logic and Supabase calls (`authService`, `subscriptionService`, ...)
- `src/contexts/`: AuthContext, TemplateContext, ProductContext
- `src/utils/supabase.js`: the Supabase client; `src/utils/stripe.js`: Stripe checkout
- `src/platforms/desktop/`, `src/shared/`: platform split (see `IMPORTANT_PROJECT_STRUCTURE.md`)
- `supabase/migrations/`, `database/`, `*.sql`: database schema and fixes
- `backend/`: optional FastAPI AI microservice (not required to run the frontend)
- `backup*/`: old copies of components; not used by the app

## Constraints

- **Desktop only for now**: don't add mobile/tablet or touch-specific work (see
  `DEVELOPMENT_CONSTRAINTS.md`, `WARP_SESSION_NOTE.md`).
- The many `*_FIX*.md` / `*_SETUP*.md` files at the root are notes from earlier AI sessions;
  they may be out of date.

## Cloud sessions

The cloud container's network policy may block `*.supabase.co` and `js.stripe.com`, so login and
data calls fail in in-container previews. Check real behavior on a Vercel preview deployment
or locally.
