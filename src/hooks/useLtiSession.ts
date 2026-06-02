import { useEffect, useState, useCallback } from "react";

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
 *   7. Supabase RPC lti_get_context is a DISABLED fallback — do NOT call it
 *      automatically after a 401, as it does not exist in production and causes
 *      noisy 404 errors. If bootstrap returns 401, treat it as a stale/expired
 *      session and show a clear Hebrew message instead.
 *
 * No teacher accounts. No passwords. The teacher identity and course context come
 * from the real Moodle LTI launch. Student/grade/log data still require real
 * Moodle report import or a future verified Moodle Web Services token.
 */

const STORAGE_KEY = "lti_session_token";

// Sentinel value exposed via useLtiSession().error when /api/bootstrap returns
// 401. This means the server-side tokenSessions map no longer knows this token
// (cold start / deploy / cross-space navigation). The UI should display a clear
// instruction to re-open the tool from inside Moodle.
export const SESSION_EXPIRED_OR_SERVER_RESTARTED =
  "SESSION_EXPIRED_OR_SERVER_RESTARTED";

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
  teacher_display_name: string | null;
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
  settings_write:
    "עריכה מול Moodle חסומה עד Moodle Web Services token מאומת עם הרשאות כתיבה",
};

export function getLtiToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLtiToken(t: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, t);
  } catch { /* ignore */ }
}

export function clearLtiToken() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

// Unified NRPS preview URL. Always appends the current LTI token as ?t=
// so server session resolution (token/query/header/cookie) works the same for
// every caller. Use together with `{ credentials: "include" }` on the fetch.
export function nrpsPreviewUrl(): string {
  const token = getLtiToken();
  return "/api/lti13/nrps-preview" + (token ? "?t=" + encodeURIComponent(token) : "");
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
  // error is set to SESSION_EXPIRED_OR_SERVER_RESTARTED when /api/bootstrap
  // returns 401 with a token present. All other errors use plain strings.
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [domains, setDomains] = useState<Record<DomainKey, DomainState>>(() =>
    buildEmptyDomains()
  );

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

      // ── 401: server no longer knows this token (restart / cold start / stale) ──
      // Do NOT fall through to Supabase RPC: lti_get_context does not exist in
      // production and would only produce a 404 in the console. Instead, clear
      // the dead token and surface a clear Hebrew instruction to the teacher.
      if (nodeRes.status === 401) {
        clearLtiToken();
        setSession(null);
        setSite(null);
        setError(SESSION_EXPIRED_OR_SERVER_RESTARTED);
        setLoading(false);
        return;
      }

      if (nodeRes.ok) {
        const nodePayload = await nodeRes.json();
        if (nodePayload?.ok && nodePayload?.session && nodePayload?.site) {
          setLoading(false);
          applyContext(nodePayload as ContextPayload);
          return;
        }
      }
    } catch {
      // Network error — do not attempt Supabase RPC fallback.
      // Surface a generic error; the teacher should retry from Moodle.
      setSession(null);
      setSite(null);
      setError("NETWORK_ERROR");
      setLoading(false);
      return;
    }

    // Bootstrap responded but payload was malformed — treat as no session.
    setSession(null);
    setSite(null);
    setError(null);
    setLoading(false);
  }, [applyContext]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
