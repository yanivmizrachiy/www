import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { ShieldCheck, ShieldAlert, CheckCircle2, Clock, RefreshCw } from "lucide-react";

// MTH_ISOLATION_STATUS_PAGE_V1
// Honest, truth-first view of multi-teacher data isolation. It shows the
// code-level invariants that ARE in place (proven by the isolation audit) and
// the items that still require a live two-teacher test before broad release.
// It reads only the real /api/release/readiness endpoint for the live blockers
// and never claims isolation is fully verified. Teacher Release stays NO.

interface Blocker {
  key: string;
  severity: string;
  message_he: string;
}
interface Readiness {
  ok: boolean;
  teacher_release_ready: boolean;
  broad_release_ready: boolean;
  teacher_release_readiness_percent: number;
  blockers: Blocker[];
  checked_at: string;
}

// Code-level invariants already guaranteed (mirrors the isolation audit, which
// runs in CI on every PR). These are structural guarantees in the server code.
const PROVEN_INVARIANTS: { he: string; signal: string }[] = [
  { he: "סשן נפתר לכל בקשה בנפרד (token/cookie)", signal: "כל בקשה מזוהה לפי טוקן ייחודי — אין מצב גלובלי משותף בין מורים." },
  { he: "זהות מורה נגזרת ממזהה Moodle", signal: "teacherId יציב נגזר מזהות ה-Moodle של הסשן." },
  { he: "זהות קורס נגזרת מהסשן", signal: "הקורס נקבע לפי courseId של הסשן בלבד." },
  { he: "ייבוא נקשר ל-batch לפי מורה+קורס", signal: "כל שורה מיובאת נושאת import_batch_id הקשור למורה ולקורס." },
  { he: "מזהי ציונים כוללים את הקורס", signal: "מזהי פריטי ציון משויכים לקורס — אין דליפה בין קורסים." },
  { he: "אין מזהה קורס/מורה קשיח בקוד", signal: "אין pilot-id מקודד — הכל נגזר מהסשן החי." },
  { he: "אבחון מחזיר אגרגט בלבד", signal: "נקודות אבחון מחזירות ספירות בלבד, לא שורות תלמידים." },
];

// Items that require a live test before broad release (cannot be proven by code alone).
const LIVE_PENDING: string[] = [
  "בדיקה חיה עם שני מורים שונים — לוודא שמורה ב' אינו רואה נתוני מורה א'.",
  "אכיפת Row Level Security ב-Supabase (טיוטה קיימת, טרם הופעלה).",
  "שער Teacher Release נשאר סגור עד אימות מלא.",
];

const ISOLATION_BLOCKER_KEYS = new Set([
  "multi_teacher_isolation_not_validated",
  "deploy_live_validation_missing",
  "real_moodle_end_to_end_missing",
  "repo_and_infra_manual_check_required",
]);

export default function Page() {
  const [data, setData] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/release/readiness", { headers: { Accept: "application/json" } });
      const json = await res.json();
      if (!json?.ok) { setError("טעינת מצב הבידוד לא הצליחה."); setData(null); }
      else setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בטעינת מצב הבידוד.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const liveBlockers = (data?.blockers ?? []).filter((b) => ISOLATION_BLOCKER_KEYS.has(b.key));

  return (
    <SafePage
      title="בידוד נתונים בין מורים"
      description="שקיפות אמת: מה כבר מובטח ברמת הקוד כדי שמורים לא יראו נתונים של אחרים, ומה עדיין דורש בדיקה חיה לפני הפצה רחבה. אין כאן הצהרת שווא — שער השחרור נשאר סגור עד אימות מלא."
    >
      <div className="space-y-5" dir="rtl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {data ? `נבדק: ${new Date(data.checked_at).toLocaleString("he-IL")}` : "טוען..."}
          </p>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            בדוק שוב
          </button>
        </div>

        {/* Proven invariants */}
        <section className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-700" />
            <h2 className="text-xl font-extrabold text-green-900">מה כבר מובטח ברמת הקוד</h2>
            <span className="rounded-full border border-green-300 bg-white px-2.5 py-0.5 text-xs font-bold text-green-800">
              נבדק בכל PR
            </span>
          </div>
          <ul className="space-y-2">
            {PROVEN_INVARIANTS.map((inv, i) => (
              <li key={i} className="flex items-start gap-2 rounded-2xl bg-white p-3 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{inv.he}</div>
                  <div className="text-xs text-muted-foreground">{inv.signal}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Live-pending items */}
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-700" />
            <h2 className="text-xl font-extrabold text-amber-900">מה עדיין דורש בדיקה חיה</h2>
          </div>
          <ul className="space-y-2">
            {LIVE_PENDING.map((t, i) => (
              <li key={i} className="flex items-start gap-2 rounded-2xl bg-white p-3 shadow-sm">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm leading-6 text-slate-800">{t}</div>
              </li>
            ))}
          </ul>

          {loading ? (
            <p className="mt-3 text-sm text-muted-foreground">טוען חסמים חיים...</p>
          ) : error ? (
            <div className="mt-3"><EmptyTruth>{error}</EmptyTruth></div>
          ) : liveBlockers.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-white p-3">
              <div className="mb-1 text-xs font-extrabold text-amber-900">חסמים פתוחים (מתוך בדיקת המוכנות):</div>
              <ul className="space-y-1 text-xs leading-5 text-slate-700">
                {liveBlockers.map((b) => <li key={b.key}>• {b.message_he}</li>)}
              </ul>
            </div>
          ) : null}
        </section>

        {/* Honest status footer */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
          <div className="mb-1 font-extrabold">סטטוס שחרור</div>
          <p>
            שער ה-Teacher Release נשאר <span className="font-bold">סגור</span> עד שכל הבדיקות החיות יושלמו.
            מוכנות נוכחית להפצת מורים: {data?.teacher_release_readiness_percent ?? "—"}%. עד אז, המערכת עובדת
            בבטחה עם נתוני אמת של המורה הנוכחי בלבד.
          </p>
          <div className="mt-3">
            <Link to="/capabilities" className="text-sm font-bold text-primary hover:underline">
              ראה גם: בדיקת יכולות Moodle
            </Link>
          </div>
        </section>
      </div>
    </SafePage>
  );
}
