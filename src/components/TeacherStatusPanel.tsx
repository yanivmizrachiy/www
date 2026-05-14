import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

const L = {
  statusTitle:      "סטטוס חיבור ויכולות",
  activeBlockers:   "חסמים פעילים:",
  noActiveBlockers: "אין חסמים פעילים",
  availableNow:     "מה זמין עכשיו",
  missingNow:       "מה חסר",
  connectionStatus: "סטטוס חיבור",
  practiceTime:     "זמן תרגול",
  capabilities:     "יכולות",
  connected:        "מחובר",
  notConnected:     "לא מחובר",
  dataAvailable:    "נתונים זמינים",
  dataMissing:      "חסרים נתונים",
  releaseReady:     "מוכן לשחרור",
  notReleaseReady:  "לא מוכן לשחרור",
  loading:          "טוען...",
  errorPrefix:      "שגיאה:",
};

const BLOCKER_HE: Record<string, string> = {
  missing_moodle_launch:       "לא ניתן להציג את מרכז המורה ללא פתיחה אמיתית מתוך Moodle.",
  missing_participants_report:  "חסר דוח משתתפים",
  missing_gradebook_report:     "חסר דוח ציונים",
  missing_logs_report:          "לא ניתן לחשב זמן תרגול ללא לוגים.",
  no_lti_configured:            "לא הוגדר LTI",
  moodle_ws_token_missing:      "חסר טוקן Moodle WS",
  missing_log_data:             "חסרים נתוני לוג",
  not_enough_log_events:        "אין מספיק אירועי לוג",
};

interface StatusBundle {
  dashCtx:      Record<string, unknown> | null;
  caps:         Record<string, unknown> | null;
  practiceTime: Record<string, unknown> | null;
  release:      Record<string, unknown> | null;
}

function useTeacherStatus() {
  const [bundle, setBundle] = useState<StatusBundle>({
    dashCtx: null, caps: null, practiceTime: null, release: null,
  });
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([
      fetch("/api/teacher/dashboard-context").then(r => r.json()),
      fetch("/api/capabilities/status").then(r => r.json()),
      fetch("/api/practice-time/status").then(r => r.json()),
      fetch("/api/release/readiness").then(r => r.json()),
    ])
      .then(([dashCtx, caps, practiceTime, release]) => {
        if (live) { setBundle({ dashCtx, caps, practiceTime, release }); setLoading(false); }
      })
      .catch((e: unknown) => {
        if (live) {
          setFetchError(e instanceof Error ? e.message : "fetch error");
          setLoading(false);
        }
      });
    return () => { live = false; };
  }, []);

  return { bundle, loading, fetchError };
}

export default function TeacherStatusPanel() {
  const { bundle, loading, fetchError } = useTeacherStatus();

  if (loading) {
    return (
      <Card className="shadow-elegant border-none bg-muted/30">
        <CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {L.loading}
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card className="shadow-elegant border border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {L.errorPrefix} {fetchError}
        </CardContent>
      </Card>
    );
  }

  const ctx  = bundle.dashCtx      as { connection_status?: string; blocker_keys?: string[] } | null;
  const caps = bundle.caps          as { available_capabilities?: string[]; missing_capabilities?: string[]; blocker_keys?: string[] } | null;
  const pt   = bundle.practiceTime  as { gate_passed?: boolean; blocker_keys?: string[] } | null;
  const rel  = bundle.release       as { ready?: boolean; blocker_keys?: string[] } | null;

  const allBlockers = [...new Set([
    ...(ctx?.blocker_keys  ?? []),
    ...(caps?.blocker_keys ?? []),
    ...(pt?.blocker_keys   ?? []),
    ...(rel?.blocker_keys  ?? []),
  ])];

  return (
    <Card className="shadow-elegant border-none bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          {L.statusTitle}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rel?.ready ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {rel?.ready ? L.releaseReady : L.notReleaseReady}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-background/60 p-2 space-y-0.5">
            <div className="text-muted-foreground">{L.connectionStatus}</div>
            <div className={`font-bold ${ctx?.connection_status === "connected" ? "text-green-700" : "text-destructive"}`}>
              {ctx?.connection_status === "connected" ? L.connected : L.notConnected}
            </div>
          </div>
          <div className="rounded-lg bg-background/60 p-2 space-y-0.5">
            <div className="text-muted-foreground">{L.practiceTime}</div>
            <div className={`font-bold ${pt?.gate_passed ? "text-green-700" : "text-yellow-700"}`}>
              {pt?.gate_passed ? L.dataAvailable : L.dataMissing}
            </div>
          </div>
          <div className="rounded-lg bg-background/60 p-2 space-y-0.5">
            <div className="text-muted-foreground">{L.availableNow}</div>
            <div className="font-bold">{caps?.available_capabilities?.length ?? 0} {L.capabilities}</div>
          </div>
          <div className="rounded-lg bg-background/60 p-2 space-y-0.5">
            <div className="text-muted-foreground">{L.missingNow}</div>
            <div className="font-bold">{caps?.missing_capabilities?.length ?? 0} {L.capabilities}</div>
          </div>
        </div>

        {allBlockers.length > 0 ? (
          <div className="space-y-1">
            <div className="text-xs font-bold text-muted-foreground">{L.activeBlockers}</div>
            {allBlockers.map(key => (
              <div key={key} className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/15 px-3 py-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {BLOCKER_HE[key] ?? key}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-medium text-green-700">{L.noActiveBlockers}</div>
        )}
      </CardContent>
    </Card>
  );
}
