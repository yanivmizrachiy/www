#!/usr/bin/env python3
from pathlib import Path

SERVER = Path("src/server.js")
IMPORTS = Path("src/hooks/useImports.tsx")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise RuntimeError(f"Missing expected anchor: {label}")


def replace_between(text: str, start: str, end: str, replacement: str, label: str) -> str:
    start_i = text.find(start)
    end_i = text.find(end, start_i)
    if start_i < 0 or end_i < 0 or end_i <= start_i:
        raise RuntimeError(f"Cannot replace section: {label}")
    return text[:start_i] + replacement.rstrip() + "\n\n" + text[end_i:]


server = read(SERVER)
require(server, "function sessionFromRequest(req)", "sessionFromRequest")
require(server, "function buildGradesCsv()", "buildGradesCsv")
require(server, 'app.get("/api/imports/overview"', "imports overview route")

helpers = r'''
function importSessionFromRequest(req) {
  const body = req.body || {};
  const headerToken = req.headers["x-lti-session"];
  const token =
    (typeof body.token === "string" && body.token) ||
    (typeof req.query?.t === "string" && req.query.t) ||
    (typeof headerToken === "string" && headerToken) ||
    "";

  if (token && tokenSessions.has(token)) return tokenSessions.get(token);
  return sessionFromRequest(req);
}

function normalizeImportKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u200e\u200f"'׳״]/g, "")
    .replace(/\s+/g, "")
    .replace(/[._\-:()[\]{}]/g, "")
    .trim();
}

function pickImportValue(row, candidates) {
  if (!row || typeof row !== "object") return "";
  const lookup = new Map(Object.keys(row).map(key => [normalizeImportKey(key), key]));
  for (const candidate of candidates) {
    const key = lookup.get(normalizeImportKey(candidate));
    if (key && row[key] != null && String(row[key]).trim()) return String(row[key]).trim();
  }
  return "";
}

function normalizeImportedStudent(row, session) {
  const firstName = pickImportValue(row, ["שם פרטי", "First name", "Firstname", "first_name"]);
  const lastName = pickImportValue(row, ["שם משפחה", "Surname", "Last name", "lastname", "last_name"]);
  const fullName = pickImportValue(row, ["שם מלא", "Full name", "שם", "Name"]) || [firstName, lastName].filter(Boolean).join(" ").trim();
  const email = pickImportValue(row, ["כתובת דואל", "כתובת דוא״ל", "דואל", "דוא״ל", "דואר אלקטרוני", "Email address", "Email"]);
  const externalUsername = pickImportValue(row, ["שם משתמש", "Username", "User name", "login", "מזהה משתמש"]);
  const externalId = pickImportValue(row, ["מזהה", "ID number", "idnumber", "מספר זהות", "תז", "ת.ז.", "User ID", "user_id"]);
  const identity = externalId || email || externalUsername || fullName;

  if (!fullName || !identity) return null;

  const spaceId = session?.spaceId || "unknown-space";
  const now = new Date().toISOString();
  return {
    id: stableId("student", spaceId + "|" + identity),
    full_name: fullName,
    fullName,
    email: email || null,
    external_username: externalUsername || null,
    external_id: externalId || identity,
    space_id: spaceId,
    source: "moodle-participants-import",
    updated_at: now,
    updatedAt: now
  };
}

function upsertImportedStudents(rows, session) {
  const input = Array.isArray(rows) ? rows : [];
  const warnings = [];
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  if (!Array.isArray(store.students)) store.students = [];

  for (const row of input) {
    const student = normalizeImportedStudent(row, session);
    if (!student) {
      skipped += 1;
      continue;
    }

    const index = store.students.findIndex(item => item.id === student.id);
    if (index >= 0) {
      store.students[index] = { ...store.students[index], ...student };
      updated += 1;
    } else {
      store.students.push(student);
      inserted += 1;
    }
  }

  if (skipped > 0) warnings.push("Skipped " + skipped + " rows without a usable student name/identity.");
  return { row_count: inserted + updated, inserted, updated, skipped, warnings };
}

function importedStudentDto(student) {
  return {
    id: student.id,
    full_name: student.full_name || student.fullName || student.name || "",
    email: student.email || null,
    external_username: student.external_username || student.externalUsername || null,
    external_id: student.external_id || student.externalId || null,
    updated_at: student.updated_at || student.updatedAt || null
  };
}
'''

