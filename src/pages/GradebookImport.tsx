import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";
import { getLtiToken, useLtiSession } from "@/hooks/useLtiSession";
import { buildMoodleReportUrl, MOODLE_REPORTS } from "@/lib/moodleReportLinks";

const MARKER = "YANIV_GRADEBOOK_PREFLIGHT_UI_V1 MTH_WIDE_GRADEBOOK_IMPORT_UI_V1";

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
  grade_columns_detected?: number;
  grade_items_written?: number;
  grade_results_written?: number;
  skipped_students?: number;
  skipped_empty_grades?: number;
  warnings?: string[];
  supabase?: {
    written?: boolean;
    reason?: string;
    grade_items_written?: number;
    grade_results_written?: number;
  };
};

function normalize(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function isIdentityHeader(header: string): boolean {
  const h = normalize(header);
  return ["שםפרטי", "שםמשפחה", "שםמלא", "מספרזיהוי", "מספרזהות", "מספרמזהה", "מוסד", "מחלקה", "דואל", "email", "emailaddress"].includes(h);
}

function isGradeColumn(header: string): boolean {
  const raw = String(header || "").trim();
  if (!raw || isIdentityHeader(raw)) return false;
  if (/תאריך הפקת הדוח/i.test(raw)) return false;
  return /^(בוחן|תוכן אינטראקטיבי H5P|דפי עבודה):/.test(raw) || /סך הכל של מרחב/.test(raw);
}

function findHeader(headers: string[], candidates: string[]): string | null {
  const map = new Map(headers.map((h) => [normalize(h), h]));
  for (const c of candidates) {
    const found = map.get(normalize(c));
    if (found) return found;
  }
  return null;
}

function buildProfile(result: ParseResult | null) {
  const headers = result?.headers || [];
  const gradeColumns = headers.filter(isGradeColumn);
  const checks = [
    { key: "first_name", label: "שם פרטי", candidates: ["שם פרטי", "First name"] },
    { key: "last_name", label: "שם משפחה", candidates: ["שם משפחה", "Surname", "Last name"] },
    { key: "id_number", label: "מספר זיהוי", candidates: ["מספר זיהוי", "מספר זהות", "מספר מזהה", "ID number", "idnumber"] },
    { key: "email", label: "דוא״ל", candidates: ["דוא\"ל", "דוא״ל", "דואל", "Email", "Email address"] },
  ].map((c) => {
    const matchedHeader = findHeader(headers, c.candidates);
    return { ...c, found: Boolean(matchedHeader), matchedHeader };
  });

  const hasStudentIdentity =
    Boolean(checks.find((c) => c.key === "email")?.found) ||
    Boolean(checks.find((c) => c.key === "id_number")?.found);

  const hasStudentName =
    Boolean(checks.find((c) => c.key === "first_name")?.found) &&
    Boolean(checks.find((c) => c.key === "last_name")?.found);

  return {
    marker: MARKER,
    report_type: "wide-gradebook",
    file_name: result?.fileName || null,
    rows_seen: result?.rowCount || 0,
    confidence: result?.confidence || 0,
    headers_count: headers.length,
    grade_columns_count: gradeColumns.length,
    grade_columns_preview: gradeColumns.slice(0, 20),
    checks,
    required_ok: hasStudentName && hasStudentIdentity && gradeColumns.length > 0,
    safety: {
      no_grades_saved_until_import_button: true,
      no_missing_grades_as_zero: true,
      no_sql: true,
      no_teacher_release_change: true,
    },
  };
}

function copyText(text: string) {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    // Clipboard may be blocked inside Moodle iframe.
  }
}

