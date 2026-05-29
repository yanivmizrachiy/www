import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, FileUp, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSyncStatus, type SyncStatus } from "@/hooks/useSyncStatus";
import { useImportsOverview } from "@/hooks/useImports";
import { useLtiSession } from "@/hooks/useLtiSession";
import { MOODLE_REPORTS, buildMoodleReportUrl } from "@/lib/moodleReportLinks";

const gateInfo: Record<keyof SyncStatus["capabilities"], { title: string; report: string; why: string }> = {
  participants: {
    title: "משתתפים",
    report: "Participants / משתתפים",
    why: "בלי דוח משתתפים אי אפשר להציג רשימת תלמידים אמיתית.",
  },
  tasks: {
    title: "פרקים ומשימות",
    report: "Activity Completion או מבנה קורס",
    why: "בלי דוח משימות אי אפשר לבנות תפריטי פרקים ומשימות אמיתיים.",
  },
  grades: {
    title: "ציונים",
    report: "Gradebook / גיליון ציונים",
    why: "בלי Gradebook אי אפשר להציג ציונים, ממוצעים ודוחות ציונים.",
  },
  logs: {
    title: "זמנים ולוגים",
    report: "Logs / לוגים",
    why: "בלי לוגים אי אפשר לחשב זמן תרגול אמיתי.",
  },
};

// MTH_MISSING_DATA_SCOPED_TRUTH_V1
function isAvailableScoped(
  key: keyof SyncStatus["capabilities"],
  globalValue: string | undefined,
  scoped: { students: number; grades: number; tasks: number; logs: number } | null
): boolean {
  if (globalValue !== "available") return false;
  if (!scoped) return false;
  switch (key) {
    case "participants": return scoped.students > 0;
    case "tasks":        return scoped.tasks > 0;
    case "grades":       return scoped.grades > 0;
    case "logs":         return scoped.logs > 0;
    default:             return false;
  }
}

export default function MissingData() {
  const sync = useSyncStatus();
  const status = sync.data;
  const overview = useImportsOverview();
  const { session, site } = useLtiSession();
  const scoped = overview.data
    ? {
        students: overview.data.students_count ?? 0,
        grades: (overview.data.grade_items_count ?? 0) + (overview.data.grades_count ?? 0),
        tasks: (overview.data.chapters_count ?? 0) + (overview.data.tasks_count ?? 0),
        logs: overview.data.log_events_count ?? 0,
      }
    : null;
  const courseId = session?.course_id ?? null;
  const base = site?.site_url ?? null;
  const keys = Object.keys(gateInfo) as Array<keyof SyncStatus["capabilities"]>;
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="space-y-6">
      <button type="button" onClick={() => navigate(-1)} aria-label="חזרה"
        className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <ArrowRight className="h-4 w-4" />חזרה
      </button>
      <section className="rounded-3xl bg-gradient-hero p-8 text-white shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">מה חסר כדי להמשיך?</h1>
            <p className="mt-2 text-sm text-white/75">
              בדוק אילו מקורות נתונים חסרים ואיפה להורידם ממודל.
            </p>
          </div>
          <Button onClick={() => void sync.runSync()} disabled={sync.running} className="bg-white text-primary hover:bg-white/90">
            <RefreshCw className={sync.running ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            בדוק שוב
          </Button>
        </div>
      </section>

      {sync.error && (
        <div className="rounded-xl border border-status-missing/30 bg-status-missing-bg/10 p-4 text-status-missing">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-5 w-5" />
            בדיקת החוסרים לא הצליחה
          </div>
          <p className="mt-1 text-sm">{sync.error}</p>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {keys.map((key) => {
          const info = gateInfo[key];
          const available = isAvailableScoped(key, status?.capabilities?.[key], scoped);
          return (
            <Card key={key} className={available ? "border-status-proven/30 bg-status-proven-bg/10" : "border-status-missing/30 bg-status-missing-bg/10"}>
              <CardHeader>
                <CardTitle>{info.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={available ? "font-bold text-status-proven" : "font-bold text-status-missing"}>
                  {available ? "קיים מקור אמת" : "חסר מקור אמת"}
                </div>
                <p className="text-sm text-muted-foreground">{available ? "הנתונים כבר קיימים ואפשר לעבוד איתם במסכים הרלוונטיים." : info.why}</p>
                <div className="rounded-xl bg-background/70 p-3 text-sm">
                  <span className="font-bold">הדוח הדרוש: </span>{info.report}
                </div>
                <Button asChild variant={available ? "default" : "outline"} className="w-full">
                  <Link to={available ? "/" : "/smart-import"}>
                    {available ? "חזור לדשבורד" : "עבור לייבוא דוח"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold">קישורים ישירים לדוחות Moodle שלך</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {courseId && base
              ? "לחיצה פותחת את הדוח המדויק במרחב ה-Moodle שלך בלשונית חדשה. ייצא ואז העלה לכאן."
              : "הקישורים הישירים יופיעו לאחר פתיחת הכלי מתוך Moodle (כדי לזהות את הקורס ואת כתובת ה-Moodle שלך)."}
          </p>
        </div>

        {courseId && base ? (
          <div className="grid gap-3 md:grid-cols-2">
            {MOODLE_REPORTS.map((r) => {
              const url = buildMoodleReportUrl(base, courseId, r);
              if (!url) return null;
              return (
                <div key={r.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-extrabold text-slate-900">{r.title}</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      פתח ב-Moodle
                    </a>
                    <Link
                      to={r.importPath}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5"
                    >
                      <FileUp className="h-3.5 w-3.5" />
                      העלה לכאן
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
            פתח את הכלי מתוך מרחב ה-Moodle שלך כדי לקבל קישורים ישירים מותאמים לקורס שלך.
          </div>
        )}
      </section>

      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <div className="font-extrabold text-primary">ייבוא דוח Moodle</div>
            <p className="text-sm text-muted-foreground">
              לא מצאת את הנתון שחסר? ייבא את הדוח המתאים ממודל.
            </p>
          </div>
          <Button asChild>
            <Link to="/smart-import">
              <FileUp className="h-4 w-4" />
              ייבוא דוח Moodle
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
