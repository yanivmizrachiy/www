import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";

const MARKER = "YANIV_GRADEBOOK_PREFLIGHT_UI_V1";

type ParseResult = {
  fileName?: string;
  rowCount?: number;
  confidence?: number;
  headers?: string[];
  data?: Array<Record<string, unknown>>;
  rows?: Array<Record<string, unknown>>;
};

function normalize(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
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
  const checks = [
    { key: "student_name", label: "שם תלמיד", candidates: ["שם מלא", "Full name", "Name", "שם פרטי", "First name", "שם משפחה", "Surname", "Last name"] },
    { key: "identity", label: "מזהה תלמיד", candidates: ["Email", "Email address", "דואל", "דוא״ל", "שם משתמש", "Username", "ID number", "idnumber"] },
    { key: "grade_item", label: "פריט ציון / פעילות", candidates: ["Grade item", "Item name", "Activity", "Assignment", "Quiz", "מטלה", "פעילות", "פריט ציון"] },
    { key: "grade", label: "ציון", candidates: ["Grade", "Final grade", "Raw grade", "ציון", "ציון סופי", "ניקוד", "score"] },
    { key: "max_grade", label: "ציון מרבי", candidates: ["Max grade", "Maximum grade", "Out of", "ציון מרבי", "מתוך", "max"] },
    { key: "updated_at", label: "תאריך עדכון", candidates: ["Last modified", "Modified", "Updated", "תאריך עדכון", "עודכן לאחרונה"] },
  ].map((c) => {
    const matchedHeader = findHeader(headers, c.candidates);
    return { ...c, found: Boolean(matchedHeader), matchedHeader };
  });

  const requiredOk =
    Boolean(checks.find((c) => c.key === "student_name")?.found) &&
    Boolean(checks.find((c) => c.key === "identity")?.found) &&
    Boolean(checks.find((c) => c.key === "grade")?.found);

  return {
    marker: MARKER,
    report_type: "gradebook-preflight-only",
    file_name: result?.fileName || null,
    rows_seen: result?.rowCount || 0,
    confidence: result?.confidence || 0,
    headers,
    checks,
    required_ok: requiredOk,
    safety: {
      no_grades_saved: true,
      no_students_saved: true,
      no_supabase_write: true,
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

export default function GradebookImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const profile = useMemo(() => buildProfile(result), [result]);
  const rows = ((result?.data || result?.rows || []) as Array<Record<string, unknown>>).slice(0, 8);
  const headers = (result?.headers || []).slice(0, 10);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      setError("");
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
      const parsed = parsePastedTable(pastedText) as unknown as ParseResult;
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err || "שגיאה לא ידועה"));
    }
  }

  return (
    <main dir="rtl" data-version={MARKER} style={{ maxWidth: 1120, margin: "0 auto", padding: 20, fontFamily: "Heebo, Assistant, Arial, sans-serif" }}>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.ods" style={{ display: "none" }} onChange={handleFile} onClick={(e) => { e.currentTarget.value = ""; }} />

      <section style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#0369a1" }}>בדיקת Gradebook לפני ייבוא</div>
        <h1 style={{ margin: "6px 0", fontSize: 30, fontWeight: 950, color: "#0f172a" }}>הכנת ייבוא ציונים ממודל</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
          מסך זה בודק מבנה של Gradebook אמיתי בלבד. הוא לא שומר ציונים, לא כותב ל־Supabase, ולא משנה Teacher Release.
        </p>
        <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>{MARKER}</div>
      </section>

      {error && (
        <section style={{ border: "1px solid #fecaca", borderRadius: 16, padding: 14, background: "#fef2f2", color: "#7f1d1d", fontWeight: 700, marginBottom: 16 }}>
          {error}
        </section>
      )}

      <section style={{ display: "grid", gap: 16 }}>
        <div style={box}>
          <h2 style={{ marginTop: 0 }}>בחר קובץ Gradebook</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>בחר קובץ XLSX / CSV / ODS אמיתי שיוצא ממודל. כרגע זו בדיקת מבנה בלבד.</p>
          <button type="button" style={button} onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "בודק קובץ..." : "בחר קובץ Gradebook"}
          </button>
        </div>

        <div style={box}>
          <h2 style={{ marginTop: 0 }}>או הדבק טבלת Gradebook</h2>
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
            {result.fileName ? `קובץ: ${result.fileName}` : "טבלה שהודבקה"} · {result.rowCount || 0} שורות · {(result.headers || []).length} עמודות.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 12 }}>
            {profile.checks.map((check) => (
              <div key={check.key} style={{ border: `1px solid ${check.found ? "#bbf7d0" : "#fed7aa"}`, borderRadius: 14, padding: 12, background: check.found ? "#f0fdf4" : "#fff7ed" }}>
                <div style={{ fontWeight: 900 }}>{check.label}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{check.found ? `זוהה: ${check.matchedHeader}` : "לא זוהה אוטומטית"}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={mutedButton} onClick={() => copyText(JSON.stringify(profile, null, 2))}>העתק פרופיל Gradebook בטוח</button>
            <a href="/import" style={{ ...mutedButton, textDecoration: "none", display: "inline-block" }}>חזור לייבוא Participants</a>
          </div>

          <pre dir="ltr" style={{ marginTop: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, color: "#334155", fontSize: 12, maxHeight: 300, overflow: "auto" }}>
            {JSON.stringify(profile, null, 2)}
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

          <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 10 }}>תצוגה מקדימה בלבד — לא נשמרים ציונים בשלב זה.</p>
        </section>
      )}
    </main>
  );
}
