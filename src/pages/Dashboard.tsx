import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useImportsOverview } from "@/hooks/useImports";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { useLtiSession, getLtiToken, nrpsPreviewUrl } from "@/hooks/useLtiSession";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, ClipboardList, Database, Calendar, Import, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { formatTeacherDateDmyShort, formatTeacherDateTime } from "@/lib/teacherDateFormat";

// MTH_PREMIUM_DASHBOARD_TEACHER_COUNTS_V1
// Small, self-contained NRPS teacher card on the dashboard hero. Shows teacher
// count + names ONLY when NRPS returns a real Instructor source. Never invents.

// MTH_RESILIENCE_AUTO_SYNC_V1
// Tracks the dashboard auto-sync status so a silent failure (401, network) no
// longer hides behind .catch(() => {}). The dashboard shows a discreet banner
// with a retry button + a link to manual import if auto-sync fails. Pure
// presentation - the underlying truth/capability logic is unchanged.
type AutoSyncStatus = "idle" | "syncing" | "success" | "auth-failed" | "network-failed" | "empty";

function useAutoSyncStatus(onSuccess?: () => void) {
  const [status, setStatus] = useState<AutoSyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus("syncing");
    setLastError(null);
    (async () => {
      try {
        const previewRes = await fetch(nrpsPreviewUrl(), { headers: { Accept: "application/json" }, credentials: "include" });
        const previewJson = await previewRes.json().catch(() => null);
        if (!alive) return;
        if (!previewRes.ok) {
          const reason = previewJson?.error ? ` (${previewJson.error})` : "";
          if (previewRes.status === 401 || previewRes.status === 403) setStatus("auth-failed");
          else setStatus("network-failed");
          setLastError(`NRPS לא זמין במרחב הזה${reason}. אם הכלי הוגדר כ-LTI 1.0/1.1 בלבד, Moodle לא שולח רשימת תלמידים אוטומטית. יש להשתמש בייבוא Participants או להתקין כלי LTI 1.3 עם NRPS.`);
          return;
        }
        const named = Array.isArray(previewJson?.members_named) ? previewJson.members_named : [];
        if (!named.length) { setStatus("empty"); setLastError("NRPS זמין אך לא התקבלו שמות משתתפים ממודל."); return; }
        // Server-owned sync (MTH_NRPS_SERVER_OWNED_SYNC_V1): POST token only. The
        // server re-fetches the NRPS roster itself and persists only learners, so
        // the client roster is no longer authoritative. The preview above is used
        // solely to drive truthful UI states (auth/empty/network).
        const ltiToken = getLtiToken();
        const syncRes = await fetch("/api/imports/nrps-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(ltiToken ? { token: ltiToken } : {}),
        });
        if (!alive) return;
        if (syncRes.ok) {
          setStatus("success");
          // CRITICAL: refresh the overview counts now that the roster is saved.
          // Without this, the dashboard's student count was fetched once on mount
          // (before the sync finished) and stayed at 0 until a manual refresh -
          // the "59 -> 0" race condition. Refreshing on success fixes it.
          onSuccess?.();
        } else if (syncRes.status === 401 || syncRes.status === 403) {
          setStatus("auth-failed");
          setLastError(`קוד ${syncRes.status} — האימות אל מודל לא הצליח. נסה לפתוח את הכלי שוב מתוך מודל, או השתמש בייבוא ידני.`);
        } else {
          setStatus("network-failed");
          setLastError(`קוד ${syncRes.status} — שמירת רשימת התלמידים נכשלה.`);
        }
      } catch (e) {
        if (!alive) return;
        setStatus("network-failed");
        setLastError(e instanceof Error ? e.message : "תקלת רשת במהלך הסנכרון.");
      }
    })();
    return () => { alive = false; };
    // onSuccess intentionally omitted from deps: it's a stable refresh callback
    // and we only want this effect to run on mount + explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryNonce]);

  return { status, lastError, retry: () => setRetryNonce(n => n + 1) };
}

