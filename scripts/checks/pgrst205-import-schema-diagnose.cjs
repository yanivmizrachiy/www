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

(async () => {
  const [health, persistence, schema, readiness] = await Promise.all([
    getJson("/health"),
    getJson("/api/persistence/validate"),
    getJson("/api/import/schema-diagnostics"),
    getJson("/api/release/readiness"),
  ]);

  const persistenceJson = persistence.json || {};
  const schemaJson = schema.json || {};
  const tables = Array.isArray(persistenceJson.tables) ? persistenceJson.tables : [];
  const interesting = tables.filter((row) =>
    ["teachers", "courses", "import_batches", "students", "teacher_sessions"].includes(row.table)
  );

  const importBatchProbeErrors = (schemaJson.probes || [])
    .filter((p) => p.table === "import_batches" && !p.ok)
    .map((p) => ({ error_code: p.error_code, error_message: p.error_message, columns: p.columns }));

  const result = {
    ok: true,
    mode: "pgrst205-import-schema-diagnose",
    version: "MTH_PGRST205_IMPORT_SCHEMA_DIAGNOSE_V1",
    live_base_url: base,
    checked_at: new Date().toISOString(),
    health: health.json ? {
      ok: health.json.ok,
      supabaseConfigured: health.json.supabaseConfigured,
      readyForMoodleUse: health.json.readyForMoodleUse,
      activeRuntime: health.json.activeRuntime
    } : health,
    persistence: {
      ok: persistenceJson.ok,
      configured: persistenceJson.configured,
      supabase_host: persistenceJson.supabase_host,
      production_persistence_ready: persistenceJson.production_persistence_ready,
      missing_tables: persistenceJson.missing_tables,
      interesting_tables: interesting
    },
    import_schema: {
      ok: schemaJson.ok,
      summary: schemaJson.summary,
      import_batch_probe_errors: importBatchProbeErrors
    },
    readiness: readiness.json ? {
      teacher_release_ready: readiness.json.teacher_release_ready,
      teacher_release_readiness_percent: readiness.json.teacher_release_readiness_percent,
      blockers_count: readiness.json.blockers_count,
      sync_summary: readiness.json.sync_summary
    } : readiness,
    conclusion: {
      pgrst205_means: "PostgREST cannot see public.import_batches in its exposed schema cache during /api/import.",
      most_likely_fix: "Run the non-destructive SQL file supabase/manual_sql/20260514_fix_pgrst205_import_batches_students.sql in the Supabase SQL Editor, then retry Participants import.",
      do_not_do: [
        "Do not delete data",
        "Do not set Teacher Release YES",
        "Do not commit student rows",
        "Do not keep changing React UI for this error"
      ]
    },
    safety: {
      no_writes_performed: true,
      no_sql_executed_by_this_script: true,
      no_student_rows_returned: true,
      no_secret_values_returned: true
    }
  };

  console.log(JSON.stringify(result, null, 2));
})();
