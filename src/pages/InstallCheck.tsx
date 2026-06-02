import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SafePage } from "@/components/SafePage";
import { getLtiToken } from "@/hooks/useLtiSession";
import { useImportsOverview } from "@/hooks/useImports";
import { formatTeacherDateTime } from "@/lib/teacherDateFormat";
import { CheckCircle2, XCircle, MinusCircle, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

// MTH_INSTALL_CHECK_PAGE_V1
// A real, teacher-run readiness check for a new Moodle course/space. It reads ONLY
// the safe current-session diagnostics from /api/lti13/participants-breakdown:
// whether the tool was opened from Moodle, the LTI version / NRPS claim, the known
// client id and deployment id, whether the token and membership requests work, and
// the live participant counts (total / learners / instructors / unknown). Plus a
// safe count from /api/imports/overview to show whether a roster sync is saved.
//
// The endpoint already strips emails, raw user IDs, names, access tokens, client
// assertions and secrets, and performs no save. This page shows booleans and counts
// only — no raw student rows, no names, no emails, no tokens, no secrets.

interface Breakdown {
  ok: boolean;
  source?: string;
  stage?: string;
  error?: string;
  has_latest_lti13_session?: boolean;
  has_nrps?: boolean;
  has_ags?: boolean;
  total_members?: number;
  learners_count?: number;
  instructors_count?: number;
  unknown_count?: number;
  course_id?: string | null;
  course_title?: string | null;
  resource_link_id?: string | null;
  deployment_id?: string | null;
  client_id?: string | null;
  token_http_status?: number;
  membership_http_status?: number;
  missing?: string[];
  updated_at?: string;
}

type CheckState = "ok" | "fail" | "unknown";

function breakdownUrl(): string {
  const token = getLtiToken();
  return "/api/lti13/participants-breakdown" + (token ? "?t=" + encodeURIComponent(token) : "");
}

function StateIcon({ state }: { state: CheckState }) {
  if (state === "ok") return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />;
  if (state === "fail") return <XCircle className="h-5 w-5 shrink-0 text-red-600" />;
  return <MinusCircle className="h-5 w-5 shrink-0 text-slate-400" />;
}

function CheckRow({ label, state, detail }: { label: string; state: CheckState; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <StateIcon state={state} />
        <div>
          <div className="text-sm font-bold text-slate-900">{label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground break-all">{detail}</div>
        </div>
      </div>
    </div>
  );
}

export default function InstallCheck() {
  const [bd, setBd] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: imports } = useImportsOverview();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(breakdownUrl(), { headers: { Accept: "application/json" }, credentials: "include" });
      const json = (await res.json().catch(() => null)) as Breakdown | null;
      setBd(json);
    } catch {
      setBd(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const live = Boolean(bd?.ok);
  const stage = bd?.stage || "";
  // An NRPS claim / live LTI 1.3 session exists when the breakdown succeeded, or
  // when it failed only at the token/membership stage (session + NRPS claim were
  // already present). The "session-or-nrps-claim" stage means no live 1.3 session.
  const hasLtiThirteenSession = live || stage === "token" || stage === "membership" || Boolean(bd?.has_nrps);
  const envNotConfigured = stage === "env";
  // We only ever observe a confirmed version from the 1.3 diagnostics path. When no
  // live 1.3 session is present we cannot prove the launch was 1.0/1.1 vs not opened
  // from Moodle at all, so we keep that distinction honest below.

  const openedFromMoodle: CheckState = live || hasLtiThirteenSession ? "ok" : "unknown";

  const tokenState: CheckState = live
    ? "ok"
    : stage === "token" || stage === "membership"
      ? "fail"
      : "unknown";
  const membershipState: CheckState = live ? "ok" : stage === "membership" ? "fail" : "unknown";
  const nrpsState: CheckState = live ? "ok" : hasLtiThirteenSession ? "ok" : "unknown";

  const clientIdState: CheckState = bd?.client_id ? "ok" : "unknown";
  const deploymentIdState: CheckState = bd?.deployment_id ? "ok" : "unknown";

  const total = Number(bd?.total_members ?? 0);
  const learners = Number(bd?.learners_count ?? 0);
  const instructors = Number(bd?.instructors_count ?? 0);
  const unknown = Number(bd?.unknown_count ?? 0);

  // Whether a roster sync is saved/available for this space (safe count only).
  const savedStudents = Number(imports?.students_count ?? 0);
  const syncState: CheckState = savedStudents > 0 ? "ok" : "unknown";

  const dash = "—";

  return (
    <SafePage
      title="בדיקת התקנה — מרחב Moodle"
      description="בדיקה בטוחה של מוכנות הכלי במרחב הזה: גרסת LTI, NRPS, וספירות בלבד — ללא נתונים אישיים."
      backTo="/setup"
      backLabel="חזרה לחיבור Moodle"
    >
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            רענן
          </button>
        </div>

        {/* Verdict banner */}
        {!loading && (
          hasLtiThirteenSession ? (
            <section className="rounded-3xl border border-green-200 bg-green-50 p-6">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-green-700" />
                <h2 className="text-xl font-extrabold text-green-900">LTI 1.3 + NRPS</h2>
              </div>
              <p className="text-sm leading-7 text-green-950">הכלי מוכן לסנכרון תלמידים במרחב הזה.</p>
            </section>
          ) : !live && (stage === "session-or-nrps-claim" || envNotConfigured) ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-amber-700" />
                <h2 className="text-xl font-extrabold text-amber-900">לא זוהה סשן LTI 1.3 חי</h2>
              </div>
              <p className="text-sm leading-7 text-amber-950">
                זה הכלי הישן. תלמידים אוטומטיים דורשים LTI 1.3 + NRPS.
              </p>
              <p className="mt-2 text-xs leading-6 text-amber-900">
                פתח את הכלי מתוך מרחב ה-Moodle (LTI 1.3 עם NRPS) ולחץ רענן.
              </p>
            </section>
          ) : (
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-slate-600" />
                <h2 className="text-xl font-extrabold text-slate-900">לא אומת</h2>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                לא ניתן לקבוע את מצב ההתקנה כעת. פתח את הכלי מתוך מרחב Moodle ולחץ רענן.
              </p>
            </section>
          )
        )}

        {/* Readiness checks */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-extrabold">בדיקות מוכנות</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">טוען אבחון מרחב...</p>
          ) : (
            <div className="space-y-2.5">
              <CheckRow label="נפתח מתוך Moodle" state={openedFromMoodle} detail={openedFromMoodle === "ok" ? "סשן חי זוהה" : "לא אומת — פתח מתוך מרחב Moodle"} />
              <CheckRow label="גרסת LTI" state={hasLtiThirteenSession ? "ok" : "unknown"} detail={hasLtiThirteenSession ? "LTI 1.3" : "לא אומת — נדרש LTI 1.3"} />
              <CheckRow label="טענת NRPS קיימת" state={nrpsState} detail={nrpsState === "ok" ? "claim זוהה" : "לא אומת"} />
              <CheckRow label="Client ID ידוע" state={clientIdState} detail={bd?.client_id || "לא אומת"} />
              <CheckRow label="Deployment ID ידוע" state={deploymentIdState} detail={bd?.deployment_id || "לא אומת"} />
              <CheckRow label="בקשת טוקן עובדת" state={tokenState} detail={tokenState === "ok" ? "הצליחה" : tokenState === "fail" ? "נכשלה — נסה שוב מתוך Moodle" : "לא אומת"} />
              <CheckRow label="בקשת חברות (membership) עובדת" state={membershipState} detail={membershipState === "ok" ? "הצליחה" : membershipState === "fail" ? "נכשלה — נסה שוב מתוך Moodle" : "לא אומת"} />
              <CheckRow label="סנכרון נשמר / זמין" state={syncState} detail={savedStudents > 0 ? `נשמרו ${savedStudents} תלמידים במרחב` : "טרם נשמר סנכרון במרחב הזה"} />
            </div>
          )}
        </section>

        {/* Live counts */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-extrabold">ספירות חיות</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">טוען...</p>
          ) : !live ? (
            <p className="text-sm text-muted-foreground">לא אומת — ספירות זמינות רק כאשר הכלי נפתח מתוך מרחב LTI 1.3 עם NRPS.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <div className="text-2xl font-black text-slate-900">{total}</div>
                <div className="text-xs font-bold text-muted-foreground">סך משתתפים</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <div className="text-2xl font-black text-slate-900">{learners}</div>
                <div className="text-xs font-bold text-muted-foreground">תלמידים</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <div className="text-2xl font-black text-slate-900">{instructors}</div>
                <div className="text-xs font-bold text-muted-foreground">מורים</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <div className="text-2xl font-black text-slate-900">{unknown}</div>
                <div className="text-xs font-bold text-muted-foreground">לא מסווג</div>
              </div>
            </div>
          )}
          {live && bd?.updated_at && (
            <div className="mt-3 text-xs text-muted-foreground">
              מקור: {(bd.source || "nrps").toUpperCase()} · עודכן: {formatTeacherDateTime(bd.updated_at)}
            </div>
          )}
        </section>

        {/* Space identity (safe diagnostics) */}
        {live && (
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-extrabold">זהות המרחב</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-0.5"><span className="text-xs font-bold text-muted-foreground">קורס</span><span className="break-all text-sm font-bold text-slate-900">{bd?.course_title || dash}</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs font-bold text-muted-foreground">מזהה קורס</span><span className="break-all text-sm font-bold text-slate-900">{bd?.course_id || dash}</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs font-bold text-muted-foreground">מזהה קישור משאב</span><span className="break-all text-sm font-bold text-slate-900">{bd?.resource_link_id || dash}</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs font-bold text-muted-foreground">Deployment ID</span><span className="break-all text-sm font-bold text-slate-900">{bd?.deployment_id || dash}</span></div>
            </div>
          </section>
        )}

        <p className="text-xs leading-5 text-muted-foreground">
          מוצגים מזהי התקנה/קורס וספירות בלבד — ללא שמות, ללא אימיילים, ללא מזהי משתמש, ללא טוקנים וללא סודות.
          לבדיקת בידוד בין שני מרחבים ראה{" "}
          <Link to="/isolation-check" className="font-bold text-blue-700 underline">בדיקת בידוד חיה</Link>.
        </p>
      </div>
    </SafePage>
  );
}
