import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * LTI-only session model. We do NOT use Supabase Auth for teacher login.
 *
 * Current active flow:
 *   1. Teacher clicks the External Tool inside Moodle.
 *   2. Moodle POSTs directly to the permanent Render endpoint /api/lti/launch.
 *   3. The Node runtime verifies OAuth1 HMAC-SHA1 and creates a session token.
 *   4. The server redirects to /lti?t=<token>.
 *   5. The /lti route stores the token in sessionStorage and redirects to /.
 *   6. This hook first calls /api/bootstrap?t=<token> on Render.
 *   7. Supabase RPC lti_get_context is a fallback only, not the active launch path.
 *
 * No teacher accounts. No passwords. The teacher identity and course context come
 * from the real Moodle LTI launch. Student/grade/log data still require real
 * Moodle report import or a future verified Moodle Web Services token.
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
  students: "טרם יובא דוח Participants / Students אמיתי ממודל",
  tasks: "טרם יובא דוח משימות או השלמת פעילות אמיתי ממודל",
  chapters: "טרם יובא מבנה קורס/פעילויות אמיתי ממודל",
  grades: "טרם יובא דוח Gradebook אמיתי ממודל",
  activity: "טרם יובא דוח Logs אמיתי ממודל",
  time_accumulated: "לא ניתן לחשב ללא לוגים אמיתיים ממודל",
  reports: "ייפתח לאחר ייבוא נתוני אמת",
  export_data: "אין נתוני אמת לייצוא",
  settings_write: "עריכה מול Moodle חסומה עד Moodle Web Services token מאומת עם הרשאות כתיבה",
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

  const applyContext = useCallback((ctx: ContextPayload) => {
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

    try {
      const nodeRes = await fetch(`/api/bootstrap?t=${encodeURIComponent(token)}`, {
        credentials: "include",
      });
      if (nodeRes.ok) {
        const nodePayload = await nodeRes.json();
        if (nodePayload?.ok && nodePayload?.session && nodePayload?.site) {
          setLoading(false);
          applyContext(nodePayload as ContextPayload);
          return;
        }
      }
    } catch {
      // Fall through to Supabase RPC fallback.
    }

    const { data, error: rpcErr } = await (supabase.rpc)("lti_get_context", { _token: token });
    setLoading(false);
    if (rpcErr) { setError(rpcErr.message); return; }

    const payload = data as ({ error?: string } & ContextPayload) | null;
    if (!payload || payload.error) {
      setError(payload?.error ?? "unknown");
      clearLtiToken();
      setSession(null); setSite(null);
      return;
    }
    applyContext(payload);
  }, [applyContext]);

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
