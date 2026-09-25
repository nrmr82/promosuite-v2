// POST /api/delete-account -> { success: true }
// Permanently deletes the signed-in user. Needs SUPABASE_SERVICE_ROLE_KEY as a secret.
// Rows in other tables are removed by ON DELETE CASCADE from auth.users/profiles;
// templates.created_by has no cascade, so the user's own templates are deleted first.
import { json } from '../_lib/http';
import { getUser } from '../_lib/auth';

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return json({ error: 'Not signed in' }, 401);
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Account deletion is not configured' }, 503);

  const adminHeaders = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

  const templatesRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/templates?created_by=eq.${encodeURIComponent(user.id)}`,
    { method: 'DELETE', headers: adminHeaders }
  );
  // 404 means the table doesn't exist in this database, which is fine
  if (!templatesRes.ok && templatesRes.status !== 404) {
    return json({ error: `Could not delete templates: ${await templatesRes.text()}` }, 500);
  }

  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  if (!res.ok) return json({ error: `Could not delete account: ${await res.text()}` }, 500);

  return json({ success: true, message: 'Account permanently deleted' });
}
