// MTH_AUTOMATION_STATUS_PANEL_V1
// Truth Engine consumer — reads only from automationCapabilityGovernance.ts.
// No imports from automationCapabilities.ts.
// No hardcoded statuses. No invented capabilities. No fake live evidence.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getGovernedTeacherVisibleCapabilities,
  type GovernedCapability,
} from "@/lib/automationCapabilityGovernance";

// ─── Display config ───────────────────────────────────────────────────────────

const STATUS_DISPLAY: Record<string, { label: string; badgeCls: string; cardCls: string }> = {
  AUTO: {
    label: "אוטומטי",
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cardCls: "border-emerald-200 bg-emerald-50",
  },
  SEMI_AUTO: {
    label: "חצי-אוטומטי",
    badgeCls: "bg-blue-100 text-blue-800 border-blue-200",
    cardCls: "border-blue-200 bg-blue-50",
  },
  BLOCKED: {
    label: "חסום",
    badgeCls: "bg-amber-100 text-amber-800 border-amber-200",
    cardCls: "border-amber-200 bg-amber-50",
  },
  UNKNOWN: {
    label: "לא ידוע",
    badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
    cardCls: "border-slate-200 bg-slate-50",
  },
};

const EVIDENCE_DISPLAY: Record<string, { label: string; cls: string }> = {
  audit:    { label: "מאומת בקוד",  cls: "bg-slate-100 text-slate-600" },
  live:     { label: "מאומת חי",    cls: "bg-emerald-100 text-emerald-800" },
  inferred: { label: "נגזר",         cls: "bg-slate-100 text-slate-500" },
  missing:  { label: "חסר אימות",   cls: "bg-orange-100 text-orange-800" },
};

// Maps allowedTeacherAction value → import page route
const ACTION_ROUTES: Record<string, string> = {
  import_participants_report:     "/import",
  import_gradebook_report:        "/gradebook-import",
  import_logs_report:             "/logs-import",
  import_course_structure_report: "/course-structure-import",
};

// ─── Display mode ─────────────────────────────────────────────────────────────

type DisplayMode = "displayOnly" | "teacherAction" | "adminAction" | "hidden";

function resolveDisplayMode(cap: GovernedCapability): DisplayMode {
  if (!cap.teacherVisible) return "hidden";
  if (cap.status === "BLOCKED") return "adminAction";
  if (cap.allowedTeacherActions.length > 0) return "teacherAction";
  return "displayOnly";
}

function resolveImportRoute(cap: GovernedCapability): string | null {
  for (const action of cap.allowedTeacherActions) {
    const route = ACTION_ROUTES[action];
    if (route) return route;
  }
  return null;
}

// ─── Single capability card ───────────────────────────────────────────────────

function CapabilityCard({ cap }: { cap: GovernedCapability }) {
  const mode = resolveDisplayMode(cap);
  if (mode === "hidden") return null;

  const sd = STATUS_DISPLAY[cap.status] ?? STATUS_DISPLAY.UNKNOWN;
  const ed = EVIDENCE_DISPLAY[cap.evidenceType] ?? EVIDENCE_DISPLAY.missing;
  const importRoute = resolveImportRoute(cap);

  return (
    <Card className={`border ${sd.cardCls} shadow-sm`}>
      <CardHeader className="pb-2 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base font-black leading-snug">{cap.labelHe}</CardTitle>
          <div className="flex flex-wrap gap-1">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${sd.badgeCls}`}>
              {sd.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ed.cls}`}>
              {ed.label}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-4 text-sm">
        {cap.teacherActionHe && (
          <p className="font-semibold text-slate-800">{cap.teacherActionHe}</p>
        )}
        {cap.blockedReasonHe && (
          <p className="font-semibold text-amber-900">{cap.blockedReasonHe}</p>
        )}
        {mode === "teacherAction" && importRoute && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-1 w-full rounded-xl font-black"
          >
            <Link to={importRoute}>
              <FileUp className="ml-2 h-3.5 w-3.5" />
              ייבא עכשיו
            </Link>
          </Button>
        )}
        {mode === "adminAction" && (
          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              יכולת זו דורשת הפעלת Web Services ב-Moodle על ידי מנהל המערכת.
            </div>
            {cap.id === "ags_grades" && (
              <Button asChild variant="outline" size="sm" className="w-full rounded-xl font-black border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link to="/gradebook-import"><FileUp className="ml-2 h-3.5 w-3.5" />ייבא Gradebook ידנית במקום</Link>
              </Button>
            )}
            {cap.id === "nrps_participants" && (
              <Button asChild variant="outline" size="sm" className="w-full rounded-xl font-black border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link to="/import"><FileUp className="ml-2 h-3.5 w-3.5" />ייבא משתתפים ידנית במקום</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function AutomationStatusPanel() {
  const capabilities = useMemo(() => getGovernedTeacherVisibleCapabilities(), []);

  return (
    <section
      className="MTH_AUTOMATION_STATUS_PANEL_V1 space-y-4 rounded-[2rem] border border-primary/10 bg-white/90 p-6 shadow-elegant"
      dir="rtl"
      aria-label="פאנל סטטוס יכולות אוטומציה"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-primary">
            <BookOpen className="h-5 w-5" />
            סטטוס יכולות אוטומציה
          </h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
          <Info className="h-3.5 w-3.5" />
          Teacher Release: לא
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((cap) => (
          <CapabilityCard key={cap.id} cap={cap} />
        ))}
      </div>
    </section>
  );
}

