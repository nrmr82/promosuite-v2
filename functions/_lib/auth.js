// Resolves the Supabase user from the request's "Authorization: Bearer <access token>" header.
// Returns null when the token is missing or invalid.
export async function getUser(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return null;

  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: header,
    },
  });
  if (!res.ok) return null;

  const user = await res.json();
  return user && user.id ? { ...user, accessToken: header.slice(7) } : null;
}
