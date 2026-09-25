# Hosting on Cloudflare Pages (free)

PromoSuite runs on Cloudflare Pages. The free plan allows commercial use, and it
hosts both the React app and the server functions in `functions/`:

| Endpoint | What it does | Needs |
|---|---|---|
| `POST /api/ai/text` | AI copywriting (Llama 3.1 8B on Workers AI) | Workers AI binding `AI` (from `wrangler.toml`) |
| `POST /api/ai/image` | AI images (FLUX.1 schnell on Workers AI) | Workers AI binding `AI` |
| `POST /api/create-checkout-session` | Stripe Checkout | Secret `STRIPE_SECRET_KEY` |
| `POST /api/delete-account` | Permanent account deletion | Secret `SUPABASE_SERVICE_ROLE_KEY` |

All endpoints require a signed-in Supabase user. Workers AI's free allowance is
10,000 "neurons" per day (roughly 230 images or 1,300 text replies); past that,
requests fail until the next day instead of billing you.

## One-time setup

1. **Create a free account** at <https://dash.cloudflare.com/sign-up>.
2. **Create the Pages project:** Workers & Pages → Create → Pages → *Connect to Git* →
   pick `nrmr82/promosuite-v2`.
   - Production branch: `master`
   - Framework preset: *Create React App* (build command `npm run build`, output `build`)
   - Environment variable: `NODE_VERSION` = `22`
3. **Add secrets:** project → Settings → Variables and Secrets → Add, type *Secret*:
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase dashboard → Project Settings → API Keys → `service_role`
   - `STRIPE_SECRET_KEY` (only when you turn on payments)

   The Workers AI binding and the public Supabase values come from `wrangler.toml`,
   so there's nothing to add for those.
4. **Tell Supabase about the new address:** Supabase → Authentication → URL Configuration
   - Site URL: `https://promosuite-v2.pages.dev` (or your custom domain)
   - Redirect URLs: `https://promosuite-v2.pages.dev/**`, `https://*.promosuite-v2.pages.dev/**`
     (preview deployments), `http://localhost:3000/**`
5. **Analytics (optional):** project → Metrics → enable *Web Analytics*.
6. **Retire Vercel** once the Pages site works: delete the Vercel project and
   `vercel.json`.

Every push then deploys automatically: `master` goes to production, and every other
branch gets its own preview URL.

## Payments (when you're ready)

Create products and prices in Stripe, then add these as Pages *build* environment
variables (they're public price IDs, not secrets): `REACT_APP_STRIPE_STARTER_MONTHLY_PRICE_ID`,
`REACT_APP_STRIPE_STARTER_YEARLY_PRICE_ID`, `REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID`,
`REACT_APP_STRIPE_PRO_YEARLY_PRICE_ID`, `REACT_APP_STRIPE_CREDITS_500_PRICE_ID`,
`REACT_APP_STRIPE_CREDITS_1500_PRICE_ID`, `REACT_APP_STRIPE_CREDITS_5000_PRICE_ID`.

## Local development

```bash
npx wrangler login          # once; the AI binding runs on Cloudflare even locally
npm run pages:dev           # build + serve app and functions on http://localhost:8788
```

For hot reload while editing React code, run `npm run functions:dev` (serves the last
build's functions on :8788) in one terminal and `npm start` in another;
`src/setupProxy.js` forwards `/api` from :3000 to :8788. Local secrets go in
`.dev.vars` (gitignored), for example `SUPABASE_SERVICE_ROLE_KEY=...`.
