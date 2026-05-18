import { useMemo, useRef, useState } from "react";
import { MoodleImportResult, parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";
import { postImport } from "@/hooks/useImports";

const MARKER = "YANIV_IMPORT_NATIVE_STABLE_V1 YANIV_IMPORT_ERROR_DETAILS_V2";

type ImportResponse = {
  ok: boolean;
  batch_id?: string;
  row_count?: number;
  inserted?: number;
  updated?: number;
  skipped?: number;
  warnings?: string[];
  error?: string;
  detail?: string;
  code?: string | null;
  reason?: string;
  supabase?: {
    written?: boolean;
    reason?: string;
    students_written?: number;
  };
  teacher_result?: string;
  course_result?: string;
  import_batch_variant?: string;
  students_variant?: string;
};

function normalizeHeader(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function hasHeader(headers: string[], candidates: string[]): boolean {
  const normalized = new Set(headers.map(normalizeHeader));
  return candidates.some((candidate) => normalized.has(normalizeHeader(candidate)));
}

function mappingSummary(result: MoodleImportResult | null) {
  const headers = result?.headers || [];
  return {
    hasFullName: hasHeader(headers, ["שם מלא", "Full name", "Name", "שם"]),
    hasSplitName:
      hasHeader(headers, ["שם פרטי", "First name", "Firstname", "first_name"]) &&
      hasHeader(headers, ["שם משפחה", "Surname", "Last name", "lastname", "last_name"]),
    hasEmail: hasHeader(headers, [
      "כתובת דואל",
      "כתובת דוא״ל",
      "דואל",
      "דוא״ל",
      "דואר אלקטרוני",
      "Email address",
      "Email",
    ]),
    hasUsername: hasHeader(headers, ["שם משתמש", "Username", "User name", "login", "מזהה משתמש"]),
    hasMoodleUserId: hasHeader(headers, ["user_id", "User ID", "ID", "id", "מזהה"]),
    hasLisPersonSourcedId: hasHeader(headers, [
      "lis_person_sourcedid",
      "lis_person_sourcedId",
      "sourcedid",
      "Source ID",
      "Sourced ID",
    ]),
    hasIdNumber: hasHeader(headers, ["ID number", "idnumber", "מספר זהות", "תז", "ת.ז.", "מספר מזהה"]),
  };
}

function reportTypeLabel(type: string) {
  if (type === "students") return "משתתפים";
  if (type === "grades") return "ציונים — עבר למסך Gradebook";
  if (type === "logs") return "יומני מעקב — עבר למסך ייעודי";
  if (type === "completion") return "השלמת פעילות — עבר למסך ייעודי";
  return "לא זוהה";
}

function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error || "שגיאה לא ידועה");
  if (raw === "missing_session" || raw === "NO_VERIFIED_MOODLE_SESSION") {
    return "לא נמצאה כניסה מאומתת מתוך Moodle. פתח את Teacher Hub מתוך Moodle ונסה שוב.";
  }
  return raw;
}

function safeImportErrorText(response: ImportResponse | null): string {
  if (!response || response.ok) return "";
  const parts = [
    response.error || response.reason || "IMPORT_FAILED",
    response.detail ? `detail: ${response.detail}` : "",
    response.code ? `code: ${response.code}` : "",
    response.supabase?.reason ? `supabase: ${response.supabase.reason}` : "",
    response.teacher_result ? `teacher_result: ${response.teacher_result}` : "",
    response.course_result ? `course_result: ${response.course_result}` : "",
    response.import_batch_variant ? `import_batch_variant: ${response.import_batch_variant}` : "",
    response.students_variant ? `students_variant: ${response.students_variant}` : "",
  ].filter(Boolean);
  return parts.join(" | ");
}

function copyText(text: string) {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    // Clipboard may be blocked in iframe; visible text remains on screen.
  }
}

const page = {
  maxWidth: 1120,
  margin: "0 auto",
  padding: 24,
  fontFamily: "Heebo, Assistant, Arial, sans-serif",
};

const hero = {
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: 30,
  padding: "28px 30px",
  color: "#ffffff",
  background: "linear-gradient(135deg, #06152f 0%, #082b66 48%, #0b4f8f 100%)",
  boxShadow: "0 30px 90px rgba(6,21,47,0.35)",
  marginBottom: 22,
};

const heroKicker = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid rgba(255,255,255,0.24)",
  borderRadius: 999,
  padding: "8px 13px",
  background: "rgba(15,61,117,0.85)",
  fontSize: 13,
  fontWeight: 900,
};

