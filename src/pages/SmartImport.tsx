import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SafePage } from "@/components/SafePage";
import { parseMoodleFile, type ReportType } from "@/lib/moodleImport";
import { UploadCloud, FileCheck2, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

// MTH_SMART_IMPORT_ASSISTANT_V1
// One drop zone for ALL Moodle reports. The teacher drags any exported file
// (or several); the app auto-detects the report type via the existing
// detectReportType()/parseMoodleFile() and routes each file to the existing
// /api/import endpoint with the correct report_type. No type-picking by the
// teacher, no demo data. Unknown/low-confidence files are flagged honestly and
// NOT imported.

type Phase = "idle" | "parsing" | "importing" | "done" | "error";

const TYPE_HE: Record<ReportType, string> = {
  students: "משתתפים",
  grades: "ציונים",
  logs: "לוגים / פעילות",
  completion: "השלמת פעילויות",
  unknown: "סוג לא זוהה",
};

const TYPE_DEST: Record<ReportType, string> = {
  students: "/students",
  grades: "/grades",
  logs: "/activity",
  completion: "/chapters",
  unknown: "",
};

interface FileResult {
  fileName: string;
  type: ReportType;
  confidence: number;
  rows: number;
  phase: Phase;
  message: string;
  imported: number | null;
}

const MIN_CONFIDENCE = 0.6;

export default function Page() {
  const [results, setResults] = useState<FileResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const importOne = useCallback(async (file: File): Promise<FileResult> => {
    const base: FileResult = {
      fileName: file.name, type: "unknown", confidence: 0, rows: 0,
      phase: "parsing", message: "מנתח את הקובץ...", imported: null,
    };
    let parsed;
    try {
      parsed = await parseMoodleFile(file);
    } catch (e) {
      return { ...base, phase: "error", message: e instanceof Error ? e.message : "שגיאה בקריאת הקובץ" };
    }

    const type = parsed.reportType;
    const confidence = parsed.confidence;
    const rows = Array.isArray(parsed.data) ? parsed.data.length : 0;
    const partial: FileResult = { ...base, type, confidence, rows, phase: "importing", message: "מייבא..." };

    if (type === "unknown" || confidence < MIN_CONFIDENCE) {
      return {
        ...partial, phase: "error",
        message: type === "unknown"
          ? "לא זוהה סוג דוח Moodle מוכר בקובץ זה. לא בוצע ייבוא."
          : `זיהוי לא ודאי (${Math.round(confidence * 100)}%). לא בוצע ייבוא, כדי לא להכניס נתונים שגויים.`,
      };
    }

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          report_type: type,
          source_kind: "file",
          file_name: file.name,
          detection_confidence: confidence,
          payload: parsed.data,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        return {
          ...partial, phase: "error",
          message: json?.error || json?.detail || `הייבוא נכשל (HTTP ${res.status}).`,
        };
      }
      const imported =
        json.supabase?.students_written ??
        json.log_events_written ??
        json.supabase?.log_events_written ??
        json.rows_seen ?? rows;
      return { ...partial, phase: "done", message: "יובא בהצלחה", imported: typeof imported === "number" ? imported : rows };
    } catch (e) {
      return { ...partial, phase: "error", message: e instanceof Error ? e.message : "שגיאת רשת בייבוא" };
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setBusy(true);
    setResults(arr.map((f) => ({
      fileName: f.name, type: "unknown", confidence: 0, rows: 0,
      phase: "parsing", message: "ממתין...", imported: null,
    })));
    const out: FileResult[] = [];
    for (let i = 0; i < arr.length; i++) {
      const r = await importOne(arr[i]);
      out.push(r);
      setResults([...out, ...arr.slice(i + 1).map((f) => ({
        fileName: f.name, type: "unknown" as ReportType, confidence: 0, rows: 0,
        phase: "parsing" as Phase, message: "ממתין...", imported: null,
      }))]);
    }
    setResults(out);
    setBusy(false);
  }, [importOne]);

  return (
    <SafePage
      title="ייבוא חכם"
      description="גרור קובץ דוח Moodle — המערכת מזהה את הסוג ומייבאת אוטומטית."
    >
      <div className="space-y-5" dir="rtl">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!busy) handleFiles(e.dataTransfer.files); }}
          onClick={() => !busy && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition ${
            dragOver ? "border-primary bg-primary/5" : "border-slate-300 bg-slate-50 hover:border-primary/50"
          } ${busy ? "pointer-events-none opacity-70" : ""}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {busy ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
          </span>
          <div className="text-lg font-extrabold text-slate-900">
            {busy ? "מעבד קבצים..." : "גרור קבצים לכאן או לחץ לבחירה"}
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            משתתפים, ציונים, לוגים, השלמת פעילויות — אפשר כמה קבצים יחד.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.ods"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.currentTarget.value = ""; }}
          />
        </div>

        {results.length > 0 && (
          <section className="space-y-2">
            {results.map((r, i) => {
              const ok = r.phase === "done";
              const err = r.phase === "error";
              const working = r.phase === "parsing" || r.phase === "importing";
              const dest = TYPE_DEST[r.type];
              return (
                <div key={`${r.fileName}-${i}`} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 ${ok ? "text-green-600" : err ? "text-red-600" : "text-slate-400"}`}>
                        {ok ? <CheckCircle2 className="h-5 w-5" /> : err ? <XCircle className="h-5 w-5" /> : working ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileCheck2 className="h-5 w-5" />}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{r.fileName}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {TYPE_HE[r.type]}
                          {r.confidence > 0 && r.type !== "unknown" ? ` · זוהה ב-${Math.round(r.confidence * 100)}%` : ""}
                          {r.rows > 0 ? ` · ${r.rows} שורות` : ""}
                        </div>
                        <div className={`mt-1 text-xs ${err ? "text-red-700" : ok ? "text-green-700" : "text-muted-foreground"}`}>
                          {r.message}
                          {ok && r.imported != null ? ` · ${r.imported} רשומות נכתבו` : ""}
                        </div>
                      </div>
                    </div>
                    {ok && dest && (
                      <Link to={dest} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5">
                        צפה
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          <div className="mb-1 flex items-center gap-2 font-extrabold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            איך משיגים את הקבצים בקלות
          </div>
          <p>
            לא בטוח איזה דוח חסר ומאיפה להוריד אותו? עבור ל-
            <Link to="/missing-data" className="font-bold text-primary hover:underline"> מה חסר</Link>,
            שם יש קישורים ישירים לדוחות ה-Moodle המדויקים של הקורס שלך — לחיצה אחת פותחת את הדוח להורדה,
            ואז גוררים את הקובץ לכאן.
          </p>
        </section>
      </div>
    </SafePage>
  );
}