// MTH_AUTO_SYNC_BANNER_V1
// A discreet banner that appears only when auto-sync failed. Never invents data:
// just tells the truth and offers a retry + manual import path.
function AutoSyncBanner({ status, lastError, onRetry }: { status: AutoSyncStatus; lastError: string | null; onRetry: () => void }) {
  if (status !== "auth-failed" && status !== "network-failed") return null;
  const isAuth = status === "auth-failed";
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${isAuth ? "border-amber-300 bg-amber-50 text-amber-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-bold">{isAuth ? "סנכרון אוטומטי לא הצליח" : "תקלה בסנכרון רשימת התלמידים"}</div>
          {lastError && <div className="mt-0.5 text-xs">{lastError}</div>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full border border-current bg-white px-3 py-1.5 text-xs font-bold transition hover:bg-current/10">
          <RefreshCw className="h-3.5 w-3.5" />נסה שוב
        </button>
        <Link to="/smart-import" className="inline-flex items-center gap-1.5 rounded-full bg-current px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90">
          ייבוא ידני
        </Link>
      </div>
    </div>
  );
}

// MTH_HONEST_SOURCE_STATUS_V1
// Reads the live capability detector so the dashboard can tell the teacher,
// truthfully, which data is automatic now vs which needs a Moodle report import.
type SourceStatus = "available" | "unavailable" | "unknown" | "missing" | "partial" | "configured";
function useSourceStatus() {
  const [map, setMap] = useState<Record<string, SourceStatus> | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/capabilities/status", { headers: { Accept: "application/json" }, credentials: "include" });
        const json = await res.json().catch(() => null);
        if (!alive) return;
        // The endpoint returns individual *_status fields and a capability map.
        const m: Record<string, SourceStatus> = {
          nrps: json?.nrps_status ?? json?.capabilities?.nrps ?? "unknown",
          ags: json?.ags_status ?? json?.capabilities?.ags ?? "unknown",
          gradebook: json?.gradebook_status ?? json?.capabilities?.gradebook ?? "missing",
          logs: json?.logs_status ?? json?.capabilities?.logs ?? "missing",
          moodle_ws: json?.moodle_ws_status ?? json?.capabilities?.moodle_ws ?? "missing",
        };
        setMap(m);
      } catch {
        if (alive) setMap(null);
      }
    })();
    return () => { alive = false; };
  }, []);
  return map;
}
// MTH_DASHBOARD_NRPS_BREAKDOWN_V1
// Reads the live NRPS data for the dashboard header. Combines two safe sources:
//   1. /api/lti13/participants-breakdown — the authoritative, privacy-stripped
//      aggregate counts (total / learners / instructors) + live course title +
//      update time. Returns no names by design.
//   2. /api/lti13/nrps-preview — used for the real instructor *names* and as a
//      fallback for the counts when the breakdown endpoint is unavailable.
// Both carry ?t=<token> + credentials so the server resolves the current LTI 1.3
// session. Exposes ONLY counts/names/title that NRPS actually returned - never
// invents totals or names.
function breakdownUrl(): string {
  const token = getLtiToken();
  return "/api/lti13/participants-breakdown" + (token ? "?t=" + encodeURIComponent(token) : "");
}
function useDashboardTeachers() {
  const [count, setCount] = useState(0);
  const [names, setNames] = useState<string[]>([]);
  const [participants, setParticipants] = useState<number | null>(null);
  const [learners, setLearners] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [hasLiveNrps, setHasLiveNrps] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [previewRes, breakdownRes] = await Promise.all([
          fetch(nrpsPreviewUrl(), { headers: { Accept: "application/json" }, credentials: "include" }),
          fetch(breakdownUrl(), { headers: { Accept: "application/json" }, credentials: "include" }),
        ]);
        const json = await previewRes.json().catch(() => null);
        const bd = await breakdownRes.json().catch(() => null);
        if (!alive) return;

        const previewLive = Boolean(json?.ok);
        const breakdownLive = Boolean(bd?.ok);
        const live = previewLive || breakdownLive;
        setHasLiveNrps(live);

        // Instructor names only come from the preview (breakdown returns none).
        const named = Array.isArray(json?.members_named) ? json.members_named : [];
        const realNames: string[] = named
          .filter((m: { is_instructor?: boolean; role_kind?: string }) =>
            m?.role_kind ? m.role_kind === "instructor" : m?.is_instructor)
          .map((m: { name?: string }) => String(m?.name || "").trim())
          .filter(Boolean);

        // Counts: prefer the authoritative breakdown aggregates, fall back to the
        // preview role_counts, then to the resolved instructor name count.
        const bdInstructors = breakdownLive ? Number(bd?.instructors_count || 0) : 0;
        const bdLearners = breakdownLive ? Number(bd?.learners_count || 0) : 0;
        const bdTotal = breakdownLive ? Number(bd?.total_members || 0) : 0;
        const previewInstructors = Number(json?.role_counts?.Instructor || 0);
        const previewLearners = Number(json?.role_counts?.Learner || 0);
        const previewTotal = Number(json?.members_count || 0);

        const instructors = bdInstructors || previewInstructors || realNames.length;
        const learnerCount = bdLearners || previewLearners;
        const total = bdTotal || previewTotal;

        setCount(instructors);
        setNames(Array.from(new Set(realNames)));
        setParticipants(live && total > 0 ? total : null);
        setLearners(live && learnerCount > 0 ? learnerCount : null);
        const bdUpdated = breakdownLive && typeof bd?.updated_at === "string" ? bd.updated_at : null;
        const previewUpdated = previewLive && typeof json?.now === "string" ? json.now : null;
        setUpdatedAt(bdUpdated || previewUpdated);
        // Live-confirmed space name straight from the current LTI 1.3 launch context.
        const bdTitle = breakdownLive ? String(bd?.course_title || "").trim() : "";
        setCourseTitle(bdTitle || null);
        setState("ready");
        // Auto-sync of the learner roster is owned by useAutoSyncStatus (above)
        // so failures surface to the teacher via AutoSyncBanner instead of being
        // silently swallowed. This hook stays focused on the teacher header.
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
  }, []);

  return { count, names, participants, learners, updatedAt, courseTitle, hasLiveNrps, state };
}


