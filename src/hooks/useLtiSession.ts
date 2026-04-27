import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * LTI-only session model. We do NOT use Supabase Auth at all.
 *
 * Flow:
 *   1. Teacher clicks the External Tool inside Moodle.
 *   2. Moodle POSTs to our /lti-launch edge function.
 *   3. That function verifies OAuth, mints a session_token, and 302s the
 *      browser to /#/lti?t=<token>.
 *   4. The /lti route stores the token in sessionStorage and redirects to /.
 *   5. From then on, this hook reads sessionStorage and calls
 *      public.lti_get_context(<token>) to get site + session + probes.
 *
 * No teacher accounts. No passwords. The teacher's identity is whatever
 * Moodle (i.e. משרד החינוך) already verified.
 */

const STORAGE_KEY = "lti_session_token";

export type DomainKey =
  | "students" | "tasks" | "chapters" | "grades" | "activity"
  | "time_accumulated" | "reports" | "export_data" | "settings_write";

export type DomainStatus = "proven" | "missing" | "blocked";

export interface DomainState {
  status: DomainStatus;
  label: string;
  reason: string;
  ws_function_tested: string | null;
  probed_at: string | null;
}

export interface SiteInfo {
  id: string;
  site_url: string;
  site_name: string | null;
  consumer_guid: string | null;
  lti_configured: boolean;
  ws_configured: boolean;
  ws_token_status: string;
  last_probed_at: string | null;
}

export interface SessionInfo {
  id: string;
  course_id: number;
  course_title: string | null;
  moodle_username: string | null;
  moodle_user_id: number | null;
  role: string | null;
  launched_at: string;
  expires_at: string;
}

const DOMAIN_LABELS: Record<DomainKey, string> = {
  students: "תלמידים",
  tasks: "משימות",
  chapters: "פרקים",
  grades: "ציונים",
  activity: "פעילות",
  time_accumulated: "זמן תרגול מצטבר",
  reports: "דוחות",
  export_data: "ייצוא",
  settings_write: "עריכת הגדרות",
};

const DEFAULT_REASON: Record<DomainKey, string> = {
  students: "טרם בוצע probe — חבר WS token והרץ בדיקה",
  tasks: "טרם בוצע probe",
  chapters: "טרם בוצע probe",
  grades: "טרם בוצע probe",
  activity: "טרם בוצע probe",
  time_accumulated: "ייגזר מלוגים אמיתיים אם report_log_get_log_records נגיש",
  reports: "ייפתח כשדומיין כלשהו יהיה מחובר",
  export_data: "אין נתוני אמת לייצוא",
  settings_write: "נדרש editingteacher + core_course_update_courses",
};

export function getLtiToken(): string | null {
  try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function setLtiToken(t: string) {
  try { sessionStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
}

export function clearLtiToken() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

interface ContextPayload {
  session: SessionInfo;
  site: SiteInfo;
  probes: Array<{
    domain: DomainKey;
    status: DomainStatus;
    reason: string;
    ws_function_tested: string | null;
    probed_at: string | null;
  }>;
}

export function useLtiSession() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [domains, setDomains] = useState<Record<DomainKey, DomainState>>(() => buildEmptyDomains());

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) {
      setLoading(false);
      setSession(null);
      setSite(null);
      setError(null);
      return;
    }
    setLoading(true);
    const { data, error: rpcErr } = await (supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>)("lti_get_context", { _token: token });
    setLoading(false);
    if (rpcErr) { setError(rpcErr.message); return; }

    const payload = data as { error?: string } | ContextPayload;
    if (!payload || (payload as { error?: string }).error) {
      setError((payload as { error?: string })?.error ?? "unknown");
      clearLtiToken();
      setSession(null); setSite(null);
      return;
    }
    const ctx = payload as ContextPayload;
    setError(null);
    setSession(ctx.session);
    setSite(ctx.site);
    const next = buildEmptyDomains();
    for (const p of ctx.probes ?? []) {
      if (!(p.domain in next)) continue;
      next[p.domain] = {
        status: p.status,
        label: DOMAIN_LABELS[p.domain],
        reason: p.reason,
        ws_function_tested: p.ws_function_tested,
        probed_at: p.probed_at,
      };
    }
    setDomains(next);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    loading,
    error,
    hasSession: !!session,
    token: getLtiToken(),
    session,
    site,
    domains,
    refresh,
  };
}

function buildEmptyDomains(): Record<DomainKey, DomainState> {
  const out = {} as Record<DomainKey, DomainState>;
  (Object.keys(DOMAIN_LABELS) as DomainKey[]).forEach((k) => {
    out[k] = {
      status: "missing",
      label: DOMAIN_LABELS[k],
      reason: DEFAULT_REASON[k],
      ws_function_tested: null,
      probed_at: null,
    };
  });
  return out;
}
