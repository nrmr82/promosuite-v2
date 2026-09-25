import { supabase, getAccessToken } from './supabase';

const origin = () => window.location.origin;

// Supabase messages are technical; map the common ones to plain language
function friendly(error) {
  const msg = error?.message || '';
  if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password.';
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first. Check your inbox for the link.';
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (/password should be at least/i.test(msg)) return 'Password must be at least 8 characters.';
  if (/failed to fetch|network/i.test(msg)) return 'Can’t reach the server. Check your connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendly(error));
  return data;
}

export async function signUpWithEmail({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin()}/auth/callback`,
    },
  });
  if (error) throw new Error(friendly(error));
  // With email confirmation on, Supabase doesn't error on an existing email;
  // it returns a user with no identities instead
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Try signing in instead.');
  }
  return { needsConfirmation: !data.session, session: data.session };
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin()}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw new Error(friendly(error));
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin()}/reset-password`,
  });
  if (error) throw new Error(friendly(error));
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(friendly(error));
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function deleteAccount() {
  const token = await getAccessToken();
  const res = await fetch('/api/delete-account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Could not delete your account.');
  await supabase.auth.signOut();
}

export const PROFILE_FIELDS = 'id, email, full_name, avatar_url, phone, website, license_number, brokerage_name';

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select(PROFILE_FIELDS).eq('id', userId).maybeSingle();
  if (error) throw new Error(friendly(error));
  return data;
}

export async function saveProfile(user, updates) {
  // Upsert so it also works for accounts created before the profiles trigger existed
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email, ...updates, updated_at: new Date().toISOString() })
    .select(PROFILE_FIELDS)
    .single();
  if (error) throw new Error(friendly(error));
  return data;
}
