// POST /api/ai/image  { prompt, steps? } -> { image: "data:image/jpeg;base64,..." }
// Runs FLUX.1 [schnell] on Cloudflare Workers AI (free daily allowance).
import { json, readJson } from '../../_lib/http';
import { getUser } from '../../_lib/auth';

const MODEL = '@cf/black-forest-labs/flux-1-schnell';
const MAX_PROMPT_CHARS = 2000;

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return json({ error: 'Not signed in' }, 401);

  const { prompt, steps = 4 } = await readJson(request);
  if (!prompt || typeof prompt !== 'string') return json({ error: 'Missing prompt' }, 400);
  if (prompt.length > MAX_PROMPT_CHARS) return json({ error: 'Prompt too long' }, 400);

  try {
    const result = await env.AI.run(MODEL, {
      prompt,
      steps: Math.min(Math.max(Number(steps) || 4, 1), 8),
    });
    return json({ image: `data:image/jpeg;base64,${result.image}` });
  } catch (error) {
    return json({ error: `AI image generation failed: ${error.message}` }, 502);
  }
}
