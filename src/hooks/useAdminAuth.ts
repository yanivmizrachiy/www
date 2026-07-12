import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// Admin authentication for the private Control Center (/admin-hub).
// Uses Supabase Auth (email magic link) + the DB is_admin() function.
// The service_role key is NEVER used client-side — only the publishable key.
export function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAdmin = useCallback(async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      return;
    }
    try {
      // is_admin() reads admin_users for auth.uid(); cast avoids needing the
      // generated types to include the new function.
      const { data, error: rpcError } = await (supabase as any).rpc('is_admin');
      if (rpcError) throw rpcError;
      setIsAdmin(data === true);
    } catch (err: any) {
      setIsAdmin(false);
      setError(err?.message ?? 'admin check failed');
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user ?? null;
        if (!active) return;
        setUser(u);
        await checkAdmin(u);
      } catch (err: any) {
        if (active) setError(err?.message ?? 'session error');
      } finally {
        if (active) setLoading(false);
      }
    }
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(true);
      await checkAdmin(u);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signInWithEmail = useCallback(async (email: string): Promise<boolean> => {
    setError(null);
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/admin-hub` : undefined;
    const { error: signErr } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (signErr) {
      setError(signErr.message);
      return false;
    }
    return true;
  }, []);

  // Password sign-in — primary path. The admin user was created in the Supabase
  // dashboard with a password; magic-link email is unreliable on the free tier.
  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setError(null);
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        setError(
          signErr.message === 'Invalid login credentials'
            ? 'אימייל או סיסמה שגויים'
            : signErr.message
        );
        return false;
      }
      return true;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  return { loading, user, isAdmin, error, signInWithEmail, signInWithPassword, signOut };
}
