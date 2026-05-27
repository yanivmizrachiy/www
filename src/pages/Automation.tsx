import { useEffect, useMemo, useState } from "react";
import { SafePage } from "@/components/SafePage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BookOpen, Link2, Server, Users, Zap } from "lucide-react";
import AutomationStatusPanel from "@/components/AutomationStatusPanel";
import { formatTeacherDateTime } from "@/lib/teacherDateFormat";
import AutoExtractionSourceRouterSection from "@/components/AutoExtractionSourceRouterSection";

interface AutomationCapabilities {
  ok: boolean;
  connected: boolean;
  teacherName: string | null;
  moodleUsername: string | null;
  courseId: string | null;
  courseName: string | null;
  ltiSessionAvailable: boolean;
  importsAvailable: {
    participants: boolean;
    gradebook: boolean;
    logs: boolean;
    courseStructure: boolean;
  };
  automationLevels: {
    ltiContext: string;
    manualReports: string;
    exportLinks: string;
    moodleWebServices: string;
    autoSync: string;
  };
  teacherRelease: boolean;
  warnings: string[];
  nextBestAction: string;
}

interface WsReadinessData {
  ok: boolean;
  version: string;
  configured: boolean;
  verified: boolean;
  status: string;
  host: string | null;
  function_checked: string | null;
  checkedAt: string | null;
  failure_category: string | null;
  moodle_release: string | null;
  functions_available_count: number | null;
  required_admin_steps: string[];
}

interface AutomationExportLinks {
  ok: boolean;
  courseId: string;
  links: {
    activityCompletion: string;
    gradebook: string;
    gradebookExport: string;
    logs: string;
    participants: string;
  };
}

const WS_STATUS: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  verified_site_info:          { label: "✓ Web Services מחוברים ומאומתים.", tone: "green" },
  missing_env:                 { label: "Web Services לא מוגדרים — נדרשת פעולת מנהל.", tone: "amber" },
  invalid_token:               { label: "Token שגוי — בדוק את ההגדרות ב-Render.", tone: "red" },
  blocked_by_admin_enablement: { label: "Web Services כבויים ב-Moodle — נדרשת פעולת מנהל.", tone: "amber" },
  http_error:                  { label: "שגיאת HTTP מ-Moodle.", tone: "red" },
  network_error:               { label: "שגיאת רשת — לא ניתן להגיע ל-Moodle.", tone: "red" },
  timeout:                     { label: "Moodle לא הגיב בזמן — נסה שוב.", tone: "amber" },
  json_parse_error:            { label: "Moodle החזיר תגובה שאינה JSON.", tone: "red" },
  moodle_error:                { label: "Moodle החזיר שגיאה.", tone: "red" },
  runtime_error:               { label: "שגיאה פנימית בשרת.", tone: "red" },
};

const WS_TONE_CLASSES: Record<"green" | "amber" | "red", { border: string; bg: string; text: string; badge: string }> = {
  green: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-900", badge: "bg-emerald-100 text-emerald-800" },
  amber: { border: "border-amber-200",   bg: "bg-amber-50",   text: "text-amber-900",  badge: "bg-amber-100 text-amber-800"   },
  red:   { border: "border-red-200",     bg: "bg-red-50",     text: "text-red-900",    badge: "bg-red-100 text-red-800"       },
};

const STATUS_LABELS: Record<string, string> = {
  available: "זמין",
  missing: "חסר",
  configured: "מוגדר",
  not_verified: "טרם אומת",
};

const IMPORT_LABELS: Record<string, string> = {
  participants: "משתתפים",
  gradebook: "Gradebook",
  logs: "יומנים",
  courseStructure: "מבנה קורס / השלמת פעילות",
};

