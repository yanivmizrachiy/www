const fs = require("fs");

function read(p) { return fs.readFileSync(p, "utf8"); }
function write(p, c) { fs.writeFileSync(p, c, "utf8"); }
function must(text, needle, label) {
  if (!text.includes(needle)) throw new Error(`Missing expected anchor: ${label}`);
}

let server = read("src/server.js");

server = server.replace(
  `    activitySessions: [],\n    moodleCaptures: [],`,
  `    activitySessions: [],\n    moodleCaptures: [],\n    importBatches: [],\n    gradeItems: [],\n    chapters: [],\n    logEvents: [],\n    completionRows: [],`
);

const helperAnchor = `function buildGradesCsv() {`;
must(server, helperAnchor, "buildGradesCsv");

const importHelpers = `
function getImportSession(req) {
  const body = req.body || {};
  const token =
    (typeof body.token === "string" && body.token) ||
    (typeof req.query?.t === "string" && req.query.t) ||
    (typeof req.headers["x-lti-session"] === "string" && req.headers["x-lti-session"]) ||
    "";
  return getSessionFromToken(token) || getSession(req);
}

function normalizeImportKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\\u200e\\u200f"׳״'\`]/g, "")
    .replace(/\\s+/g, "")
    .replace(/[._\\-:()[\\]{}]/g, "")
    .trim();
}

function pickImportValue(row, candidates) {
  if (!row || typeof row !== "object") return "";
  const byKey = new Map(Object.keys(row).map(k => [normalizeImportKey(k), k]));
  for (const c of candidates) {
    const key = byKey.get(normalizeImportKey(c));
    if (key && row[key] != null && String(row[key]).trim()) return String(row[key]).trim();
  }
  return "";
}

function normalizeStudentRow(row, sessionData) {
  const firstName = pickImportValue(row, ["שם פרטי", "First name", "Firstname", "first_name"]);
  const lastName = pickImportValue(row, ["שם משפחה", "Surname", "Last name", "lastname", "last_name"]);
  const fullName =
    pickImportValue(row, ["שם מלא", "Full name", "שם", "Name"]) ||
    [firstName, lastName].filter(Boolean).join(" ").trim();

  const email = pickImportValue(row, [
    "כתובת דואל", "כתובת דוא״ל", "כתובת דוא\\"ל", "דואל", "דוא״ל",
    "דואר אלקטרוני", "Email address", "Email"
  ]);

  const externalUsername = pickImportValue(row, [
    "שם משתמש", "Username", "User name", "login", "מזהה משתמש"
  ]);

  const externalId = pickImportValue(row, [
    "מזהה", "ID number", "idnumber", "מספר זהות", "תז", "ת.ז.", "User ID", "user_id"
  ]);

  const identity = externalId || email || externalUsername || fullName;
  if (!fullName || !identity) return null;

  const spaceId = sessionData?.spaceId || "unknown-space";
  const id = stableId("student", `${spaceId}|${identity}`);
  const now = new Date().toISOString();

  return {
    id,
    full_name: fullName,
    fullName,
    email: email || null,
    external_username: externalUsername || null,
    external_id: externalId || identity,
    space_id: spaceId,
    source: "moodle-import",
    updated_at: now,
    updatedAt: now
  };
}

function upsertImportedStudents(rows, sessionData) {
  const warnings = [];
  const input = Array.isArray(rows) ? rows : [];
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  if (!Array.isArray(store.students)) store.students = [];

  for (const row of input) {
    const student = normalizeStudentRow(row, sessionData);
    if (!student) {
      skipped++;
      continue;
    }

    const idx = store.students.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      store.students[idx] = { ...store.students[idx], ...student };
      updated++;
    } else {
      store.students.push(student);
      inserted++;
    }
  }

  if (skipped > 0) warnings.push(`Skipped ${skipped} rows without a usable student name/identity.`);

  return { row_count: inserted + updated, inserted, updated, skipped, warnings };
}

function toImportedStudentDto(student) {
  return {
    id: student.id,
    full_name: student.full_name || student.fullName || student.name || "",
    email: student.email || null,
    external_username: student.external_username || student.externalUsername || null,
    external_id: student.external_id || student.externalId || null,
    updated_at: student.updated_at || student.updatedAt || null
  };
}
`;

if (!server.includes("function getImportSession(req)")) {
  server = server.replace(helperAnchor, `${importHelpers}\n${helperAnchor}`);
}

const overviewAnchor = `app.get("/api/imports/overview", (req, res) => {`;
must(server, overviewAnchor, "imports overview route");