const box = {
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 22,
  background: "#ffffff",
  boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
};

const primaryButton = {
  border: "0",
  borderRadius: 999,
  padding: "13px 22px",
  fontWeight: 900,
  cursor: "pointer",
  background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)",
  color: "white",
  boxShadow: "0 16px 40px rgba(14,165,233,0.24)",
};

const mutedButton = {
  ...primaryButton,
  background: "#eef2ff",
  color: "#1e3a8a",
  boxShadow: "none",
};

const dangerBox = {
  border: "1px solid #fecaca",
  borderRadius: 20,
  padding: 16,
  background: "#fff7f7",
  color: "#7f1d1d",
  fontWeight: 800,
};

const successBox = {
  border: "1px solid #bbf7d0",
  borderRadius: 20,
  padding: 16,
  background: "#f0fdf4",
  color: "#14532d",
  fontWeight: 800,
};

const subtle = {
  color: "#64748b",
  lineHeight: 1.75,
};

export default function Import() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<MoodleImportResult | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [serverResult, setServerResult] = useState<ImportResponse | null>(null);

  const mapping = useMemo(() => mappingSummary(result), [result]);
  const hasNameForImport = mapping.hasFullName || mapping.hasSplitName;
  const hasIdentityForImport =
    mapping.hasEmail ||
    mapping.hasUsername ||
    mapping.hasMoodleUserId ||
    mapping.hasLisPersonSourcedId ||
    mapping.hasIdNumber;

  const canSubmit = Boolean(result && result.reportType === "students" && hasNameForImport && hasIdentityForImport);

  const blockingReason = useMemo(() => {
    if (!result) return "";
    if (result.reportType !== "students") {
      return "הקובץ שייך למסך ייבוא אחר. במסך הזה ניתן לשמור משתתפים בלבד.";
    }
    if (!hasNameForImport) return "חסרה עמודת שם תלמיד. נדרש שם מלא או שם פרטי + שם משפחה.";
    if (!hasIdentityForImport) return "חסר מזהה תלמיד. נדרש לפחות מייל, שם משתמש, user_id, lis_person_sourcedid או ID number.";
    return "";
  }, [result, hasNameForImport, hasIdentityForImport]);

  const openFilePicker = () => {
    setError("");
    setServerResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      setError("");
      setServerResult(null);
      const parsed = await parseMoodleFile(file);
      setResult(parsed);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePaste = () => {
    try {
      setError("");
      setServerResult(null);
      const parsed = parsePastedTable(pastedText);
      setResult(parsed);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const handleSubmit = async () => {
    if (!result) return;

    if (!canSubmit) {
      setError(blockingReason || "לא ניתן לשמור את הדוח הזה כרגע.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setServerResult(null);

      const response = await postImport({
        report_type: "students",
        file_name: result.fileName,
        source_kind: result.fileName ? "upload" : "paste",
        detection_confidence: result.confidence,
        payload: result.data,
      });

      setServerResult(response as ImportResponse);

      if (!response.ok) {
        throw new Error(safeImportErrorText(response as ImportResponse) || "שגיאה בשרת בזמן הייבוא");
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const previewRows = (result?.data || []).slice(0, 12) as Array<Record<string, unknown>>;
  const previewHeaders = (result?.headers || []).slice(0, 8);

  return (
    <main dir="rtl" data-version={MARKER} style={page}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.ods"
        style={{ display: "none" }}
        onClick={(event) => { event.currentTarget.value = ""; }}
        onChange={handleFile}
      />

      <section style={hero}>
        <div style={heroKicker}>ייבוא נתוני Moodle</div>
        <h1 style={{ margin: "12px 0 8px", fontSize: 42, fontWeight: 950, letterSpacing: "-0.03em" }}>
          ייבוא משתתפים
        </h1>
        <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,0.86)", lineHeight: 1.8, fontSize: 17, fontWeight: 700 }}>
          העלאת קובץ משתתפים ממודל, בדיקה מקדימה ושמירה מאושרת בלבד.
        </p>
      </section>

      {error && (
        <section style={{ ...dangerBox, marginBottom: 16 }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>הייבוא נעצר</div>
          <div style={{ lineHeight: 1.8 }}>{error}</div>
          {serverResult && !serverResult.ok && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                style={{ ...mutedButton, padding: "8px 14px", fontSize: 12 }}
                onClick={() => copyText(JSON.stringify(serverResult, null, 2))}
              >
                העתק פרטים בטוחים
              </button>
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 900 }}>פרטים טכניים</summary>
                <pre
                  dir="ltr"
                  style={{
                    marginTop: 10,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: 12,
                    padding: 12,
                    color: "#7c2d12",
                    fontSize: 12,
                    fontWeight: 600,
                    maxHeight: 260,
                    overflow: "auto"
                  }}
                >
                  {JSON.stringify(serverResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>
      )}

      {serverResult?.ok && (
        <section style={{ ...successBox, marginBottom: 16 }}>
          הייבוא הושלם: {serverResult.row_count ?? 0} שורות נקלטו.
          {" "}נוספו: {serverResult.inserted ?? 0}, עודכנו: {serverResult.updated ?? 0}, נדחו: {serverResult.skipped ?? 0}.
          {" "}Supabase: {serverResult.supabase?.written ? "נשמר" : "לא אושר"}.
          {typeof serverResult.supabase?.students_written === "number" ? ` תלמידים שנכתבו: ${serverResult.supabase.students_written}.` : ""}
        </section>
      )}

      {!result ? (
        <section style={{ display: "grid", gap: 16 }}>
          <div style={box}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 950, color: "#0f172a" }}>בחר קובץ</h2>
                <p style={{ ...subtle, margin: "8px 0 0" }}>
                  קובץ XLSX / CSV / ODS של משתתפים ממודל.
                </p>
              </div>
              <button type="button" style={primaryButton} onClick={openFilePicker} disabled={busy}>
                {busy ? "בודק קובץ..." : "בחר קובץ"}
              </button>
            </div>
          </div>

          <div style={box}>
            <h2 style={{ marginTop: 0, fontSize: 24, fontWeight: 900, color: "#0f172a" }}>הדבקת טבלה</h2>
            <textarea
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              placeholder="אפשר להדביק כאן טבלת משתתפים כולל שורת כותרות"
              style={{ width: "100%", minHeight: 110, borderRadius: 16, border: "1px solid #cbd5e1", padding: 14, fontSize: 14, outline: "none" }}
            />
            <div style={{ marginTop: 10 }}>
              <button type="button" style={mutedButton} onClick={handlePaste} disabled={busy || !pastedText.trim()}>
                בדיקת טבלה
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section style={box}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 950, color: "#0f172a" }}>תוצאת בדיקה</h2>
              <p style={{ color: "#475569", margin: "8px 0 0", lineHeight: 1.75 }}>
                {reportTypeLabel(result.reportType)} · {result.fileName ? result.fileName : "טבלה שהודבקה"} · {result.rowCount} שורות · זיהוי {Math.round(result.confidence * 100)}%
              </p>
              {blockingReason && <p style={{ color: "#9a3412", fontWeight: 900 }}>{blockingReason}</p>}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={mutedButton} onClick={() => { setResult(null); setServerResult(null); setError(""); }}>
                ביטול
              </button>
              <button type="button" style={primaryButton} onClick={handleSubmit} disabled={busy || !canSubmit}>
                {busy ? "מייבא..." : "ייבוא משתתפים"}
              </button>
              {serverResult?.ok && (
                <a href="/students" style={{ ...mutedButton, textDecoration: "none", display: "inline-block" }}>
                  פתח תלמידים
                </a>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 16 }}>
            <div style={{ ...box, boxShadow: "none", padding: 14 }}>שם תלמיד: <b>{hasNameForImport ? "קיים" : "חסר"}</b></div>
            <div style={{ ...box, boxShadow: "none", padding: 14 }}>מייל: <b>{mapping.hasEmail ? "קיים" : "לא התקבל"}</b></div>
            <div style={{ ...box, boxShadow: "none", padding: 14 }}>שם משתמש: <b>{mapping.hasUsername ? "קיים" : "לא התקבל"}</b></div>
            <div style={{ ...box, boxShadow: "none", padding: 14 }}>מזהה נוסף: <b>{mapping.hasMoodleUserId || mapping.hasLisPersonSourcedId || mapping.hasIdNumber ? "קיים" : "לא התקבל"}</b></div>
          </div>

          <div style={{ marginTop: 18, overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 18 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {previewHeaders.map((header) => (
                    <th key={header} style={{ padding: 10, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={index}>
                    {previewHeaders.map((header) => (
                      <td key={header} style={{ padding: 9, borderBottom: "1px solid #f1f5f9", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {String(row[header] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 10 }}>
            תצוגה מקדימה — 12 שורות ראשונות מתוך {result.rowCount}
          </p>
        </section>
      )}
    </main>
  );
}
