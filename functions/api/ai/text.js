// POST /api/ai/text  { prompt, system?, maxTokens? } -> { text }
// Runs an open model on Cloudflare Workers AI (free daily allowance).
import { json, readJson } from '../../_lib/http';
import { getUser } from '../../_lib/auth';

const MODEL = '@cf/meta/llama-3.1-8b-instruct';
const MAX_PROMPT_CHARS = 4000;

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return json({ error: 'Not signed in' }, 401);

  const { prompt, system, maxTokens = 500 } = await readJson(request);
  if (!prompt || typeof prompt !== 'string') return json({ error: 'Missing prompt' }, 400);
  if (prompt.length > MAX_PROMPT_CHARS) return json({ error: 'Prompt too long' }, 400);

  const messages = [
    {
      role: 'system',
      content: system || 'You are a real estate marketing copywriter. Write clear, persuasive, accurate copy.',
    },
    { role: 'user', content: prompt },
  ];

  try {
    const result = await env.AI.run(MODEL, {
      messages,
      max_tokens: Math.min(Number(maxTokens) || 500, 1024),
    });
    return json({ text: result.response || '' });
  } catch (error) {
    return json({ error: `AI text generation failed: ${error.message}` }, 502);
  }
}