const importRoutes = `
app.post("/api/import", (req, res) => {
  const sessionData = getImportSession(req);
  if (!sessionData) {
    return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  }

  const body = req.body || {};
  const reportType = body.report_type || body.reportType;
  if (reportType !== "students") {
    return res.status(400).json({
      ok: false,
      error: "UNSUPPORTED_REPORT_TYPE_FOR_NODE_IMPORT",
      detail: "Render-first import currently supports Participants/Students only. Grades/logs/completion are intentionally blocked until students import is verified."
    });
  }

  const rows = Array.isArray(body.payload) ? body.payload : [];
  const result = upsertImportedStudents(rows, sessionData);

  if (!Array.isArray(store.importBatches)) store.importBatches = [];
  const batch = {
    id: crypto.randomUUID(),
    report_type: "students",
    file_name: body.file_name || null,
    row_count: result.row_count,
    status: result.skipped > 0 ? "partial" : "completed",
    imported_by_username: sessionData.moodleUsername || sessionData.teacherName || null,
    detection_confidence: typeof body.detection_confidence === "number" ? body.detection_confidence : null,
    created_at: new Date().toISOString(),
    warnings: result.warnings,
    source_kind: body.source_kind || "unknown"
  };

  store.importBatches.push(batch);
  store.settings.lastSyncAt = new Date().toISOString();
  saveStore();

  res.json({
    ok: true,
    batch_id: batch.id,
    row_count: result.row_count,
    inserted: result.inserted,
    updated: result.updated,
    skipped: result.skipped,
    warnings: result.warnings
  });
});

app.get("/api/imports/students", (req, res) => {
  const sessionData = getImportSession(req);
  if (!sessionData) {
    return res.status(401).json({ ok: false, error: "NO_VERIFIED_MOODLE_SESSION" });
  }

  const spaceId = sessionData.spaceId || "unknown-space";
  const students = (Array.isArray(store.students) ? store.students : [])
    .filter(s => !s.space_id || s.space_id === spaceId)
    .map(toImportedStudentDto)
    .filter(s => s.full_name);

  res.json({ ok: true, students });
});
`;

if (!server.includes('app.post("/api/import"')) {
  server = server.replace(overviewAnchor, `${importRoutes}\n${overviewAnchor}`);
}

write("src/server.js", server);

let importsHook = read("src/hooks/useImports.tsx");

const oldStudentsBlock = `  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const { data: d, error: e } = await (supabase.rpc as unknown as Rpc)("lti_list_students", { _token: token });
    setLoading(false);
    if (e) { setError(e.message); return; }
    const p = d as { error?: string; students?: ImportedStudent[] };
    if (p?.error) { setError(p.error); return; }
    setError(null);
    setData(p.students ?? []);
  }, []);`;

const newStudentsBlock = `  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!token) { setLoading(false); setData([]); return; }
    setLoading(true);

    try {
      const nodeRes = await fetch(\`/api/imports/students?t=\${encodeURIComponent(token)}\`, {
        credentials: "include",
      });
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
    if (e) {
      setError(null);
      setData([]);
      return;
    }
    const p = d as { error?: string; students?: ImportedStudent[] };
    if (p?.error) { setError(null); setData([]); return; }
    setError(null);
    setData(p.students ?? []);
  }, []);`;

if (!importsHook.includes("fetch(`/api/imports/students")) {
  must(importsHook, oldStudentsBlock, "useImportedStudents refresh block");
  importsHook = importsHook.replace(oldStudentsBlock, newStudentsBlock);
}

const oldPostBlock = `  const url = \`${'${import.meta.env.VITE_SUPABASE_URL}'}/functions/v1/import-moodle-report\`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-lti-session": token,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: \`Bearer ${'${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}'}\`,
    },
    body: JSON.stringify(body),
  });
  return res.json();`;

const newPostBlock = `  try {
    const nodeRes = await fetch("/api/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lti-session": token,
      },
      credentials: "include",
      body: JSON.stringify({ ...body, token }),
    });

    const nodePayload = await nodeRes.json().catch(() => null);
    if (nodeRes.ok && nodePayload) return nodePayload;
    if (body.report_type === "students" && nodePayload) return nodePayload;
  } catch {
    // Supabase fallback below.
  }

  const url = \`${'${import.meta.env.VITE_SUPABASE_URL}'}/functions/v1/import-moodle-report\`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-lti-session": token,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: \`Bearer ${'${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}'}\`,
    },
    body: JSON.stringify(body),
  });
  return res.json();`;

if (!importsHook.includes('fetch("/api/import"')) {
  must(importsHook, oldPostBlock, "postImport Supabase block");
  importsHook = importsHook.replace(oldPostBlock, newPostBlock);
}

write("src/hooks/useImports.tsx", importsHook);

console.log("PATCH_RENDER_FIRST_PARTICIPANTS_IMPORT_OK");
