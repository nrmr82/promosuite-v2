import { supabase } from './supabase';

/**
 * Start Stripe Checkout: the server (functions/api/create-checkout-session.js)
 * creates the session with the secret key and returns its hosted URL.
 * @param {string} priceId - Stripe price ID
 * @param {'subscription'|'payment'} mode - 'payment' for one-time purchases like credit packs
 */
export const handleSubscription = async (priceId, mode = 'subscription') => {
  if (!priceId) throw new Error('This plan is not available for purchase yet');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in to continue');

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ priceId, mode }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url) {
    throw new Error(result.error || 'Could not start checkout');
  }

  window.location.assign(result.url);
};
