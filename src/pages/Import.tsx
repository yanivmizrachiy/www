import { useMemo, useRef, useState } from "react";
import { MoodleImportResult, parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";
import { postImport } from "@/hooks/useImports";

const MARKER = "YANIV_IMPORT_NATIVE_STABLE_V1";

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
  if (type === "students") return "Participants / תלמידים";
  if (type === "grades") return "ציונים — חסום כרגע";
  if (type === "logs") return "לוגים — חסום כרגע";
  if (type === "completion") return "השלמת פעילות — חסום כרגע";
  return "לא זוהה";
}

function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error || "שגיאה לא ידועה");
  if (raw === "missing_session" || raw === "NO_VERIFIED_MOODLE_SESSION") {
    return "לא נמצאה פתיחה מאומתת מתוך Moodle. פתח את Teacher Hub מתוך Moodle עצמו ואז נסה שוב.";
  }
  return raw;
}

const box: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
  background: "#ffffff",
  boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
};

const button: React.CSSProperties = {
  border: "0",
  borderRadius: 999,
  padding: "12px 20px",
  fontWeight: 800,
  cursor: "pointer",
  background: "#0ea5e9",
  color: "white",
};

const mutedButton: React.CSSProperties = {
  ...button,
  background: "#eef2ff",
  color: "#1e3a8a",
};

const dangerBox: React.CSSProperties = {
  border: "1px solid #fecaca",
  borderRadius: 16,
  padding: 14,
  background: "#fef2f2",
  color: "#7f1d1d",
  fontWeight: 700,
};

const successBox: React.CSSProperties = {
  border: "1px solid #bbf7d0",
  borderRadius: 16,
  padding: 14,
  background: "#f0fdf4",
  color: "#14532d",
  fontWeight: 700,
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
      return "השרת מאשר כרגע רק Participants / תלמידים. ציונים, לוגים והשלמת פעילות ייבנו אחרי שתלמידים יאומתו.";
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

      if (!response.ok) {
        throw new Error(response.error || response.detail || "שגיאה בשרת בזמן הייבוא");
      }

      setServerResult(response as ImportResponse);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const previewRows = (result?.data || []).slice(0, 12) as Array<Record<string, unknown>>;
  const previewHeaders = (result?.headers || []).slice(0, 8);

  return (
    <main dir="rtl" data-version={MARKER} style={{ maxWidth: 1100, margin: "0 auto", padding: 20, fontFamily: "Heebo, Assistant, Arial, sans-serif" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.ods"
        style={{ display: "none" }}
        onClick={(event) => { event.currentTarget.value = ""; }}
        onChange={handleFile}
      />

      <section style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#0369a1", letterSpacing: "0.08em" }}>
          ייבוא נתוני Moodle אמיתיים
        </div>
        <h1 style={{ margin: "6px 0", fontSize: 30, fontWeight: 950, color: "#0f172a" }}>
          ייבוא Participants / תלמידים
        </h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
          גרסה יציבה ללא רכיבי אנימציה או רכיבי UI חיצוניים. אין דמו, אין תלמידים מומצאים, ואין שמירת נתונים לפני אישור.
        </p>
        <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>{MARKER}</div>
      </section>

      {error && (
        <section style={{ ...dangerBox, marginBottom: 16 }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>הייבוא לא התקדם</div>
          <div>{error}</div>
        </section>
      )}

      {serverResult?.ok && (
        <section style={{ ...successBox, marginBottom: 16 }}>
          ייבוא Participants הושלם: {serverResult.row_count ?? 0} שורות נקלטו.
          {" "}נוספו: {serverResult.inserted ?? 0}, עודכנו: {serverResult.updated ?? 0}, נדחו: {serverResult.skipped ?? 0}.
        </section>
      )}

      {!result ? (
        <section style={{ display: "grid", gap: 16 }}>
          <div style={box}>
            <h2 style={{ marginTop: 0 }}>בחר קובץ Participants</h2>
            <p style={{ color: "#475569", lineHeight: 1.8 }}>
              בחר קובץ XLSX / CSV / ODS אמיתי שהורדת ממודל. המערכת תציג בדיקה ותצוגה מקדימה לפני שמירה.
            </p>
            <button type="button" style={button} onClick={openFilePicker} disabled={busy}>
              {busy ? "בודק קובץ..." : "בחר קובץ Participants"}
            </button>
          </div>

          <div style={box}>
            <h2 style={{ marginTop: 0 }}>או הדבק טבלה</h2>
            <textarea
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              placeholder="הדבק כאן טבלת Participants ממודל כולל שורת כותרות..."
              style={{ width: "100%", minHeight: 110, borderRadius: 12, border: "1px solid #cbd5e1", padding: 12, fontSize: 14 }}
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
              <h2 style={{ margin: 0 }}>זוהה דוח: {reportTypeLabel(result.reportType)}</h2>
              <p style={{ color: "#475569", margin: "8px 0 0" }}>
                {result.fileName ? `קובץ: ${result.fileName}` : "טבלה שהודבקה"} · {result.rowCount} שורות · רמת זיהוי {Math.round(result.confidence * 100)}%
              </p>
              {blockingReason && <p style={{ color: "#9a3412", fontWeight: 800 }}>{blockingReason}</p>}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={mutedButton} onClick={() => { setResult(null); setServerResult(null); setError(""); }}>
                ביטול
              </button>
              <button type="button" style={button} onClick={handleSubmit} disabled={busy || !canSubmit}>
                {busy ? "מייבא..." : "אשר וייבא Participants"}
              </button>
              {serverResult?.ok && (
                <a href="/students" style={{ ...mutedButton, textDecoration: "none", display: "inline-block" }}>
                  פתח תלמידים
                </a>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 16 }}>
            <div style={{ ...box, boxShadow: "none" }}>שם תלמיד: <b>{hasNameForImport ? "קיים" : "חסר"}</b></div>
            <div style={{ ...box, boxShadow: "none" }}>מייל: <b>{mapping.hasEmail ? "קיים" : "לא התקבל"}</b></div>
            <div style={{ ...box, boxShadow: "none" }}>שם משתמש: <b>{mapping.hasUsername ? "קיים" : "לא התקבל"}</b></div>
            <div style={{ ...box, boxShadow: "none" }}>מזהה נוסף: <b>{mapping.hasMoodleUserId || mapping.hasLisPersonSourcedId || mapping.hasIdNumber ? "קיים" : "לא התקבל"}</b></div>
          </div>

          <div style={{ marginTop: 18, overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 14 }}>
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
            תצוגה מקדימה בלבד — מוצגות 12 שורות ראשונות מתוך {result.rowCount}
          </p>
        </section>
      )}
    </main>
  );
}