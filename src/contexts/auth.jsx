import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      setProfile(await fetchProfile(user.id));
    } catch (error) {
      // The app still works without a profile row; Settings can create the details later
      console.warn('Could not load profile:', error.message);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      loadProfile(data.session?.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Defer so we don't call Supabase from inside its own auth callback
        setTimeout(() => loadProfile(next?.user), 0);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const user = session?.user ?? null;
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';

  const value = {
    session,
    user,
    profile,
    setProfile,
    displayName,
    avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
    loading,
    recovery,
    clearRecovery: () => setRecovery(false),
    refreshProfile: () => loadProfile(user),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
