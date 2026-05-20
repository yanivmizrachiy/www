import { useEffect, useMemo, useState } from "react";
import { SafePage } from "@/components/SafePage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BookOpen, Link2, Users, Zap } from "lucide-react";

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

    load();
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
      description="מרכז בקרה חדש שמראה את סטטוס ה-LTI, הייבוא הקיים וקישורי יעד לדוחות לפי מזהה קורס. סנכרון API מלא עדיין לא הופעל."
    >
      <div className="space-y-6" dir="rtl">
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
