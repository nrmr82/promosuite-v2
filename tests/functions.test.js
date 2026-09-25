// @vitest-environment node
// Cloudflare Pages Functions, run with mocked Supabase, Stripe and Workers AI.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost as aiText } from '../functions/api/ai/text';
import { onRequestPost as aiImage } from '../functions/api/ai/image';
import { onRequestPost as checkout } from '../functions/api/create-checkout-session';
import { onRequestPost as deleteAccount } from '../functions/api/delete-account';

const USER = { id: 'user-1', email: 'agent@example.com' };

function makeEnv(overrides = {}) {
  return {
    SUPABASE_URL: 'https://proj.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    STRIPE_SECRET_KEY: 'sk_test',
    AI: {
      run: vi.fn(async (model) => (model.includes('flux') ? { image: 'QUJD' } : { response: 'Lovely home' })),
    },
    ...overrides,
  };
}

function post(path, body, token = 'good') {
  return new Request(`https://app.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body ?? {}),
  });
}

let calls;
beforeEach(() => {
  calls = [];
  vi.stubGlobal('fetch', vi.fn(async (url, init = {}) => {
    const u = String(url);
    calls.push({ url: u, init });
    if (u.endsWith('/auth/v1/user')) {
      return init.headers.Authorization === 'Bearer good'
        ? Response.json(USER)
        : new Response('invalid', { status: 401 });
    }
    if (u.includes('api.stripe.com')) return Response.json({ url: 'https://checkout.stripe.com/c/1' });
    if (u.includes('/rest/v1/templates')) return new Response(null, { status: 204 });
    if (u.includes('/auth/v1/admin/users/')) return Response.json({});
    return new Response('unexpected', { status: 500 });
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe('auth guard', () => {
  it.each([
    ['no token', null],
    ['bad token', 'bad'],
  ])('rejects %s on every endpoint', async (_, token) => {
    for (const [fn, path] of [[aiText, '/api/ai/text'], [aiImage, '/api/ai/image'], [checkout, '/api/create-checkout-session'], [deleteAccount, '/api/delete-account']]) {
      const res = await fn({ request: post(path, { prompt: 'x', priceId: 'p' }, token), env: makeEnv() });
      expect(res.status).toBe(401);
    }
  });
});

describe('/api/ai/text', () => {
  it('returns generated text from Llama', async () => {
    const env = makeEnv();
    const res = await aiText({ request: post('/api/ai/text', { prompt: 'Describe a 3 bed home' }), env });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ text: 'Lovely home' });
    expect(env.AI.run.mock.calls[0][0]).toBe('@cf/meta/llama-3.1-8b-instruct');
  });

  it('validates the prompt', async () => {
    expect((await aiText({ request: post('/api/ai/text', {}), env: makeEnv() })).status).toBe(400);
    const long = 'x'.repeat(4001);
    expect((await aiText({ request: post('/api/ai/text', { prompt: long }), env: makeEnv() })).status).toBe(400);
  });
});

describe('/api/ai/image', () => {
  it('returns a data URL and caps steps at 8', async () => {
    const env = makeEnv();
    const res = await aiImage({ request: post('/api/ai/image', { prompt: 'modern house', steps: 50 }), env });
    expect(await res.json()).toEqual({ image: 'data:image/jpeg;base64,QUJD' });
    expect(env.AI.run.mock.calls[0][1].steps).toBe(8);
  });
});

describe('/api/create-checkout-session', () => {
  it('creates a Stripe session for the signed-in user', async () => {
    const res = await checkout({ request: post('/api/create-checkout-session', { priceId: 'price_1' }), env: makeEnv() });
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/c/1' });
    const body = new URLSearchParams(calls.find((c) => c.url.includes('stripe')).init.body);
    expect(body.get('client_reference_id')).toBe('user-1');
    expect(body.get('mode')).toBe('subscription');
  });

  it('rejects unknown modes and missing configuration', async () => {
    expect((await checkout({ request: post('/api/create-checkout-session', { priceId: 'p', mode: 'x' }), env: makeEnv() })).status).toBe(400);
    expect((await checkout({ request: post('/api/create-checkout-session', { priceId: 'p' }), env: makeEnv({ STRIPE_SECRET_KEY: '' }) })).status).toBe(503);
  });
});

describe('/api/delete-account', () => {
  it('deletes templates before the auth user', async () => {
    const res = await deleteAccount({ request: post('/api/delete-account'), env: makeEnv() });
    expect(res.status).toBe(200);
    const order = calls.map((c) => c.url).filter((u) => !u.endsWith('/auth/v1/user'));
    expect(order[0]).toContain('/rest/v1/templates?created_by=eq.user-1');
    expect(order[1]).toContain('/auth/v1/admin/users/user-1');
  });
});