async function postWideGradebookImport(result: ParseResult): Promise<ImportResult> {
  const token = getLtiToken();
  if (!token) return { ok: false, error: "NO_VERIFIED_MOODLE_SESSION", detail: "פתח את הכלי מתוך Moodle ואז נסה שוב." };

  const rows = (result.data || result.rows || []) as Array<Record<string, unknown>>;
  const res = await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-lti-session": token },
    credentials: "include",
    body: JSON.stringify({
      token,
      report_type: "grades",
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

export default function GradebookImport() {
  const { session, site } = useLtiSession();
  const courseId = (session as any)?.course_id ?? null;
  const moodleBase = (site as any)?.site_url ?? null;
  const gradesUrl = buildMoodleReportUrl(moodleBase, courseId, MOODLE_REPORTS.find(r => r.key === "grades_csv") ?? MOODLE_REPORTS[1]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const profile = useMemo(() => buildProfile(result), [result]);
  const rows = ((result?.data || result?.rows || []) as Array<Record<string, unknown>>).slice(0, 8);
  const headers = (result?.headers || []).slice(0, 10);

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
      setError("לא ניתן לייבא עדיין: חסר שם תלמיד / מזהה תלמיד / עמודות ציון רחבות.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setImportResult(null);
      const response = await postWideGradebookImport(result);
      setImportResult(response);
      if (!response.ok) {
        throw new Error([response.error, response.detail].filter(Boolean).join(" | ") || "ייבוא Gradebook נכשל");
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
        <div style={{ fontSize: 12, fontWeight: 900, color: "#0369a1" }}>בדיקת Gradebook וייבוא ציונים אמיתי</div>
        <h1 style={{ margin: "6px 0", fontSize: 30, fontWeight: 950, color: "#0f172a" }}>ייבוא ציונים ממודל</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
          המסך מזהה Gradebook רחב: כל תלמיד הוא שורה וכל בוחן/פעילות היא עמודת ציון. תאים ריקים לא נשמרים כ־0.
        </p>
      </section>

      {error && <section style={errorBox}>{error}</section>}
      {importResult?.ok && (
        <section style={{ ...successBox, marginBottom: 16 }}>
          ייבוא Gradebook הצליח · פריטי ציון: {importResult.grade_items_written ?? 0} · ציונים: {importResult.grade_results_written ?? 0}
        </section>
      )}

      <section style={{ display: "grid", gap: 16 }}>
        <div style={box}>
          <section style={{ background: "linear-gradient(135deg, #06152f 0%, #0b3d91 50%, #0e7490 100%)", color: "white", padding: "32px", borderRadius: "1.5rem", marginBottom: "24px", boxShadow: "0 20px 60px rgba(6, 21, 47, 0.3)" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, opacity: 0.8, marginBottom: "8px" }}>ייבוא נתוני Moodle</div>
        <h1 style={{ fontSize: "32px", fontWeight: 900, margin: 0, marginBottom: "8px" }}>ייבוא ציונים (Gradebook)</h1>
        <p style={{ fontSize: "14px", opacity: 0.85, margin: 0 }}>העלאת קובץ גליון ציונים ממודל, בדיקה מקדימה ושמירה מאושרת בלבד.</p>
      </section>
      <h2 style={{ marginTop: 0 }}>בחר קובץ גליון ציונים (Gradebook)</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>בחר קובץ XLSX / CSV / ODS אמיתי שיוצא ממודל.</p>
          <button type="button" style={button} onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "מעבד..." : "בחר קובץ גליון ציונים"}
          </button>
        </div>

        <div style={box}>
          <h2 style={{ marginTop: 0 }}>או הדבק את טבלת הציונים</h2>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="הדבק כאן טבלת Gradebook ממודל כולל שורת כותרות..."
            style={{ width: "100%", minHeight: 110, borderRadius: 12, border: "1px solid #cbd5e1", padding: 12, fontSize: 14 }}
          />
          <div style={{ marginTop: 10 }}>
            <button type="button" style={mutedButton} onClick={handlePaste} disabled={busy || !pastedText.trim()}>בדיקת טבלה</button>
          </div>
        </div>
      </section>

      {result && (
        <section style={{ ...box, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>תוצאת בדיקת Gradebook</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>
            {result.fileName ? `קובץ: ${result.fileName}` : "טבלה שהודבקה"} · {result.rowCount || 0} שורות · {(result.headers || []).length} עמודות · עמודות ציון: {profile.grade_columns_count}
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <button type="button" style={mutedButton} onClick={() => copyText(JSON.stringify(profile, null, 2))}>העתק פרופיל Gradebook בטוח</button>
            <button type="button" style={button} onClick={handleImport} disabled={busy || !profile.required_ok}>
              {busy ? "מייבא..." : "ייבא Gradebook אמיתי"}
            </button>
            <a href="/import" style={{ ...mutedButton, textDecoration: "none", display: "inline-block" }}>חזור לייבוא Participants</a>
          </div>

          {!profile.required_ok && (
            <div style={{ ...errorBox, marginTop: 12 }}>
              זוהה מבנה חלקי בלבד. נדרש שם תלמיד, מזהה תלמיד ועמודת ציון אחת לפחות.
            </div>
          )}

          <pre dir="ltr" style={{ marginTop: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, color: "#334155", fontSize: 12, maxHeight: 300, overflow: "auto" }}>
            {JSON.stringify(importResult || profile, null, 2)}
          </pre>

          {headers.length > 0 && (
            <div style={{ marginTop: 18, overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>{headers.map((h) => <th key={h} style={{ padding: 10, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {headers.map((h) => <td key={h} style={{ padding: 9, borderBottom: "1px solid #f1f5f9", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(row[h] ?? "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 10 }}>
            תאים ריקים / חסרים לא נשמרים כ־0. Teacher Release לא משתנה.
          </p>
        </section>
      )}
    </main>
  );
}


