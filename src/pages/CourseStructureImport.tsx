import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";
import { getLtiToken } from "@/hooks/useLtiSession";

const MARKER = "MTH_COURSE_STRUCTURE_IMPORT_UI_V1";

const IDENTITY_NORMALIZED = new Set([
  "שםפרטי", "firstname", "first_name",
  "שםמשפחה", "surname", "lastname", "last_name",
  "שםמלא", "fullname", "name", "שם",
  "מספרזיהוי", "מספרזהות", "מספרמזהה", "idnumber",
  "כתובתדואל", "כתובתדוא״ל", "דואל", "דוא״ל", "דואראלקטרוני",
  "emailaddress", "email",
  "שםמשתמש", "username", "login",
  "מוסד", "institution",
  "מחלקה", "department",
  "תאריךהפקתהדוח", "dateofreport",
]);

const SECTION_COLUMN_NORMALIZED = new Set([
  "פרק", "section", "sections", "sectionname", "chapter", "chaptername", "סעיף", "קטע", "יחידה",
]);

function normalize(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[‎‏"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function isIdentityHeader(h: string): boolean {
  return IDENTITY_NORMALIZED.has(normalize(h));
}

function isSectionColumn(h: string): boolean {
  return SECTION_COLUMN_NORMALIZED.has(normalize(h));
}

type ParseResult = {
  fileName?: string;
  rowCount?: number;
  confidence?: number;
  headers?: string[];
  data?: Array<Record<string, unknown>>;
  rows?: Array<Record<string, unknown>>;
};

type ImportResult = {
  ok: boolean;
  error?: string;
  detail?: string;
  batch_id?: string;
  rows_seen?: number;
  activity_headers_detected?: number;
  sections_found?: number;
  sections_written?: number;
  tasks_written?: number;
  completions_written?: number;
  skipped_students?: number;
  section_column_used?: string | null;
  warnings?: string[];
  supabase?: {
    written?: boolean;
    reason?: string;
    sections_written?: number;
    tasks_written?: number;
    completions_written?: number;
    completions_skipped?: boolean;
  };
};

function buildProfile(result: ParseResult | null) {
  const headers = result?.headers || [];
  const sectionCol = headers.find(isSectionColumn) ?? null;
  const activityHeaders = headers.filter(h => !isIdentityHeader(h) && !isSectionColumn(h));
  const hasStudentName =
    headers.some(h => normalize(h) === "שםפרטי" || normalize(h) === "firstname") &&
    headers.some(h => normalize(h) === "שםמשפחה" || normalize(h) === "surname" || normalize(h) === "lastname");
  const hasIdentity =
    hasStudentName ||
    headers.some(h => normalize(h) === "שםמלא" || normalize(h) === "fullname");

  return {
    marker: MARKER,
    report_type: "activity-completion",
    file_name: result?.fileName || null,
    rows_seen: result?.rowCount || 0,
    confidence: result?.confidence || 0,
    headers_count: headers.length,
    activity_columns_count: activityHeaders.length,
    activity_columns_preview: activityHeaders.slice(0, 10),
    section_column: sectionCol,
    required_ok: hasIdentity && activityHeaders.length > 0,
    safety: {
      no_tasks_saved_until_import_button: true,
      no_fake_sections: true,
      no_sql: true,
      no_teacher_release_change: true,
    },
  };
}

function copyText(text: string) {
  try { navigator.clipboard?.writeText(text); } catch {}
}

async function postCourseStructureImport(result: ParseResult): Promise<ImportResult> {
  const token = getLtiToken();
  if (!token) return { ok: false, error: "NO_VERIFIED_MOODLE_SESSION", detail: "פתח את הכלי מתוך Moodle ואז נסה שוב." };

  const rows = (result.data || result.rows || []) as Array<Record<string, unknown>>;
  const res = await fetch("/api/import/course-structure", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-lti-session": token },
    credentials: "include",
    body: JSON.stringify({
      token,
      file_name: result.fileName,
      source_kind: result.fileName ? "upload" : "paste",
      detection_confidence: result.confidence,
      payload: rows,
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!payload) return { ok: false, error: "INVALID_SERVER_RESPONSE" };
  return payload as ImportResult;
}

const box: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
  background: "#fff",
  boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
};

const button: CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "12px 20px",
  fontWeight: 800,
  cursor: "pointer",
  background: "#0ea5e9",
  color: "white",
};

const mutedButton: CSSProperties = {
  ...button,
  background: "#eef2ff",
  color: "#1e3a8a",
};

const successBox: CSSProperties = {
  border: "1px solid #bbf7d0",
  borderRadius: 16,
  padding: 14,
  background: "#f0fdf4",
  color: "#14532d",
  fontWeight: 700,
};

const errorBox: CSSProperties = {
  border: "1px solid #fecaca",
  borderRadius: 16,
  padding: 14,
  background: "#fef2f2",
  color: "#7f1d1d",
  fontWeight: 700,
};

export default function CourseStructureImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const profile = useMemo(() => buildProfile(result), [result]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      setError("");
      setImportResult(null);
      const parsed = (await parseMoodleFile(file)) as unknown as ParseResult;
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err || "שגיאה לא ידועה"));
    } finally {
      setBusy(false);
    }
  }

  function handlePaste() {
    try {
      setError("");
      setImportResult(null);
      const parsed = parsePastedTable(pastedText) as unknown as ParseResult;
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err || "שגיאה לא ידועה"));
    }
  }

  async function handleImport() {
    if (!result) return;
    if (!profile.required_ok) {
      setError("לא ניתן לייבא עדיין: חסר שם תלמיד או שאין עמודות פעילות.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setImportResult(null);
      const response = await postCourseStructureImport(result);
      setImportResult(response);
      if (!response.ok) {
        throw new Error([response.error, response.detail].filter(Boolean).join(" | ") || "ייבוא מבנה קורס נכשל");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err || "שגיאה לא ידועה"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir="rtl" data-version={MARKER} style={{ maxWidth: 1120, margin: "0 auto", padding: 20, fontFamily: "Heebo, Assistant, Arial, sans-serif" }}>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.ods" style={{ display: "none" }} onChange={handleFile} onClick={(e) => { e.currentTarget.value = ""; }} />

      <section style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#0369a1" }}>ייבוא מבנה קורס ופעילויות ממודל</div>
        <h1 style={{ margin: "6px 0", fontSize: 30, fontWeight: 950, color: "#0f172a" }}>השלמת פעילות / מבנה קורס</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
          המסך מזהה דוח "השלמת פעילות" (Activity Completion) ממודל ושומר פרקים, משימות ואחוזי השלמה אמיתיים בלבד.
          תאים ריקים לא נשמרים כהשלמה. לא נוצרים פרקים מומצאים.
        </p>
        <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>{MARKER}</div>
      </section>

      {error && <section style={{ ...errorBox, marginBottom: 16 }}>{error}</section>}
      {importResult?.ok && (
        <section style={{ ...successBox, marginBottom: 16 }}>
          ייבוא מבנה קורס הצליח
          {typeof importResult.sections_written === "number" ? ` · פרקים: ${importResult.sections_written}` : ""}
          {typeof importResult.tasks_written === "number" ? ` · משימות: ${importResult.tasks_written}` : ""}
          {typeof importResult.completions_written === "number" ? ` · השלמות: ${importResult.completions_written}` : ""}
          {importResult.section_column_used ? ` · עמודת פרק: ${importResult.section_column_used}` : " · ללא עמודת פרק — משימות לא מסווגות"}
        </section>
      )}

      <section style={{ display: "grid", gap: 16 }}>
        <div style={box}>
          <h2 style={{ marginTop: 0 }}>בחר קובץ השלמת פעילות</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>
            דוח "Activity Completion" ממודל: שורה לכל תלמיד, עמודה לכל פעילות (XLSX / CSV / ODS).
          </p>
          <button type="button" style={button} onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "מעבד..." : "בחר קובץ מבנה קורס"}
          </button>
        </div>

        <div style={box}>
          <h2 style={{ marginTop: 0 }}>או הדבק טבלת השלמת פעילות</h2>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="הדבק כאן טבלת השלמת פעילות ממודל כולל שורת כותרות..."
            style={{ width: "100%", minHeight: 110, borderRadius: 12, border: "1px solid #cbd5e1", padding: 12, fontSize: 14 }}
          />
          <div style={{ marginTop: 10 }}>
            <button type="button" style={mutedButton} onClick={handlePaste} disabled={busy || !pastedText.trim()}>בדיקת טבלה</button>
          </div>
        </div>
      </section>

      {result && (
        <section style={{ ...box, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>תוצאת בדיקת מבנה קורס</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>
            {result.fileName ? `קובץ: ${result.fileName}` : "טבלה שהודבקה"} · {result.rowCount || 0} שורות · {(result.headers || []).length} עמודות · עמודות פעילות: {profile.activity_columns_count}
            {profile.section_column ? ` · עמודת פרק: ${profile.section_column}` : " · ללא עמודת פרק מזוהה"}
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <button type="button" style={mutedButton} onClick={() => copyText(JSON.stringify(profile, null, 2))}>העתק פרופיל בטוח</button>
            <button type="button" style={button} onClick={handleImport} disabled={busy || !profile.required_ok}>
              {busy ? "מייבא..." : "ייבא מבנה קורס אמיתי"}
            </button>
            {importResult?.ok && (
              <a href="/tasks" style={{ ...mutedButton, textDecoration: "none", display: "inline-block" }}>פתח משימות ופרקים</a>
            )}
          </div>

          {!profile.required_ok && (
            <div style={{ ...errorBox, marginTop: 12 }}>
              זוהה מבנה חלקי בלבד. נדרש שם תלמיד ולפחות עמודת פעילות אחת.
            </div>
          )}

          {profile.activity_columns_preview.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>עמודות פעילות שזוהו (עד 10):</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.activity_columns_preview.map((col, i) => (
                  <span key={i} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "3px 10px", fontSize: 12 }}>{col}</span>
                ))}
                {profile.activity_columns_count > 10 && (
                  <span style={{ color: "#94a3b8", fontSize: 12, padding: "3px 6px" }}>+{profile.activity_columns_count - 10} נוספות</span>
                )}
              </div>
            </div>
          )}

          <pre dir="ltr" style={{ marginTop: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, color: "#334155", fontSize: 12, maxHeight: 300, overflow: "auto" }}>
            {JSON.stringify(importResult || profile, null, 2)}
          </pre>

          <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 10 }}>
            לא נוצרים פרקים מומצאים. Teacher Release לא משתנה.
          </p>
        </section>
      )}
    </main>
  );
}
