import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Zap, AlertTriangle, ArrowLeftRight } from "lucide-react";

// MTH_AUTO_EXTRACTION_SOURCE_ROUTER_UI_V1
// Reads ONLY from /api/automation/auto-extraction/sources (aggregate, sanitized).
// No raw rows, no secrets. Hebrew RTL automation-first picture.

type AutomationLevel = "AUTOMATIC" | "AUTOMATIC_READY" | "SEMI_AUTOMATIC" | "BLOCKED" | "REFUSE";

interface DomainRoute {
  domainId: string;
  labelHe: string;
  bestCurrentSource: string;
  automationLevel: AutomationLevel;
  isAutomaticNow: boolean;
  isSemiAutoFallback: boolean;
  isBlocked: boolean;
  evidenceType: string;
  provingSignalHe: string;
  whatIsMissingHe: string | null;
  teacherSeesHe: string;
  adminEnablementHe: string | null;
  fallbackRoute: string | null;
  routeAction: string;
  mayShowDataNow: boolean;
  mustRefuseToCalculate: boolean;
}

interface SourceMap {
  ok: boolean;
  version: string;
  teacher_release: string;
  generated_at: string;
  domains: DomainRoute[];
  summary: {
    automatic_now_he: string[];
    automatic_ready_he: string[];
    semi_auto_fallback_he: string[];
    blocked_he: string[];
    next_best_automation_step_he: string;
  };
}

