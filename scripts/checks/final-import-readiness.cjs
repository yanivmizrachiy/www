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

  const done = {
    live_endpoints_ok: persistenceRes.ok && readinessRes.ok && ltiRes.ok && schemaRes.ok,
    supabase_ready: persistence.production_persistence_ready === true && Array.isArray(persistence.missing_tables) && persistence.missing_tables.length === 0,
    import_schema_ready: schema?.summary?.import_batches_any_ok === true && schema?.summary?.students_any_ok === true,
    moodle_launch_seen: counts.teacher_sessions > 0 || (lti?.safe_counts?.token_sessions || 0) > 0,
    participants_imported: counts.students > 0 && counts.import_batches > 0,
    gradebook_imported: counts.grade_items > 0 || counts.grade_results > 0,
    logs_imported: counts.log_events > 0,
    teacher_release_ready: readiness.teacher_release_ready === true,
  };

  const manualQueue = [];
  if (!done.participants_imported) {
    manualQueue.push({
      key: "participants_import",
      title_he: "ייבוא Participants אמיתי",
      can_do_now: true,
      result_needed: "students > 0 && import_batches > 0",
      failure_capture: "בדף הייבוא ללחוץ 'העתק פרטי שגיאה בטוחים' ולהדביק בצ'אט."
    });
  }
  if (!done.gradebook_imported) {
    manualQueue.push({
      key: "gradebook_import",
      title_he: "ייבוא Gradebook אמיתי",
      can_do_now: done.participants_imported,
      result_needed: "grade_items > 0 או grade_results > 0",
      blocker_if_false: "עדיף לסיים Participants לפני Gradebook כדי לקשר ציונים לתלמידים."
    });
  }
  if (!done.logs_imported) {
    manualQueue.push({
      key: "logs_import",
      title_he: "ייבוא Logs אמיתי",
      can_do_now: done.participants_imported,
      result_needed: "log_events > 0",
      blocker_if_false: "עדיף לסיים Participants לפני Logs כדי לשייך ראיות פעילות לתלמידים; זמן רשמי דורש duration מאומת."
    });
  }

  const automaticDoneCount = [
    done.live_endpoints_ok,
    done.supabase_ready,
    done.import_schema_ready,
    done.moodle_launch_seen
  ].filter(Boolean).length;

  const dataDoneCount = [
    done.participants_imported,
    done.gradebook_imported,
    done.logs_imported
  ].filter(Boolean).length;

  const result = {
    ok: true,
    mode: "final-import-readiness",
    version: "MTH_FINAL_IMPORT_READINESS_V1",
    live_base_url: base,
    checked_at: new Date().toISOString(),
    percents: {
      automatic_infrastructure_percent: Math.round((automaticDoneCount / 4) * 100),
      real_data_import_percent: Math.round((dataDoneCount / 3) * 100),
      live_teacher_release_percent: readiness.teacher_release_readiness_percent ?? null,
      teacher_release_ready: readiness.teacher_release_ready === true
    },
    counts,
    done,
    manual_queue: manualQueue,
    next_best_action_he: manualQueue[0]?.title_he || "כל ייבואי הדאטה עברו; לבצע בדיקת בידוד שני מורים/מרחבים.",
    safety: {
      no_student_rows_returned: true,
      no_secret_values_returned: true,
      aggregate_counts_only: true,
      no_writes_performed: true,
      no_sql_executed: true,
      no_release_flag_changed: true
    }
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
})().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err.message || err) }, null, 2));
  process.exit(1);
});
