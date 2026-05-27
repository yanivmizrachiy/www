import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, RefreshCw, ExternalLink } from "lucide-react";
import { NrpsPrivacyInsight } from "@/components/NrpsPrivacyInsight";
import { formatTeacherDateTime } from "@/lib/teacherDateFormat";

// MTH_LIVE_CAPABILITY_PROBE_V1
// One honest "truth table" page that shows EXACTLY what Moodle gives us right
// now, what is blocked, and what requires a Moodle admin. It only reads the
// real /api/capabilities/status endpoint (which never returns secrets, never
// fakes NRPS/AGS, and keeps teacher_release_ready false). No guessing.

type Status =
  | "configured" | "available" | "partial"
  | "missing" | "unavailable" | "blocked" | "unknown";

interface CapStatus {
  ok: boolean;
  lti11_status: Status;
  lti13_status: Status;
  moodle_ws_status: Status;
  nrps_status: Status;
  ags_status: Status;
  gradebook_status: Status;
  logs_status: Status;
  manual_report_import_status: Status;
  blocker_keys: string[];
  checked_at: string;
}

function statusVisual(s: Status): { he: string; tone: string; Icon: React.ComponentType<{ className?: string }> } {
  switch (s) {
    case "configured":
    case "available":
      return { he: "פעיל", tone: "border-green-200 bg-green-50 text-green-800", Icon: CheckCircle2 };
    case "partial":
      return { he: "חלקי", tone: "border-amber-200 bg-amber-50 text-amber-800", Icon: AlertTriangle };
    case "missing":
      return { he: "חסר", tone: "border-red-200 bg-red-50 text-red-800", Icon: XCircle };
    case "unavailable":
    case "blocked":
      return { he: "חסום", tone: "border-red-200 bg-red-50 text-red-800", Icon: XCircle };
    default:
      return { he: "לא ידוע", tone: "border-slate-200 bg-slate-50 text-slate-600", Icon: HelpCircle };
  }
}

interface Row {
  key: keyof CapStatus;
  title: string;
  what: string;
  needs: string;
}

const ROWS: Row[] = [
  { key: "lti11_status", title: "LTI 1.1 — כניסה מ-Moodle", what: "זהות מורה + קורס מהפעלת LTI.", needs: "מוגדר בשרת." },
  { key: "lti13_status", title: "LTI 1.3 — כניסה מתקדמת", what: "כניסה מאובטחת + שירותי NRPS/AGS אפשריים.", needs: "מוגדר בשרת." },
  { key: "nrps_status", title: "NRPS — רשימת משתתפים אוטומטית", what: "תלמידים + מורים + תפקידים, אוטומטית.", needs: "ש-Moodle ישלח NRPS בהפעלה חיה." },
  { key: "ags_status", title: "AGS — ציונים אוטומטית", what: "פריטי ציון וציונים, אוטומטית.", needs: "ש-Moodle ישלח AGS בהפעלה חיה." },
  { key: "moodle_ws_status", title: "Web Services — שאיבה מלאה", what: "שליפה אוטומטית של תלמידים/ציונים/לוגים/מבנה.", needs: "MOODLE_WS_TOKEN ממנהל Moodle (משרד החינוך)." },
  { key: "gradebook_status", title: "ציונים (מיובא)", what: "ציונים מדוח שיובא.", needs: "ייבוא דוח Gradebook." },
  { key: "logs_status", title: "לוגים (מיובא)", what: "אירועי פעילות מדוח שיובא.", needs: "ייבוא דוח Logs." },
  { key: "manual_report_import_status", title: "ייבוא דוחות (fallback)", what: "ייבוא ידני של דוחות Moodle אמיתיים.", needs: "תמיד זמין." },
];

const BLOCKER_HE: Record<string, string> = {
  no_lti_configured: "אין הגדרת LTI פעילה.",
  moodle_ws_token_missing: "חסר MOODLE_WS_TOKEN — נדרש ממנהל Moodle כדי לאפשר שאיבה אוטומטית מלאה.",
  missing_participants_report: "חסר דוח משתתפים — ייבא רשימת Participants.",
  missing_gradebook_report: "חסר דוח ציונים — ייבא Gradebook.",
  missing_logs_report: "חסר דוח לוגים — ייבא Logs.",
};

export default function Page() {
  const [data, setData] = useState<CapStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function probe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/capabilities/status", { headers: { Accept: "application/json" } });
      const json = await res.json();
      if (!json?.ok) { setError("בדיקת היכולות לא הצליחה."); setData(null); }
      else setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה לא ידועה בבדיקת היכולות.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { probe(); }, []);

  return (
    <SafePage
      title="בדיקת יכולות Moodle"
      description="מה זמין אוטומטית, מה חסום ומה דורש פעולת מנהל."
      backTo="-1"
    >
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {data ? `נבדק: ${formatTeacherDateTime(data.checked_at)}` : "בודק יכולות..."}
          </p>
          <button
            type="button"
            onClick={probe}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            בדוק שוב
          </button>
        </div>

        {error ? (
          <EmptyTruth>{error}</EmptyTruth>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">טוען בדיקת יכולות...</p>
        ) : (
          <>
            <section className="space-y-3">
              {ROWS.map((row) => {
                const s = data[row.key] as Status;
                const v = statusVisual(s);
                const Icon = v.Icon;
                return (
                  <div key={row.key} className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-extrabold text-slate-900">{row.title}</div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{row.what}</p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${v.tone}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {v.he}
                      </span>
                    </div>
                    {(s === "missing" || s === "unavailable" || s === "blocked" || s === "unknown") && (
                      <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-muted-foreground">
                        <span className="font-bold">כדי להפעיל: </span>{row.needs}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>

            <NrpsPrivacyInsight />

            {data.blocker_keys?.length > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-extrabold text-amber-900">
                  <AlertTriangle className="h-5 w-5" />
                  חסמים שצריך לפתור
                </div>
                <ul className="space-y-1 text-sm leading-6 text-amber-950">
                  {data.blocker_keys.map((k) => (
                    <li key={k}>• {BLOCKER_HE[k] ?? k}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/missing-data" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90">
                    <ExternalLink className="h-3.5 w-3.5" />
                    מה חסר + קישורים ישירים
                  </Link>
                  <Link to="/import" className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5">
                    ייבוא דוח
                  </Link>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <p>
                שאיבה אוטומטית מלאה דורשת <span className="font-bold">MOODLE_WS_TOKEN</span> ממנהל Moodle, או הפעלת NRPS/AGS. ברגע שיוגדרו, המערכת תזהה זאת כאן.
              </p>
            </section>
          </>
        )}
      </div>
    </SafePage>
  );
}