export default function Automation() {
  const [capabilities, setCapabilities] = useState<AutomationCapabilities | null>(null);
  const [exportLinks, setExportLinks] = useState<AutomationExportLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [wsReadiness, setWsReadiness] = useState<WsReadinessData | null>(null);
  const [wsLoading, setWsLoading] = useState(true);

  useEffect(() => {
    let live = true;

    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await fetch("/api/automation/capabilities", {
          headers: { Accept: "application/json" },
        });
        const json = await response.json();
        if (!live) return;
        setCapabilities(json);

        if (json?.courseId) {
          const linksRes = await fetch("/api/automation/export-links", {
            headers: { Accept: "application/json" },
          });
          const linksJson = await linksRes.json();
          if (live && linksJson?.ok) setExportLinks(linksJson);
        }

        setLoading(false);
      } catch (error) {
        if (!live) return;
        setFetchError(error instanceof Error ? error.message : "שגיאת רשת");
        setLoading(false);
      }
    }

    async function loadWsReadiness() {
      try {
        const res = await fetch("/api/automation/moodle-webservices/readiness", {
          headers: { Accept: "application/json" },
        });
        const json = await res.json();
        if (live) setWsReadiness(json);
      } catch {
        if (live) setWsReadiness(null);
      } finally {
        if (live) setWsLoading(false);
      }
    }

    load();
    loadWsReadiness();
    return () => { live = false; };
  }, []);

  const summaryRows = useMemo(() => {
    if (!capabilities) return [];
    return [
      { label: "סטטוס חיבור Moodle", value: capabilities.connected ? "מחובר" : "לא מחובר", tone: capabilities.connected ? "green" : "orange" },
      { label: "זיהוי קורס", value: capabilities.courseId ?? "לא זוהה" },
      { label: "שם קורס", value: capabilities.courseName ?? "לא התקבל" },
      { label: "שם מורה", value: capabilities.teacherName ?? capabilities.moodleUsername ?? "לא התקבל" },
    ];
  }, [capabilities]);

  const importItems = useMemo(() => {
    if (!capabilities) return [];
    return Object.entries(capabilities.importsAvailable).map(([key, available]) => ({
      key,
      label: IMPORT_LABELS[key] ?? key,
      available,
    }));
  }, [capabilities]);

  const automationItems = useMemo(() => {
    if (!capabilities) return [];
    return Object.entries(capabilities.automationLevels).map(([key, status]) => ({
      key,
      label: {
        ltiContext: "LTI context",
        manualReports: "דוחות ידניים אמיתיים",
        exportLinks: "קישורי יעד לדוחות",
        moodleWebServices: "Moodle Web Services",
        autoSync: "סנכרון אוטומטי",
      }[key] ?? key,
      status,
    }));
  }, [capabilities]);

  return (
    <SafePage
      title="אוטומציה ממודל"
      description="סטטוס החיבור, הייבוא והנתונים הזמינים אוטומטית."
      backTo="-1"
    >
      <div className="space-y-6" dir="rtl">
        <AutomationStatusPanel />
        <AutoExtractionSourceRouterSection />

        {loading && (
          <Card className="border border-slate-200 bg-white p-4 shadow-sm">
            <CardContent className="text-sm text-slate-600">טוען סטטוס אוטומציה...</CardContent>
          </Card>
        )}

        {fetchError && (
          <Card className="rounded-3xl border border-destructive/20 bg-destructive/5 p-4 text-destructive shadow-sm">
            <CardContent>{`שגיאה בטעינת מרכז האוטומציה: ${fetchError}`}</CardContent>
          </Card>
        )}

        {!loading && capabilities && (
          <div className="space-y-6">
            <Card className="rounded-3xl border bg-white p-5 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                  מרכז אוטומציה ממודל
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {summaryRows.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                      <div className={`mt-2 text-sm font-bold ${item.tone === "green" ? "text-emerald-700" : item.tone === "orange" ? "text-amber-700" : "text-slate-900"}`}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {capabilities.warnings.length > 0 && (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="font-semibold">הערות סטטוס</div>
                    <ul className="mt-2 list-disc space-y-1 pr-4 text-sm">
                      {capabilities.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-50">
                  <div className="font-semibold text-white">הערת אמת חשובה</div>
                  <p className="mt-2 leading-relaxed">סנכרון API מלא עדיין לא הופעל. בשלב זה המערכת מסייעת להגיע לדוחות האמיתיים ולהעלות אותם במהירות.</p>
                </div>
              </CardContent>
            </Card>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-3xl border bg-white p-5 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-foreground" />
                    ייבוא קיים
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {importItems.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-slate-200 p-4">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className={`mt-2 text-sm font-semibold ${item.available ? "text-emerald-700" : "text-slate-500"}`}>
                        {item.available ? "קיים" : "לא קיים"}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border bg-white p-5 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary-foreground" />
                    רמת אוטומציה
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {automationItems.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-slate-200 p-4">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {STATUS_LABELS[item.status] ?? item.status}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <Card className="rounded-3xl border bg-white p-5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary-foreground" />
                  קישורי יעד לדוחות Moodle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!capabilities.courseId && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                    יש לפתוח את הכלי מתוך מרחב Moodle כדי לזהות את Course ID ולבנות קישורי יעד לדוחות לפי מזהה קורס.
                  </div>
                )}

                {capabilities.courseId && exportLinks && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a href={exportLinks.links.activityCompletion} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Activity Completion
                    </a>
                    <a href={exportLinks.links.gradebook} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Gradebook (Grader)
                    </a>
                    <a href={exportLinks.links.gradebookExport} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Gradebook Export
                    </a>
                    <a href={exportLinks.links.logs} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Logs
                    </a>
                    <a href={exportLinks.links.participants} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Participants
                    </a>
                  </div>
                )}

                {capabilities.courseId && !exportLinks && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    טוען קישורי יעד לדוחות... יש לרענן אם זה לוקח זמן.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="MTH_WS_READINESS_CARD_V1 rounded-3xl border bg-white p-5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <Server className="h-5 w-5 text-slate-600" />
                  Moodle Web Services — סטטוס חיבור
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wsLoading && (
                  <div className="text-sm text-slate-500">בודק סטטוס Web Services...</div>
                )}
                {!wsLoading && !wsReadiness && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    לא ניתן לטעון את סטטוס Web Services. נסה לרענן את הדף.
                  </div>
                )}
                {!wsLoading && wsReadiness && (() => {
                  const entry = WS_STATUS[wsReadiness.status] ?? { label: `סטטוס לא מוכר: ${wsReadiness.status}`, tone: "red" as const };
                  const cls = WS_TONE_CLASSES[entry.tone];
                  return (
                    <div className="space-y-4">
                      <div className={`rounded-2xl border ${cls.border} ${cls.bg} p-4`}>
                        <div className={`text-sm font-bold ${cls.text}`}>{entry.label}</div>
                        {wsReadiness.host && (
                          <div className="mt-2 text-xs text-slate-500">שרת Moodle: <span className="font-mono">{wsReadiness.host}</span></div>
                        )}
                        {wsReadiness.verified && wsReadiness.moodle_release && (
                          <div className="mt-1 text-xs text-slate-500">גרסת Moodle: {wsReadiness.moodle_release}</div>
                        )}
                        {wsReadiness.verified && typeof wsReadiness.functions_available_count === "number" && (
                          <div className="mt-1 text-xs text-slate-500">פונקציות זמינות: {wsReadiness.functions_available_count}</div>
                        )}
                      </div>
                      {!wsReadiness.verified && wsReadiness.required_admin_steps?.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-2 text-xs font-bold text-slate-700">פעולות נדרשות מהמנהל:</div>
                          <ul className="list-disc space-y-1 pr-4 text-xs text-slate-600">
                            {wsReadiness.required_admin_steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs text-slate-400">
                        גרסת endpoint: {wsReadiness.version ?? "—"} · נבדק: {wsReadiness.checkedAt ? formatTeacherDateTime(wsReadiness.checkedAt) : "—"}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border bg-white p-5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                  הפעולה הבאה המומלצת
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-slate-700">
                {capabilities.nextBestAction}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SafePage>
  );
}
