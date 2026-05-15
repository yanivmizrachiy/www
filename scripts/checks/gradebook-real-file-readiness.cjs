#!/usr/bin/env node
const https = require("node:https");

const base = (process.env.MTH_LIVE_BASE_URL || "https://www-tijc.onrender.com").replace(/\/+$/, "");

function getJson(path) {
  const url = base + path;
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try { resolve({ ok: true, status: res.statusCode, url, json: JSON.parse(body) }); }
        catch { resolve({ ok: false, status: res.statusCode, url, error: "JSON_PARSE_FAILED", preview: body.slice(0, 500) }); }
      });
    });
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: 0, url, error: "TIMEOUT" }); });
    req.on("error", (err) => resolve({ ok: false, status: 0, url, error: String(err.message || err) }));
  });
}

function countOf(persistence, table) {
  const row = (persistence?.tables || []).find((x) => x.table === table);
  return typeof row?.count === "number" ? row.count : 0;
}

(async () => {
  const [persistenceRes, readinessRes] = await Promise.all([
    getJson("/api/persistence/validate"),
    getJson("/api/release/readiness")
  ]);

  const persistence = persistenceRes.json || {};
  const readiness = readinessRes.json || {};

  const counts = {
    students: countOf(persistence, "students"),
    import_batches: countOf(persistence, "import_batches"),
    grade_items: countOf(persistence, "grade_items"),
    grade_results: countOf(persistence, "grade_results"),
    log_events: countOf(persistence, "log_events")
  };

  const result = {
    ok: true,
    mode: "gradebook-real-file-schema-readiness",
    version: "MTH_GRADEBOOK_REAL_FILE_SCHEMA_READINESS_V1",
    live_base_url: base,
    checked_at: new Date().toISOString(),
    participants_ready: counts.students > 0 && counts.import_batches > 0,
    gradebook_schema_ready:
      Array.isArray(persistence.missing_tables) &&
      !persistence.missing_tables.includes("grade_items") &&
      !persistence.missing_tables.includes("grade_results"),
    gradebook_imported: counts.grade_items > 0 && counts.grade_results > 0,
    counts,
    next_action_he: counts.grade_items > 0 && counts.grade_results > 0
      ? "Gradebook כבר מיובא. השלב הבא הוא Logs."
      : "להריץ SQL Gradebook בטוח אם צריך, ואז לממש/להפעיל ייבוא ציונים אמיתי.",
    readiness: {
      teacher_release_ready: readiness.teacher_release_ready,
      teacher_release_readiness_percent: readiness.teacher_release_readiness_percent,
      blockers_count: readiness.blockers_count
    },
    safety: {
      no_writes_performed: true,
      no_sql_executed: true,
      no_student_rows_returned: true,
      no_grade_rows_returned: true,
      no_secret_values_returned: true,
      no_release_flag_changed: true
    }
  };

  console.log(JSON.stringify(result, null, 2));
})();
