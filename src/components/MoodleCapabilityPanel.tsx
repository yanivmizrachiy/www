import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Database, FileUp, Lock, PlugZap, RefreshCw, ShieldCheck } from "lucide-react";
import { getLtiToken } from "@/hooks/useLtiSession";
import { useSyncStatus } from "@/hooks/useSyncStatus";

type PanelStatus = "working" | "working_partial" | "blocked" | "missing" | "checking";

type CapabilityPayload = {
  version?: string;
  lti11_status?: string;
  lti13_status?: string;
  moodle_ws_status?: string;
  nrps_status?: string;
  ags_status?: string;
};

type ReleasePayload = {
  version?: string;
  teacher_release_ready?: boolean;
  blockers_count?: number;
  blockers?: Array<{ message_he?: string }>;
};

type PracticePayload = {
  version?: string;
  practice_time_available?: boolean;
  blocker_key?: string;
  reason_he?: string;
};

type PersistencePayload = {
  version?: string;
  production_persistence_ready?: boolean;
  active_mode?: string;
  teacher_message_he?: string;
};

type LiveTruthState = {
  capabilities: CapabilityPayload | null;
  release: ReleasePayload | null;
  practice: PracticePayload | null;
  persistence: PersistencePayload | null;
  loading: boolean;
  error: string | null;
};

type CapabilityRow = {
  key: string;
  title: string;
  state: string;
  status: PanelStatus;
  icon: ComponentType<{ className?: string }>;
  text: string;
  next: string;
  href: string;
  actionLabel: string;
};

const emptyTruth: LiveTruthState = {
  capabilities: null,
  release: null,
  practice: null,
  persistence: null,
  loading: true,
  error: null
};

function statusClass(status: PanelStatus) {
  if (status === "working") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (status === "working_partial") return "border-blue-200 bg-blue-50 text-blue-950";
  if (status === "checking") return "border-slate-200 bg-slate-50 text-slate-900";
  if (status === "missing") return "border-orange-200 bg-orange-50 text-orange-950";
  return "border-amber-200 bg-amber-50 text-amber-950";
}

function statusLabel(status: PanelStatus) {
  if (status === "working") return "עובד מנתוני אמת";
  if (status === "working_partial") return "עובד חלקית";
  if (status === "checking") return "בודק מצב";
  if (status === "missing") return "חסר דוח/נתון";
  return "חסום באמת";
}

function endpointWithToken(endpoint: string) {
  const token = getLtiToken();
  return token ? `${endpoint}?t=${encodeURIComponent(token)}` : endpoint;
}