// MTH_SAFE_TEACHER_DISPLAY_V1
// Never show numeric Moodle identifiers / Teudat Zehut as the teacher visible name.
function normalizeTeacherCandidate(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isSafeHumanDisplayName(value: unknown) {
  const text = normalizeTeacherCandidate(value);
  if (!text) return false;
  if (/שם מורה לא התקבל/i.test(text)) return false;
  if (!/[A-Za-z\u0590-\u05FF]/.test(text)) return false;
  const letters = (text.match(/[A-Za-z\u0590-\u05FF]/g) || []).length;
  const digits = (text.match(/\d/g) || []).length;
  if (digits >= Math.max(1, letters)) return false;
  if (/^\d{5,}$/.test(text.replace(/\D/g, ""))) return false;
  return true;
}

function safeTeacherDisplayName(
  session: { teacher_display_name?: string | null; moodle_username?: string | null } | null,
  nrpsNames: string[]
) {
  const candidates = [
    session?.teacher_display_name,
    ...(Array.isArray(nrpsNames) ? nrpsNames : []),
    session?.moodle_username,
  ];

  for (const candidate of candidates) {
    const text = normalizeTeacherCandidate(candidate);
    if (isSafeHumanDisplayName(text)) return text;
  }

  return "";
}

function SourceRow({ label, hint, status }: { label: string; hint: string; status: SourceStatus }) {
  const isAuto = status === "available" || status === "configured";
  const isPartial = status === "partial";
  const tone = isAuto ? "text-green-700 bg-green-50 border-green-200"
    : isPartial ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-slate-600 bg-slate-50 border-slate-200";
  const badge = isAuto ? "אוטומטי" : isPartial ? "חלקי" : status === "unknown" ? "ממתין ל-Moodle" : "דרוש ייבוא";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4">
      <div className="min-w-0">
        <div className="font-bold">{label}</div>
        <div className="truncate text-xs text-muted-foreground">{hint}</div>
      </div>
      <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${tone}`}>{badge}</span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, delay = 0 }: { label: string, value: number | string, icon: any, delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="shadow-elegant border-none bg-background/50 backdrop-blur-sm group hover:bg-muted/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"><Icon className="h-5 w-5" /></div>
            <div className="text-2xl font-bold font-mono">{value ?? "—"}</div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// MTH_NEXT_BEST_ACTION_V1
// Smart guidance for the teacher: based on what data is already loaded and
// what is available from Moodle, tell the teacher the single most useful next
// step. Pure decision logic over the existing /api/imports/overview counts and
// /api/capabilities/status statuses - never invents work that hasn't happened.
type NextAction = {
  tone: "success" | "info" | "action";
  title: string;
  description: string;
  cta?: { label: string; to: string };
};
function computeNextAction(
  data: { students_count: number; grades_count: number; grade_items_count?: number; chapters_count: number; tasks_count: number; log_events_count: number } | null,
  sourceStatus: Record<string, string> | null
): NextAction | null {
  if (!data) return null;
  const hasStudents = data.students_count > 0;
  const hasGrades = data.grades_count > 0 || (data.grade_items_count ?? 0) > 0;
  const hasChapters = data.chapters_count > 0 || data.tasks_count > 0;
  const hasLogs = data.log_events_count > 0;
  const agsAvailable = sourceStatus?.ags === "available";

  if (!hasStudents) {
    return { tone: "info", title: "פתח את הכלי מתוך Moodle", description: "הכלי טוען את רשימת התלמידים אוטומטית כשנפתח מהמרחב במודל." };
  }
  if (!hasGrades) {
    if (agsAvailable) {
      return { tone: "info", title: "הציונים בדרך", description: "מודל מספק את הציונים אוטומטית. רענן את העמוד בעוד מספר שניות." };
    }
    return {
      tone: "action",
      title: "ייבא את גליון הציונים מ-Moodle",
      description: "כדי לראות ציונים, הורד את ה-Gradebook מהמרחב במודל ופתח כאן.",
      cta: { label: "פתח ייבוא חכם", to: "/smart-import" },
    };
  }
  if (!hasChapters) {
    return {
      tone: "action",
      title: "ייבא את מבנה הקורס",
      description: "כדי לראות פרקים ומשימות, ייבא את מבנה הקורס מ-Moodle.",
      cta: { label: "פתח ייבוא חכם", to: "/smart-import" },
    };
  }
  if (!hasLogs) {
    return {
      tone: "action",
      title: "ייבא לוגי פעילות",
      description: "כדי לראות זמני פעילות והשלמות, ייבא את דוח הלוגים מ-Moodle.",
      cta: { label: "פתח ייבוא חכם", to: "/smart-import" },
    };
  }
  return {
    tone: "success",
    title: "המידע מוכן",
    description: "כל המקורות מסונכרנים. אפשר ליצור דוחות, לראות פעילות, ולעקוב אחרי תלמידים.",
    cta: { label: "פתח דוחות", to: "/reports" },
  };
}

function NextBestActionPanel({ action }: { action: NextAction | null }) {
  if (!action) return null;
  const tone =
    action.tone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : action.tone === "action" ? "border-sky-300 bg-sky-50 text-sky-900"
    : "border-slate-300 bg-slate-50 text-slate-800";
  const ctaTone =
    action.tone === "success" ? "bg-emerald-700 hover:bg-emerald-800"
    : "bg-sky-700 hover:bg-sky-800";
  return (
    <section className={`flex flex-col gap-3 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between ${tone}`} aria-label="הצעד הבא">
      <div className="min-w-0">
        <div className="text-xs font-bold opacity-70">הצעד הבא</div>
        <h2 className="mt-0.5 text-lg font-bold">{action.title}</h2>
        <p className="mt-1 text-sm opacity-90">{action.description}</p>
      </div>
      {action.cta && (
        <Link to={action.cta.to} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white shadow transition ${ctaTone}`}>
          {action.cta.label}
        </Link>
      )}
    </section>
  );
}