const LEVEL_META: Record<AutomationLevel, { label: string; cls: string }> = {
  AUTOMATIC: { label: "נשלף אוטומטית", cls: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  AUTOMATIC_READY: { label: "מוכן לאוטומציה", cls: "bg-sky-100 text-sky-900 border-sky-300" },
  SEMI_AUTOMATIC: { label: "ייבוא דוח אמיתי", cls: "bg-amber-100 text-amber-900 border-amber-300" },
  BLOCKED: { label: "נדרש מנהל מערכת", cls: "bg-rose-100 text-rose-900 border-rose-300" },
  REFUSE: { label: "לא ניתן לחשב", cls: "bg-zinc-200 text-zinc-900 border-zinc-400" },
};

// MTH_TEACHER_PLAIN_LANGUAGE_V1
// Display-layer only: the Truth Engine returns technically precise text (API
// names, env vars) for auditing. Teachers should not see developer jargon, so
// we translate those phrases to plain Hebrew at render time. This does NOT
// change any capability logic or status — only how the existing text reads.
function plainHe(text: string | null | undefined): string {
  if (!text) return "";
  let t = text;
  const replacements: Array<[RegExp, string]> = [
    [/core_enrol_get_enrolled_users/gi, "שליפת רשימת תלמידים"],
    [/core_webservice_get_site_info/gi, "בדיקת חיבור למערכת"],
    [/core_grades?_get_grades?/gi, "שליפת ציונים"],
    [/MOODLE_WS_TOKEN/g, "הרשאת חיבור אוטומטי"],
    [/Web Services/gi, "חיבור אוטומטי"],
    [/REST protocol|REST/gi, "חיבור אוטומטי"],
    [/\bAGS\b/g, "שירות הציונים של Moodle"], [/Moodle ישלח AGS בהפעלה חיה/g, "כאשר Moodle יחשוף את הרשאת הציונים, הם יישלפו אוטומטית"],
    [/\bNRPS\b/g, "רשימת המשתתפים של Moodle"],
    [/\btoken\b/gi, "הרשאה"],
    [/\bRender\b/g, "השרת"],
    [/core_completion/g, "שירות השלמת פעילויות"],
    [/core_webservice/g, "שירות חיבור"],
    [/Assignment and Grade Services?/gi, "שירות הציונים"],
    [/LTI Advantage/g, "חיבור מתקדם"],
    [/namesroleservice/gi, "שירות רשימת תלמידים"],
    [/\bendpoint\b/gi, "שירות"],
    [/\bscope[s]?\b/gi, "הרשאות"],
  ];
  for (const [re, rep] of replacements) t = t.replace(re, rep);
  // Collapse leftover double spaces from replacements.
  return t.replace(/\s{2,}/g, " ").trim();
}

export default function AutoExtractionSourceRouterSection() {
  const [data, setData] = useState<SourceMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/automation/auto-extraction/sources", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((j) => { if (live) { setData(j); setLoading(false); } })
      .catch((e) => { if (live) { setError(String(e?.message || e)); setLoading(false); } });
    return () => { live = false; };
  }, []);

  if (loading) {
    return (
      <Card className="rounded-3xl border bg-white p-5 shadow-sm">
        <CardContent className="p-2 text-sm text-slate-500">טוען מפת מקורות אוטומציה…</CardContent>
      </Card>
    );
  }
  if (error || !data?.ok) {
    return (
      <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <CardContent className="p-2 text-sm font-bold text-rose-900">
          לא ניתן לטעון את מפת מקורות האוטומציה כעת.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border bg-white p-5 shadow-sm" dir="rtl">
      <span className="sr-only">MTH_AUTO_EXTRACTION_SOURCE_ROUTER_UI_V1</span>
      <CardHeader>
        <CardTitle className="text-lg font-extrabold flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-sky-700" />
          מפת מקורות אוטומציה — מאיפה נשלף כל סוג נתון
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary chips */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryBox icon={<Zap className="h-4 w-4" />} title="נשלף אוטומטית" items={data.summary.automatic_now_he.map(plainHe)} cls="border-emerald-200 bg-emerald-50 text-emerald-900" />
          <SummaryBox icon={<Workflow className="h-4 w-4" />} title="מוכן לאוטומציה" items={data.summary.automatic_ready_he.map(plainHe)} cls="border-sky-200 bg-sky-50 text-sky-900" />
          <SummaryBox icon={<Workflow className="h-4 w-4" />} title="ייבוא דוח אמיתי" items={data.summary.semi_auto_fallback_he.map(plainHe)} cls="border-amber-200 bg-amber-50 text-amber-900" />
          <SummaryBox icon={<AlertTriangle className="h-4 w-4" />} title="חסום" items={data.summary.blocked_he.map(plainHe)} cls="border-rose-200 bg-rose-50 text-rose-900" />
        </div>

        {/* Next best step */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-900">
          הצעד הבא לאוטומציה: {plainHe(data.summary.next_best_automation_step_he)}
        </div>

        {/* Domain rows */}
        <div className="space-y-2">
          {data.domains.map((d) => {
            const meta = LEVEL_META[d.automationLevel];
            return (
              <div key={d.domainId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-extrabold text-slate-800">{d.labelHe}</div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${meta.cls}`}>{d.teacherSeesHe}</span>
                </div>
                <div className="mt-2 text-xs leading-relaxed text-slate-600">{plainHe(d.provingSignalHe)}</div>
                {d.whatIsMissingHe && (
                  <div className="mt-1 text-xs text-slate-500">חסר: {plainHe(d.whatIsMissingHe)}</div>
                )}
                {d.adminEnablementHe && (
                  <div className="mt-1 text-xs text-slate-500">להפעלת מנהל: {plainHe(d.adminEnablementHe)}</div>
                )}
                {d.fallbackRoute && (
                  <a href={d.fallbackRoute} className="mt-2 inline-block text-xs font-bold text-sky-700 underline">
                    מסלול ייבוא אמיתי ←
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-slate-400">
          גרסה: {data.version} · Teacher Release: {data.teacher_release} · נתונים אגרגטיביים בלבד, ללא מידע אישי.
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryBox({ icon, title, items, cls }: { icon: React.ReactNode; title: string; items: string[]; cls: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="flex items-center gap-2 text-xs font-black">{icon}{title}</div>
      <div className="mt-1 text-2xl font-black">{items.length}</div>
      {items.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pr-4 text-[11px] font-semibold">
          {items.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}