async function fetchJson<T>(endpoint: string): Promise<T | null> {
  const token = getLtiToken();
  const response = await fetch(endpointWithToken(endpoint), {
    credentials: "include",
    headers: token ? { "x-lti-session": token } : undefined
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

function numberText(value: number | undefined | null) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "0";
}

function statusFromCount(count: number): PanelStatus {
  return count > 0 ? "working" : "missing";
}

export default function MoodleCapabilityPanel() {
  const sync = useSyncStatus();
  const [truth, setTruth] = useState<LiveTruthState>(emptyTruth);

  useEffect(() => {
    let active = true;

    async function loadTruth() {
      setTruth(prev => ({ ...prev, loading: true, error: null }));
      try {
        const [capabilities, release, practice, persistence] = await Promise.all([
          fetchJson<CapabilityPayload>("/api/capabilities/status"),
          fetchJson<ReleasePayload>("/api/release/readiness"),
          fetchJson<PracticePayload>("/api/practice-time/status"),
          fetchJson<PersistencePayload>("/api/persistence/status")
        ]);

        if (!active) return;
        setTruth({ capabilities, release, practice, persistence, loading: false, error: null });
      } catch (error) {
        if (!active) return;
        setTruth({
          ...emptyTruth,
          loading: false,
          error: error instanceof Error ? error.message : "capability_truth_fetch_failed"
        });
      }
    }

    void loadTruth();
    return () => { active = false; };
  }, []);

  const rows = useMemo<CapabilityRow[]>(() => {
    const counts = sync.data?.counts;
    const students = counts?.students ?? 0;
    const gradeItems = counts?.grade_items ?? 0;
    const grades = counts?.grades ?? 0;
    const logs = counts?.log_events ?? 0;

    const hasSession = Boolean(sync.data?.session_exists);
    const lti11 = truth.capabilities?.lti11_status;
    const lti13 = truth.capabilities?.lti13_status;
    const nrps = truth.capabilities?.nrps_status || "לא ידוע";
    const ags = truth.capabilities?.ags_status || "לא ידוע";
    const ws = truth.capabilities?.moodle_ws_status || "לא ידוע";
    const persistenceReady = Boolean(truth.persistence?.production_persistence_ready);
    const practiceReady = Boolean(truth.practice?.practice_time_available);
    const releaseReady = Boolean(truth.release?.teacher_release_ready);
    const blockersCount = truth.release?.blockers_count ?? truth.release?.blockers?.length ?? 0;

    return [
      {
        key: "lti",
        title: "כניסה מתוך Moodle",
        state: hasSession ? "סשן Moodle פעיל" : (lti13 === "configured" || lti11 === "configured" ? "מוגדר, ממתין לפתיחה" : "חסר סשן"),
        status: hasSession ? "working_partial" : (truth.loading ? "checking" : "missing"),
        icon: PlugZap,
        text: hasSession
          ? "המערכת קיבלה הקשר מורה/מרחב מ־Moodle. זה מוכיח פתיחה, אבל לא מוכיח שכל הנתונים נשאבים אוטומטית."
          : "אין כרגע סשן Moodle פעיל בדפדפן הזה. צריך לפתוח את הכלי מתוך Moodle כדי לקבל הקשר אמיתי.",
        next: hasSession ? "להמשיך לפי מקורות הנתונים הזמינים והחסרים." : "פתח את הכלי מתוך Moodle, לא דרך כניסה רגילה.",
        href: "/setup",
        actionLabel: "התקנה / חיבור Moodle"
      },
      {
        key: "participants",
        title: "משתתפים",
        state: students > 0 ? `${students} תלמידים/משתתפים` : "חסר דוח Participants",
        status: statusFromCount(students),
        icon: CheckCircle2,
        text: students > 0 ? "קיימים משתתפים מנתוני Moodle אמיתיים שיובאו ונשמרו." : "אין עדיין רשימת משתתפים אמיתית זמינה לתצוגה.",
        next: students > 0 ? `NRPS: ${nrps}. לבדוק אם אפשר להפוך את השלמת השמות לאוטומטית.` : "ייבא דוח Participants אמיתי ממודל.",
        href: students > 0 ? "/students" : "/import",
        actionLabel: students > 0 ? "פתח משתתפים" : "ייבא Participants"
      },
      {
        key: "gradebook",
        title: "ציונים / Gradebook",
        state: grades > 0 || gradeItems > 0 ? `${gradeItems} פריטי ציון · ${grades} ציונים` : "חסר Gradebook",
        status: statusFromCount(gradeItems + grades),
        icon: FileUp,
        text: grades > 0 || gradeItems > 0 ? "קיימים ציונים אמיתיים מייבוא Gradebook. תאים חסרים לא נשמרים כ־0." : "אין עדיין פריטי ציון או תוצאות ציון מנתוני אמת.",
        next: grades > 0 || gradeItems > 0 ? `AGS: ${ags}. לבדוק אפשרות לציונים אוטומטיים רק אם הרשאות Moodle מאפשרות.` : "ייבא Gradebook אמיתי ממודל.",
        href: grades > 0 || gradeItems > 0 ? "/grades" : "/gradebook-import",
        actionLabel: grades > 0 || gradeItems > 0 ? "פתח ציונים" : "ייבא Gradebook"
      },
      {
        key: "logs",
        title: "יומני מעקב",
        state: logs > 0 ? `${logs} אירועי לוג` : "חסר דוח Logs",
        status: statusFromCount(logs),
        icon: FileUp,
        text: logs > 0 ? "קיימים יומני מעקב אמיתיים מייבוא דוח Moodle." : "אין עדיין יומני מעקב אמיתיים במערכת.",
        next: logs > 0 ? `Moodle Web Services: ${ws}. לבדוק אם קיימת הרשאת Logs רשמית.` : "ייבא דוח Logs / יומני מעקב אמיתי ממודל.",
        href: logs > 0 ? "/activity" : "/logs-import",
        actionLabel: logs > 0 ? "פתח פעילות" : "ייבא Logs"
      },
      {
        key: "practice_time",
        title: "זמן תרגול",
        state: practiceReady ? "זמין ממקור רשמי" : (truth.practice?.blocker_key || "חסום"),
        status: practiceReady ? "working" : "blocked",
        icon: Lock,
        text: practiceReady ? "קיים מקור משך זמן רשמי ולכן ניתן להציג זמן תרגול." : (truth.practice?.reason_he || "זמן תרגול רשמי חסום כי בדוח הנוכחי אין שדה משך זמן רשמי."),
        next: practiceReady ? "להציג בדוחות רק כזמן Moodle רשמי." : "לא לחשב זמן תרגול מהפרשי timestamps ולא להציג אומדן כנתון רשמי.",
        href: "/activity",
        actionLabel: "פתח פעילות / זמנים"
      },
      {
        key: "persistence",
        title: "שמירה קבועה",
        state: persistenceReady ? "Supabase production candidate" : (truth.persistence?.active_mode || "לא מאומת"),
        status: persistenceReady ? "working_partial" : "blocked",
        icon: Database,
        text: truth.persistence?.teacher_message_he || "בודק אם קיימת שמירה קבועה לפי מורה ומרחב, בלי להחזיר secrets או שורות תלמידים.",
        next: persistenceReady ? "להמשיך לבדיקת בידוד מורה/מרחב לפני הפצה." : "להגדיר ולאמת persistence בשרת בלבד, ללא הכנסת service role key לגיט או לצ׳אט.",
        href: "/settings",
        actionLabel: "בדוק הגדרות"
      },
      {
        key: "release",
        title: "Teacher Release",
        state: releaseReady ? "מוכן" : `${blockersCount} חסמים`,
        status: releaseReady ? "working" : "blocked",
        icon: ShieldCheck,
        text: releaseReady ? "כל שערי האמת עברו." : "Teacher Release עדיין NO. אין להפיץ כמוכן לכל מורה עד שכל שערי האמת עוברים.",
        next: releaseReady ? "לתעד אישור הפצה." : "להשלים בידוד מורה/מרחב, בדיקת live, ובדיקת end-to-end אמיתית מתוך Moodle.",
        href: "/missing-data",
        actionLabel: "ראה חסמים"
      }
    ];
  }, [sync.data, truth]);

  const nextActions = useMemo(() => {
    const syncActions = sync.data?.next_actions_he || [];
    const releaseActions = (truth.release?.blockers || [])
      .map(item => item.message_he)
      .filter((item): item is string => Boolean(item));
    return [...syncActions, ...releaseActions].slice(0, 5);
  }, [sync.data?.next_actions_he, truth.release?.blockers]);

  return (
    <section
      className="MTH_DYNAMIC_MOODLE_CAPABILITY_CENTER_V1 rounded-[2rem] border border-primary/10 bg-white/90 p-6 shadow-elegant"
      dir="rtl"
      aria-label="מרכז יכולות Moodle דינמי"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary">מרכז יכולות Moodle חי</h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-muted-foreground">
            הפאנל הזה לא מציג דמו: הוא קורא את מצב המערכת מה־API הקיים ומציג מה עובד, מה חסר, מה חסום ומה הפעולה הבאה.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-black text-primary">אין דמו · אין נתונים מומצאים</span>
          <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-black text-amber-900">Teacher Release: {truth.release?.teacher_release_ready ? "YES" : "NO"}</span>
        </div>
      </div>

      {(truth.loading || sync.loading) && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800">
          <RefreshCw className="h-4 w-4 animate-spin" />
          בודק מצב חי מול שרת Moodle Teacher Hub...
        </div>
      )}

      {(truth.error || sync.error) && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          חלק מבדיקות הסטטוס לא חזרו. לא מוצגים נתונים מומצאים; מוצג fallback בטוח בלבד.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className={`border ${statusClass(item.status)} shadow-sm`}>
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <Icon className="h-6 w-6" />
                  <span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-black">{statusLabel(item.status)}</span>
                </div>
                <CardTitle className="text-lg font-black">{item.title}</CardTitle>
                <div className="text-xs font-black opacity-80">{item.state}</div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm font-semibold leading-relaxed">
                <p>{item.text}</p>
                <p className="text-xs font-black opacity-80">השלב הבא: {item.next}</p>
                <Button asChild variant="outline" size="sm" className="w-full justify-center rounded-xl bg-white/70 font-black">
                  <Link to={item.href}>{item.actionLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <h3 className="mb-3 text-base font-black text-primary">הפעולות הבאות לפי האמת במערכת</h3>
          {nextActions.length ? (
            <div className="grid gap-2">
              {nextActions.map((action, index) => (
                <div key={`${action}-${index}`} className="rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-slate-800">{action}</div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-muted-foreground">אין פעולה הבאה זמינה מה־API כרגע. לא הומצא סטטוס חלופי.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800">
          <h3 className="mb-3 text-base font-black text-slate-950">מקורות אמת חיים</h3>
          <div className="space-y-2">
            <div>Sync: {sync.data?.version || "לא זמין"}</div>
            <div>Capabilities: {truth.capabilities?.version || "לא זמין"}</div>
            <div>Practice time: {truth.practice?.version || "לא זמין"}</div>
            <div>Persistence: {truth.persistence?.version || "לא זמין"}</div>
            <div>Release: {truth.release?.version || "לא זמין"}</div>
            <div>Import batches: {numberText(sync.data?.counts?.import_batches)}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" className="font-black"><Link to="/import">ייבוא דוחות אמת</Link></Button>
            <Button asChild size="sm" variant="outline" className="font-black"><Link to="/missing-data">מה חסר?</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
