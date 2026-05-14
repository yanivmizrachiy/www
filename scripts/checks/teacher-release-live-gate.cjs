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
        try {
          resolve({ ok: true, status: res.statusCode, url, json: JSON.parse(body) });
        } catch {
          resolve({ ok: false, status: res.statusCode, url, error: "JSON_PARSE_FAILED", preview: body.slice(0, 500) });
        }
      });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0, url, error: "TIMEOUT" });
    });
    req.on("error", (err) => resolve({ ok: false, status: 0, url, error: String(err.message || err) }));
  });
}

function tableCount(persistence, tableName) {
  const row = (persistence?.tables || []).find((item) => item.table === tableName);
  return typeof row?.count === "number" ? row.count : 0;
}

(async () => {
  const [persistenceRes, readinessRes, ltiRes, schemaRes] = await Promise.all([
    getJson("/api/persistence/validate"),
    getJson("/api/release/readiness"),
    getJson("/api/lti/diagnostics"),
    getJson("/api/import/schema-diagnostics"),
  ]);

  const persistence = persistenceRes.json || {};
  const readiness = readinessRes.json || {};
  const lti = ltiRes.json || {};
  const schema = schemaRes.json || {};

  const counts = {
    teachers: tableCount(persistence, "teachers"),
    courses: tableCount(persistence, "courses"),
    students: tableCount(persistence, "students"),
    import_batches: tableCount(persistence, "import_batches"),
    grade_items: tableCount(persistence, "grade_items"),
    grade_results: tableCount(persistence, "grade_results"),
    log_events: tableCount(persistence, "log_events"),
    teacher_sessions: tableCount(persistence, "teacher_sessions"),
    lti_launches: tableCount(persistence, "lti_launches"),
  };

  const gates = [
    {
      key: "live_endpoints_ok",
      pass: persistenceRes.ok && readinessRes.ok && ltiRes.ok,
      severity: "required",
      message_he: "כל endpoints החיים צריכים להחזיר JSON תקין."
    },
    {
      key: "supabase_tables_ready",
      pass: persistence.production_persistence_ready === true && Array.isArray(persistence.missing_tables) && persistence.missing_tables.length === 0,
      severity: "required",
      message_he: "כל טבלאות Supabase קיימות וללא missing_tables."
    },
    {
      key: "import_schema_compatible",
      pass: schema?.summary?.import_batches_any_ok === true && schema?.summary?.students_any_ok === true,
      severity: "required",
      message_he: "עמודות import_batches ו־students זמינות לקריאה בטוחה."
    },
    {
      key: "participants_imported",
      pass: counts.students > 0 && counts.import_batches > 0,
      severity: "data_required",
      message_he: "נדרש ייבוא Participants אמיתי כך ש־students ו־import_batches יהיו גדולים מ־0."
    },
    {
      key: "gradebook_imported",
      pass: counts.grade_items > 0 || counts.grade_results > 0,
      severity: "data_required",
      message_he: "נדרש ייבוא Gradebook אמיתי."
    },
    {
      key: "logs_imported",
      pass: counts.log_events > 0,
      severity: "data_required",
      message_he: "נדרש ייבוא Logs אמיתי כדי לחשב זמן תרגול."
    },
    {
      key: "teacher_sessions_seen",
      pass: counts.teacher_sessions > 0 || (lti?.safe_counts?.token_sessions || 0) > 0,
      severity: "required",
      message_he: "נדרשת פתיחה אמיתית מתוך Moodle."
    },
    {
      key: "teacher_release_flag",
      pass: readiness.teacher_release_ready === true,
      severity: "final",
      message_he: "Teacher Release הופך true רק אחרי שכל שערי האמת עוברים."
    }
  ];

  const requiredOpen = gates.filter((g) => g.severity !== "final" && !g.pass);
  const dataOpen = gates.filter((g) => g.severity === "data_required" && !g.pass);

  const codePercent =
    50 +
    (persistence.production_persistence_ready ? 10 : 0) +
    (schema?.summary?.import_batches_any_ok ? 7 : 0) +
    (schema?.summary?.students_any_ok ? 7 : 0) +
    (counts.teacher_sessions > 0 ? 6 : 0) +
    (counts.students > 0 && counts.import_batches > 0 ? 10 : 0) +
    (counts.grade_items > 0 || counts.grade_results > 0 ? 5 : 0) +
    (counts.log_events > 0 ? 5 : 0);

  const result = {
    ok: true,
    mode: "teacher-release-live-gate",
    version: "MTH_TEACHER_RELEASE_LIVE_GATE_V1",
    live_base_url: base,
    checked_at: new Date().toISOString(),
    percents: {
      repo_code_estimate_percent: Math.min(95, codePercent),
      live_teacher_release_percent: readiness.teacher_release_readiness_percent ?? null,
      teacher_release_ready: readiness.teacher_release_ready === true
    },
    counts,
    gates,
    open_required_gates: requiredOpen.map((g) => g.key),
    open_data_gates: dataOpen.map((g) => g.key),
    next_manual_he: [
      counts.students > 0 && counts.import_batches > 0 ? null : "לייבא Participants אמיתי מתוך Moodle.",
      (counts.grade_items > 0 || counts.grade_results > 0) ? null : "לייבא Gradebook אמיתי מתוך Moodle.",
      counts.log_events > 0 ? null : "לייבא Logs אמיתי מתוך Moodle.",
      "לא לאשר Teacher Release עד שכל השערים עוברים.",
      "לא להכניס נתוני תלמידים לריפו."
    ].filter(Boolean),
    safety: {
      no_student_rows_returned: true,
      no_secret_values_returned: true,
      aggregate_counts_only: true,
      no_writes_performed: true,
      no_release_flag_changed: true
    }
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(requiredOpen.length ? 2 : 0);
})().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err.message || err) }, null, 2));
  process.exit(1);
});
