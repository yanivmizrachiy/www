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
    getJson("/api/release/readiness"),
  ]);

  const persistence = persistenceRes.json || {};
  const readiness = readinessRes.json || {};

  const counts = {
    teachers: countOf(persistence, "teachers"),
    courses: countOf(persistence, "courses"),
    students: countOf(persistence, "students"),
    import_batches: countOf(persistence, "import_batches"),
    grade_items: countOf(persistence, "grade_items"),
    grade_results: countOf(persistence, "grade_results"),
    log_events: countOf(persistence, "log_events"),
    teacher_sessions: countOf(persistence, "teacher_sessions")
  };

  const requiredTables = new Set(persistence.required_tables || []);
  const missingTables = new Set(persistence.missing_tables || []);

  const result = {
    ok: true,
    mode: "gradebook-preflight-after-participants",
    version: "MTH_GRADEBOOK_PREFLIGHT_AFTER_PARTICIPANTS_V1",
    live_base_url: base,
    checked_at: new Date().toISOString(),
    participants_ready: counts.students > 0 && counts.import_batches > 0,
    gradebook_schema_ready:
      requiredTables.has("grade_items") &&
      requiredTables.has("grade_results") &&
      !missingTables.has("grade_items") &&
      !missingTables.has("grade_results"),
    gradebook_imported: counts.grade_items > 0 || counts.grade_results > 0,
    counts,
    next_action_he:
      counts.students > 0 && counts.import_batches > 0
        ? "לייצא Gradebook אמיתי ממודל ולהשתמש בו כדי לממש/לאמת ייבוא ציונים."
        : "לא להתחיל Gradebook לפני ש־Participants נשמרו.",
    implementation_gate: {
      do_not_fake_grades: true,
      do_not_import_without_real_gradebook_file: true,
      do_not_set_teacher_release_yes: true,
      require_real_headers_from_moodle_gradebook: true
    },
    readiness_summary: readiness.sync_summary || null,
    safety: {
      no_writes_performed: true,
      no_sql_executed: true,
      no_student_rows_returned: true,
      no_secret_values_returned: true,
      aggregate_counts_only: true,
      no_release_flag_changed: true
    }
  };

  console.log(JSON.stringify(result, null, 2));
})();