if "function importSessionFromRequest(req)" not in server:
    server = server.replace("function buildGradesCsv()", helpers.strip() + "\n\nfunction buildGradesCsv()")

routes = r'''
app.post("/api/import", (req, res) => {
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const body = req.body || {};
  const reportType = body.report_type || body.reportType;
  if (reportType !== "students") {
    return res.status(400).json({
      ok: false,
      error: "UNSUPPORTED_REPORT_TYPE_FOR_RENDER_IMPORT",
      detail: "Render-first import currently supports Participants/Students only. Grades, logs and completion are intentionally blocked until students import is verified."
    });
  }

  const result = upsertImportedStudents(Array.isArray(body.payload) ? body.payload : [], session);

  if (!Array.isArray(store.importBatches)) store.importBatches = [];
  const batch = {
    id: crypto.randomUUID(),
    report_type: "students",
    file_name: body.file_name || null,
    row_count: result.row_count,
    status: result.skipped > 0 ? "partial" : "completed",
    imported_by_username: session.moodleUsername || session.teacherName || null,
    detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null,
    source_kind: body.source_kind || "unknown",
    warnings: result.warnings,
    created_at: new Date().toISOString()
  };

  store.importBatches.push(batch);
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();

  res.json({ ok: true, batch_id: batch.id, row_count: result.row_count, inserted: result.inserted, updated: result.updated, skipped: result.skipped, warnings: result.warnings });
});

app.get("/api/imports/students", (req, res) => {
  const session = importSessionFromRequest(req);
  if (!session) return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });

  const spaceId = session.spaceId || "unknown-space";
  const students = store.students
    .filter(student => !student.space_id || student.space_id === spaceId)
    .map(importedStudentDto)
    .filter(student => student.full_name);

  res.json({ ok: true, students });
});
'''

if 'app.post("/api/import"' not in server:
    server = server.replace('app.get("/api/imports/overview"', routes.strip() + '\n\napp.get("/api/imports/overview"')

write(SERVER, server)

imports = read(IMPORTS)
require(imports, "export function useImportedStudents()", "useImportedStudents")
require(imports, "export async function postImport", "postImport")

new_students = r'''export function useImportedStudents() {
  const [data, setData] = useState<ImportedStudent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); setData([]); return; }
    setLoading(true);

    try {
      const nodeRes = await fetch("/api/imports/students?t=" + encodeURIComponent(token), { credentials: "include" });
      if (nodeRes.ok) {
        const nodePayload = await nodeRes.json();
        if (nodePayload && !nodePayload.error) {
          setError(null);
          setData(nodePayload.students ?? []);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Supabase fallback below.
    }

    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_list_students", { _token: token });
    setLoading(false);
    if (e) { setError(null); setData([]); return; }
    const p = d as { error?: string; students?: ImportedStudent[] };
    if (p?.error) { setError(null); setData([]); return; }
    setError(null);
    setData(p.students ?? []);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}'''

imports = replace_between(imports, "export function useImportedStudents()", "export interface GradesMatrix", new_students, "useImportedStudents")

new_post = r'''export async function postImport(body: {
  report_type: "students" | "grades" | "logs" | "completion";
  file_name?: string;
  file_size_bytes?: number;
  source_kind?: "upload" | "paste";
  detection_confidence?: number;
  column_mapping?: Record<string, string>;
  payload: unknown;
}): Promise<{ ok: boolean; batch_id?: string; row_count?: number; warnings?: string[]; error?: string; detail?: string }> {
  const token = getLtiToken();
  if (!token) return { ok: false, error: "missing_session" };

  try {
    const nodeRes = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lti-session": token },
      credentials: "include",
      body: JSON.stringify({ ...body, token }),
    });
    const nodePayload = await nodeRes.json().catch(() => null);
    if (nodeRes.ok && nodePayload) return nodePayload;
    if (body.report_type === "students" && nodePayload) return nodePayload;
  } catch {
    // Supabase fallback below.
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-moodle-report`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-lti-session": token,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}'''

imports = replace_between(imports, "export async function postImport", "export interface CourseChapter", new_post, "postImport")
write(IMPORTS, imports)

print("PATCH_RENDER_FIRST_PARTICIPANTS_IMPORT_V3_OK")
