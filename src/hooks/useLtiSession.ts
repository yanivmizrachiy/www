import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useLtiSession() {
  const [session, setSession] = useState<any>(null);
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const token = localStorage.getItem('lti_token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch session from teacher_sessions join moodle_sites
        const { data: sessionData, error: sessionError } = await supabase
          .from('teacher_sessions')
          .select('*, moodle_sites(*)')
          .eq('session_token', token)
          .single();

        if (sessionError) {
          if (sessionError.code === 'PGRST116') {
            // Not found
            localStorage.removeItem('lti_token');
          } else {
            throw sessionError;
          }
        }

        if (sessionData) {
          const { moodle_sites, ...rest } = sessionData;
          setSession(rest);
          setSite(moodle_sites);
        }
      } catch (err: any) {
        console.error('Error fetching LTI session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { session, site, loading, error };
}

export function setLtiToken(token: string) {
  localStorage.setItem('lti_token', token);
}

export function getLtiToken(): string | null {
  return localStorage.getItem('lti_token');
}

export function clearLtiToken() {
  localStorage.removeItem('lti_token');
}

export type DomainKey = string;
export type DomainStatus = 'pending' | 'proven' | 'blocked';
export type DomainState = 'idle' | 'checking' | 'active' | 'error';