function ActionCard({ to, marker, icon: Icon, title, value, unit }: { to: string; marker: string; icon: any; title: string; value: number | string; unit: string }) {
  return (
    <Link to={to} className={`${marker} MTH_DASHBOARD_DARK_BLUE_CARD_V1 block min-w-0 rounded-3xl border border-white/10 bg-gradient-to-br from-[#06152f] via-[#0b3d91] to-[#0e7490] p-6 text-white shadow-[0_24px_70px_rgba(6,21,47,0.34)] transition hover:-translate-y-1 hover:shadow-[0_32px_95px_rgba(6,21,47,0.45)]`}>
      <Icon className="mb-3 h-10 w-10" />
      <div className="break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl">{title}</div>
      <div className="mt-3 inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm font-black text-white shadow-lg">{value} {unit}</div>
    </Link>
  );
}

export default function Dashboard() {
  const { session, site } = useLtiSession();
  const { data, loading, error, refresh } = useImportsOverview();
  const syncStatus = useSyncStatus();
  const teachers = useDashboardTeachers();
  const sourceStatus = useSourceStatus();
  const autoSync = useAutoSyncStatus(refresh);
  const nextAction = useMemo(() => computeNextAction(data ?? null, sourceStatus), [data, sourceStatus]);
  const hasSession = Boolean(session);
  // "—" = no session/no source; "..." = loading; number = real value (0 is real zero)
  const v = (n: number | undefined) => {
    if (!hasSession) return "—";
    if (loading) return "...";
    if (!data) return "—";
    return n ?? 0;
  };
  // Students card: while auto-sync is still running and the count is 0, show a
  // syncing indicator instead of a misleading "0". Once sync succeeds, refresh()
  // updates data and the real number shows.
  const studentsValue = (() => {
    if (!hasSession) return "—";
    if (loading) return "...";
    const count = data?.students_count ?? 0;
    if (count === 0 && (autoSync.status === "syncing" || autoSync.status === "idle")) return "מסנכרן…";
    return count;
  })();
  const realActivitiesCount = hasSession && data && !loading
    ? Math.max(data.tasks_count || 0, data.grade_items_count || 0)
    : loading ? "..." : "—";
  const realActivitiesUnit = hasSession && data && (data.tasks_count || 0) === 0 && (data.grade_items_count || 0) > 0 ? "פעילויות מ-Gradebook" : "משימות";

  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);

  const updatedAtText = useMemo(() => formatTeacherDateDmyShort(now), [now]);
  const teacherName = safeTeacherDisplayName(session, teachers.names) || "שם מורה לא התקבל ממודל";
  const courseName = teachers.courseTitle || session?.course_title || site?.site_name || "—";

  // Teacher header: pluralize by the real instructor count from NRPS when known,
  // otherwise fall back to the number of resolved names. Show up to 3 names plus
  // "ועוד X"; full list lives in the title attribute. When NRPS returned no
  // teacher names, show a short truthful message instead of inventing one.
  const teacherCount = teachers.count || teachers.names.length;
  const teacherCardLabel = teacherCount === 1 ? "מורה" : (teacherCount > 1 ? teacherCount + " מורים" : "מורה");
  const teacherCardValue = teachers.names.length > 0
    ? (teachers.names.length <= 3
        ? teachers.names.join(" · ")
        : teachers.names.slice(0, 3).join(" · ") + " · ועוד " + (teachers.names.length - 3))
    : (teachers.state === "ready"
        ? (safeTeacherDisplayName(session, teachers.names) || "שמות מורים לא התקבלו ממודל")
        : teacherName);
  // Truthful participants line: only shown when live NRPS returned real counts.
  const participantsBreakdownText = (() => {
    if (!teachers.hasLiveNrps || teachers.participants == null) return "";
    const parts = [teachers.participants + " משתתפים במרחב"];
    if (teachers.learners != null) parts.push(teachers.learners + " תלמידים");
    if (teacherCount > 0) parts.push(teacherCount === 1 ? "מורה אחד" : teacherCount + " מורים");
    let line = parts.join(" · ") + " · מקור: Moodle NRPS";
    if (teachers.updatedAt) line += " · עודכן " + formatTeacherDateTime(teachers.updatedAt);
    return line;
  })();

  const [syncing, setSyncing] = useState(false);
  async function handleSyncSpace() {
    setSyncing(true);
    try {
      // Server-owned sync (MTH_NRPS_SERVER_OWNED_SYNC_V1): POST token only and let
      // the server fetch + classify + persist learners. The preview is only used to
      // confirm NRPS returned members before triggering the save. No invented data;
      // instructors/unknown are skipped server-side.
      const res = await fetch(nrpsPreviewUrl(), { headers: { Accept: "application/json" }, credentials: "include" });
      const preview = await res.json().catch(() => null);
      const students = Array.isArray(preview?.members_named) ? preview.members_named : [];
      if (students.length) {
        const ltiToken = getLtiToken();
        await fetch("/api/imports/nrps-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(ltiToken ? { token: ltiToken } : {}),
        });
      }
      await syncStatus.runSync();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="MTH_DASHBOARD_ACTION_HUB_V1 w-full min-w-0 max-w-full space-y-8 overflow-x-hidden" dir="rtl">
      <span className="sr-only">MTH_DASHBOARD_ACTION_ONLY_NO_EXPLAINER_TEXT_V1</span>
      <AutoSyncBanner status={autoSync.status} lastError={autoSync.lastError} onRetry={autoSync.retry} />
      <OnboardingBanner hasSession={hasSession} studentsCount={data?.students_count ?? 0} gradesCount={data?.grades_count ?? 0} logsCount={data?.log_events_count ?? 0} />
      <section className="relative max-w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#06152f] via-[#082b66] to-[#0b4f8f] p-5 text-white shadow-[0_30px_90px_rgba(6,21,47,0.45)] sm:p-7 lg:p-10">
        <div className="relative z-10 flex min-w-0 flex-col items-stretch gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#0b2b5c]/90 px-4 py-2 text-sm font-black text-white shadow-lg backdrop-blur-md">
              <div className={`h-2 w-2 rounded-full ${hasSession ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />{hasSession ? "מחובר מתוך Moodle" : "נדרשת פתיחה מתוך Moodle"}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
              <h1 className="break-words text-3xl font-black tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-5xl">המודל החכם</h1>
              <p className="text-base font-bold text-cyan-200/90 lg:text-lg">לוח הבקרה של המורה</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="grid min-w-0 gap-3 xl:grid-cols-3">
              <Link to="/teachers" className="block rounded-2xl border border-white/25 bg-[#0f3d75]/95 px-5 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-[#15559a]">
                <div className="text-xs font-bold text-cyan-200/80">{teacherCardLabel}</div>
                <div className="mt-0.5 text-base font-black text-white leading-snug" title={teachers.names.length > 0 ? teachers.names.join(", ") : undefined}>{teacherCardValue}</div>
                {participantsBreakdownText && <div className="mt-1 text-xs font-bold text-cyan-200/70">{participantsBreakdownText}</div>}
                <div className="mt-1.5 text-xs font-bold text-cyan-100/80">צוות הוראה במרחב ←</div>
              </Link>
              <div className="rounded-2xl border border-white/25 bg-[#0f3d75]/95 px-5 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                <div className="text-xs font-bold text-cyan-200/80">מרחב הלימוד</div>
                <div className="mt-0.5 truncate text-lg font-black text-white">{courseName}</div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-[#0f3d75]/95 px-5 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-cyan-200/80" />
                <div>
                  <div className="text-xs font-bold text-cyan-200/80">עודכן</div>
                  <div className="mt-0.5 truncate text-lg font-black text-white">{updatedAtText}</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="flex min-w-0 flex-wrap gap-3 pt-2">
              <Button size="lg" onClick={() => void handleSyncSpace()} disabled={syncing || syncStatus.running} className="bg-white text-[#06152f] hover:bg-white/90 font-black shadow-xl"><RefreshCw className={(syncing || syncStatus.running) ? "h-4 w-4 animate-spin" : "h-4 w-4"} />סנכרן מרחב</Button>
              <Button asChild size="lg" className="border border-white/35 bg-[#0f3d75]/90 text-white hover:bg-[#15559a] font-black shadow-lg"><Link to="/smart-import" className="flex items-center gap-2"><Import className="h-4 w-4" />ייבוא חכם</Link></Button>
              <Button asChild variant="outline" size="lg" className="border-white/40 bg-[#06152f]/55 text-white hover:bg-[#0f3d75]/90 font-black"><Link to="/reports">דוחות</Link></Button>
            </motion.div>
          </div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: "spring" }}><StatusBadge status={hasSession ? "proven" : "missing"} className="self-start shadow-2xl xl:scale-125 2xl:scale-150" /></motion.div>
        </div>
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
      </section>

      <section className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="כפתורי פעולה ראשיים בעמוד הבית החכם">
        <div className="relative">
          <ActionCard to="/students" marker="MTH_DASHBOARD_MAIN_PARTICIPANTS_BUTTON_V1" icon={Users} title="תלמידים" value={studentsValue} unit="תלמידים" />
          {(data?.students_count ?? 0) === 0 && autoSync.status !== "syncing" && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); autoSync.retry(); }}
              className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur transition hover:bg-white/30"
              title="נסה לסנכרן שוב"
            >
              <RefreshCw className="h-3 w-3" />רענן
            </button>
          )}
        </div>
        <ActionCard to="/tasks" marker="MTH_DASHBOARD_MAIN_ACTIVITIES_BUTTON_V1" icon={ClipboardList} title="פרקים ופעילויות" value={realActivitiesCount} unit={realActivitiesUnit} />
        <ActionCard to="/grades" marker="MTH_DASHBOARD_MAIN_GRADES_BUTTON_V1" icon={GraduationCap} title="ציונים" value={v(data?.grades_count)} unit="ציונים" />
        <a href="#all-actions-menu" className="MTH_DASHBOARD_MAIN_ALL_BUTTON_V1 MTH_DASHBOARD_DARK_BLUE_CARD_V1 rounded-3xl border border-white/10 bg-gradient-to-br from-[#06152f] via-[#0b3d91] to-[#0e7490] p-6 text-white shadow-[0_24px_70px_rgba(6,21,47,0.34)] transition hover:-translate-y-1 hover:shadow-[0_32px_95px_rgba(6,21,47,0.45)]"><Database className="mb-3 h-10 w-10" /><div className="break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl">כל השאר</div><div className="mt-3 inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm font-black text-white shadow-lg">תפריט</div></a>
      </section>

      {error && <div className="rounded-xl border border-status-blocked/30 bg-status-blocked-bg/10 p-4 flex gap-3 text-sm text-status-blocked items-start"><AlertCircle className="h-5 w-5 mt-0.5 shrink-0" /><div><div className="font-bold">שגיאה בסנכרון נתונים</div><p className="opacity-80 mt-1">{error}</p></div></div>}
      {syncStatus.error && <div className="rounded-xl border border-status-missing/30 bg-status-missing-bg/10 p-4 text-sm text-status-missing"><div className="font-bold">בדיקת סנכרון לא הצליחה</div><p className="opacity-80 mt-1">{syncStatus.error}</p></div>}

      <section id="all-actions-menu" className="MTH_DASHBOARD_SECONDARY_MENU_V1 scroll-mt-8 rounded-[2rem] border border-primary/10 bg-muted/30 p-6 shadow-elegant">
        <h2 className="mb-5 text-2xl font-black text-primary">פעולות נוספות</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/smart-import">ייבוא חכם</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/gradebook-import">Gradebook ייבוא</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/logs-import">ייבוא יומני מעקב</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/reports">דוחות</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/activity">פעילות / זמנים</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/export">ייצוא</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/missing-data">מה חסר</Link></Button>
          <Button asChild variant="ghost" className="h-auto justify-start rounded-2xl bg-white/75 p-4 text-right font-black"><Link to="/setup">חיבור Moodle</Link></Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="תלמידים" value={v(data?.students_count)} icon={Users} delay={0.1} />
        <StatCard label="מורים במרחב" value={teachers.state === "ready" ? teachers.count : "—"} icon={GraduationCap} delay={0.15} />
        <StatCard label="פריטי ציון" value={v(data?.grade_items_count)} icon={GraduationCap} delay={0.2} />
        <StatCard label="ציונים" value={v(data?.grades_count)} icon={Database} delay={0.3} />
        <StatCard label="פרקים" value={v(data?.chapters_count)} icon={ClipboardList} delay={0.4} />
        <StatCard label="פעילויות" value={realActivitiesCount} icon={ClipboardList} delay={0.5} />
        <StatCard label="לוגים" value={v(data?.log_events_count)} icon={Calendar} delay={0.6} />
      </section>

      {sourceStatus && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-background/60 p-4 text-sm" aria-label="סטטוס חיבור מהיר">
          <span className="font-bold text-muted-foreground">מצב אוטומציה:</span>
          <span className="text-xs text-muted-foreground">({data?.students_count ?? 0} תלמידים נשלפו · {data?.grade_items_count ?? 0} פריטי ציון · {data?.tasks_count ?? 0} משימות · {data?.log_events_count ?? 0} לוגים)</span>
          <span className="font-bold text-muted-foreground">|</span>
          <span className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold " + (sourceStatus.nrps === "available" ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-600")}>
            {sourceStatus.nrps === "available" ? "✓" : "○"} תלמידים אוטומטיים
          </span>
          <span className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold " + (sourceStatus.ags === "available" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900")}>
            {sourceStatus.ags === "available" ? "✓" : "○"} ציונים אוטומטיים
          </span>
          <span className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold " + (sourceStatus.moodle_ws === "available" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900")}>
            {sourceStatus.moodle_ws === "available" ? "✓" : "○"} שאיבה מלאה
          </span>
        </section>
      )}
      <NextBestActionPanel action={nextAction} />

      {/* MTH_HONEST_SOURCE_STATUS_V1 — truthful "where does the data come from" panel */}
      {sourceStatus && (
        <section className="rounded-3xl border bg-background/60 p-5 sm:p-6" aria-label="מקורות הנתונים">
          <h2 className="mb-1 text-lg font-bold">מאיפה מגיעים הנתונים</h2>
          <p className="mb-4 text-sm text-muted-foreground">מה נטען אוטומטית מ-Moodle, ומה דורש ייבוא דוח.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SourceRow label="תלמידים ומורים" hint="רשימת המשתתפים (NRPS)" status={sourceStatus.nrps} />
            <SourceRow label="ציונים" hint="AGS אוטומטי או ייבוא Gradebook" status={sourceStatus.ags === "available" ? "available" : sourceStatus.gradebook} />
            <SourceRow label="פרקים ומשימות" hint="ייבוא מבנה קורס" status={sourceStatus.gradebook === "available" ? "available" : "missing"} />
            <SourceRow label="פעילות ולוגים" hint="ייבוא דוח Logs" status={sourceStatus.logs} />
            <SourceRow label="חיבור אוטומטי מלא" hint="Web Services (דורש הרשאת מנהל)" status={sourceStatus.moodle_ws} />
          </div>
        </section>
      )}
      {loading && <div className="fixed bottom-8 left-8 flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-2xl border animate-bounce"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-[10px] font-bold">טוען...</span></div>}
    </div>
  );
}



