# PromoSuite

Marketing studio for real estate agents: listing flyers and graphics from ready-made templates,
a photo editor, and (on the roadmap) brand kits, listings, AI copy, listing pages, a social
planner and video reels.

- **App:** React 18 + Vite, Tailwind CSS 4, shadcn/ui-style components (Radix), React Router
- **Editors:** Fabric.js (MIT)
- **Backend:** Supabase (auth, Postgres, storage) and Cloudflare Pages Functions in `functions/`
  (Workers AI, Stripe Checkout, account deletion)
- **Hosting:** Cloudflare Pages (free tier, commercial use allowed)

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest
npm run lint         # ESLint
npm run build        # production build into build/
```

`npm run dev` works on its own for everything except `/api` (AI, checkout, account deletion).
To run those locally, `npx wrangler login` once, then `npm run functions:dev` in a second
terminal; Vite forwards `/api` to it.

## Set up

- Hosting, secrets and Supabase redirect URLs: [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)
- Database: run the scripts in `supabase/migrations/` in the Supabase SQL editor
  (older scripts are kept in `supabase/archive/` for reference only)
