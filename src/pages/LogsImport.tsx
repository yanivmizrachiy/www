import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";
import { getLtiToken, useLtiSession } from "@/hooks/useLtiSession";
import { buildMoodleReportUrl, MOODLE_REPORTS } from "@/lib/moodleReportLinks";

const MARKER = "MTH_MOODLE_LOGS_IMPORT_UI_V1";

type ParseResult = {
  fileName?: string;
  rowCount?: number;
  confidence?: number;
  headers?: string[];
  data?: Array<Record<string, unknown>>;
  rows?: Array<Record<string, unknown>>;
};

type LogsImportResult = {
  ok: boolean;
  error?: string;
  detail?: string;
  batch_id?: string;
  rows_seen?: number;
  log_events_written?: number;
  skipped_rows?: number;
  warnings?: string[];
  supabase?: {
    written?: boolean;
    reason?: string;
    log_events_written?: number;
    log_events_variant?: string;
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
    { key: "time", label: "זמן", candidates: ["זמן", "Time", "Date", "תאריך", "תאריך ושעה"] },
    { key: "actor", label: "שם מלא", candidates: ["שם מלא", "Full name", "User full name"] },
    { key: "affected", label: "משתמש מושפע", candidates: ["משתמש מושפע", "Affected user"] },
    { key: "context", label: "הארוע מתייחס ל", candidates: ["הארוע מתייחס ל:", "האירוע מתייחס ל:", "Event context", "Context"] },
    { key: "component", label: "רכיב", candidates: ["רכיב", "Component"] },
    { key: "event", label: "שם האירוע", candidates: ["שם האירוע", "Event name"] },
    { key: "description", label: "תיאור", candidates: ["תיאור", "Description"] },
    { key: "origin", label: "מקור", candidates: ["מקור", "Origin", "Source"] },
    { key: "ip", label: "כתובת IP", candidates: ["כתובת IP", "IP address", "IP"] },
  ].map((c) => {
    const matchedHeader = findHeader(headers, c.candidates);
    return { ...c, found: Boolean(matchedHeader), matchedHeader };
  });

  const requiredOk =
    Boolean(checks.find((c) => c.key === "time")?.found) &&
    Boolean(checks.find((c) => c.key === "actor")?.found) &&
    Boolean(checks.find((c) => c.key === "event")?.found);

  return {
    marker: MARKER,
    report_type: "moodle-logs",
    file_name: result?.fileName || null,
    rows_seen: result?.rowCount || 0,
    confidence: result?.confidence || 0,
    headers_count: headers.length,
    checks,
    required_ok: requiredOk,
    safety: {
      no_logs_saved_until_import_button: true,
      no_practice_time_invented: true,
      no_sql: true,
      no_teacher_release_change: true,
      raw_logs_not_public: true,
    },
  };
}

function copyText(text: string) {
  try { navigator.clipboard?.writeText(text); } catch {}
}

async function postLogsImport(result: ParseResult): Promise<LogsImportResult> {
  const token = getLtiToken();
  if (!token) return { ok: false, error: "NO_VERIFIED_MOODLE_SESSION", detail: "פתח את הכלי מתוך Moodle ואז נסה שוב." };

  const rows = (result.data || result.rows || []) as Array<Record<string, unknown>>;
  const res = await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-lti-session": token },
    credentials: "include",
    body: JSON.stringify({
      token,
      report_type: "logs",
      file_name: result.fileName,
      source_kind: result.fileName ? "upload" : "paste",
      detection_confidence: result.confidence,
      payload: rows,
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!payload) return { ok: false, error: "INVALID_SERVER_RESPONSE" };
  return payload as LogsImportResult;
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

export default function LogsImport() {
  const { session, site } = useLtiSession();
  const courseId = (session as any)?.course_id ?? null;
  const moodleBase = (site as any)?.site_url ?? null;
  const logsUrl = buildMoodleReportUrl(moodleBase, courseId, MOODLE_REPORTS.find(r => r.key === "logs") ?? MOODLE_REPORTS[4]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState<LogsImportResult | null>(null);

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
      setError("לא ניתן לייבא עדיין: חסרות עמודות זמן / שם מלא / שם אירוע.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setImportResult(null);
      const response = await postLogsImport(result);
      setImportResult(response);
      if (!response.ok) {
        throw new Error([response.error, response.detail].filter(Boolean).join(" | ") || "ייבוא יומני מעקב נכשל");
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
        <div style={{ fontSize: 12, fontWeight: 900, color: "#0369a1" }}>ייבוא יומני מעקב אמיתיים</div>
        <h1 style={{ margin: "6px 0", fontSize: 30, fontWeight: 950, color: "#0f172a" }}>יומני מעקב ממודל</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
          המסך מזהה דוח יומני מעקב ממודל ושומר אירועים אמיתיים בלבד. לא מחושב זמן תרגול מזויף.
        </p>
      </section>

      {error && <section style={{ ...errorBox, marginBottom: 16 }}>{error}</section>}
      {importResult?.ok && (
        <section style={{ ...successBox, marginBottom: 16 }}>
          ייבוא יומני מעקב הצליח · אירועים שנשמרו: {importResult.log_events_written ?? 0} · שורות שדולגו: {importResult.skipped_rows ?? 0}
        </section>
      )}

      <section style={{ display: "grid", gap: 16 }}>
        <div style={box}>
          <h2 style={{ marginTop: 0 }}>בחר קובץ יומני מעקב</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>בחר את קובץ המעקב ממודל, למשל מעקב.xlsx.</p>
          <button type="button" style={button} onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "מעבד..." : "בחר קובץ יומני מעקב"}
          </button>
        </div>

        <div style={box}>
          <h2 style={{ marginTop: 0 }}>או הדבק טבלת יומני מעקב</h2>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="הדבק כאן טבלת יומני מעקב ממודל כולל שורת כותרות..."
            style={{ width: "100%", minHeight: 110, borderRadius: 12, border: "1px solid #cbd5e1", padding: 12, fontSize: 14 }}
          />
          <div style={{ marginTop: 10 }}>
            <button type="button" style={mutedButton} onClick={handlePaste} disabled={busy || !pastedText.trim()}>בדיקת טבלה</button>
          </div>
        </div>
      </section>

      {result && (
        <section style={{ ...box, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>תוצאת בדיקת יומני מעקב</h2>
          <p style={{ color: "#475569", lineHeight: 1.8 }}>
            {result.fileName ? `קובץ: ${result.fileName}` : "טבלה שהודבקה"} · {result.rowCount || 0} שורות · {(result.headers || []).length} עמודות.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <button type="button" style={mutedButton} onClick={() => copyText(JSON.stringify(profile, null, 2))}>העתק פרופיל Logs בטוח</button>
            <button type="button" style={button} onClick={handleImport} disabled={busy || !profile.required_ok}>
              {busy ? "מייבא..." : "ייבא יומני מעקב אמיתי"}
            </button>
          </div>

          {!profile.required_ok && (
            <div style={{ ...errorBox, marginTop: 12 }}>
              זוהה מבנה חלקי בלבד. נדרש זמן, שם מלא ושם אירוע.
            </div>
          )}

          <pre dir="ltr" style={{ marginTop: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, color: "#334155", fontSize: 12, maxHeight: 320, overflow: "auto" }}>
            {JSON.stringify(importResult || profile, null, 2)}
          </pre>

          <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 10 }}>
            יומני מעקב נשמרים כנתוני פעילות. זמן תרגול יחושב רק בשלב נפרד ובזהירות.
          </p>
        </section>
      )}
    </main>
  );
}

