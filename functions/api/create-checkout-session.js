// POST /api/create-checkout-session  { priceId, mode? } -> { url }
// Creates a Stripe Checkout session; the browser redirects to the returned url.
import { json, readJson } from '../_lib/http';
import { getUser } from '../_lib/auth';

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return json({ error: 'Not signed in' }, 401);
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured' }, 503);

  const { priceId, mode = 'subscription' } = await readJson(request);
  if (!priceId) return json({ error: 'Missing priceId' }, 400);
  if (!['subscription', 'payment'].includes(mode)) return json({ error: 'Invalid mode' }, 400);

  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    mode,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    client_reference_id: user.id,
  });
  if (user.email) params.set('customer_email', user.email);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const session = await res.json();
  if (!res.ok) return json({ error: session.error?.message || 'Could not start checkout' }, 502);

  return json({ url: session.url });
}
