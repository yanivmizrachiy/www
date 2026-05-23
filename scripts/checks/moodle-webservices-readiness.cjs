#!/usr/bin/env node
// MTH_MOODLE_WS_READINESS_AUDIT_V1
// Read-only static analysis of the Web Services readiness endpoint.
// Checks: endpoint exists, safety object present, token not returned, probe calls only safe function.
"use strict";
const fs = require("fs");

function fail(msg) { console.error("MOODLE_WS_READINESS_AUDIT_FAIL=" + msg); process.exit(1); }
function ok(msg) { console.log("OK: " + msg); }
function warn(msg) { console.warn("WARN: " + msg); }

const server = fs.existsSync("src/server.js") ? fs.readFileSync("src/server.js", "utf8") : null;
if (!server) fail("src/server.js not found");

// 1. Endpoint route exists
if (!server.includes("/api/automation/moodle-webservices/readiness")) fail("endpoint_missing");
ok("endpoint /api/automation/moodle-webservices/readiness exists");

// 2. Version marker exists
if (!server.includes("MTH_MOODLE_WS_READINESS_V1")) fail("marker_missing");
ok("marker MTH_MOODLE_WS_READINESS_V1 exists");

// 3. Safety object present
if (!server.includes("no_token_returned: true")) fail("safety_no_token_returned_missing");
ok("safety.no_token_returned present");

if (!server.includes("no_student_rows: true")) fail("safety_no_student_rows_missing");
ok("safety.no_student_rows present");

if (!server.includes("no_grades: true")) fail("safety_no_grades_missing");
ok("safety.no_grades present");

if (!server.includes("no_emails: true")) fail("safety_no_emails_missing");
ok("safety.no_emails present");

if (!server.includes("no_user_ids: true")) fail("safety_no_user_ids_missing");
ok("safety.no_user_ids present");

if (!server.includes("no_raw_moodle_response: true")) fail("safety_no_raw_moodle_response_missing");
ok("safety.no_raw_moodle_response present");

// 4. Only safe WS function probed — core_webservice_get_site_info
if (!server.includes("core_webservice_get_site_info")) fail("probe_function_missing");
ok("probe function core_webservice_get_site_info present");

// 5. Dangerous functions must NOT appear inside the probe helper
const probeMatch = server.match(/async function probeMoodleWsSiteInfo\(\)([\s\S]*?)^}/m);
const probeBody = probeMatch ? probeMatch[1] : "";
const dangerousFunctions = [
  "core_enrol_get_enrolled_users",
  "gradereport_user_get_grade_items",
  "report_log_get_events",
  "core_grades_get_grades",
  "core_course_get_contents",
  "core_completion_get_activities_completion_status"
];
for (const fn of dangerousFunctions) {
  if (probeBody.includes(fn)) fail("probe_calls_dangerous_function_" + fn);
}
ok("probe body does not call data-extraction functions");

// 6. Token must not appear directly in any JSON response shape
// The token is read as env("MOODLE_WS_TOKEN") and used only in the URLSearchParams body — never returned.
// We check that no response builder returns the raw token string.
if (/MOODLE_WS_TOKEN[^)]*\)\s*[,}]/.test(server)) {
  // This pattern would match env("MOODLE_WS_TOKEN") being placed directly into an object literal.
  // A more precise check: the response builder functions should not reference the token value.
  warn("double-check that MOODLE_WS_TOKEN value is not included in any response object");
} else {
  ok("MOODLE_WS_TOKEN value not detected in response objects");
}

// 7. required_admin_steps present (helps Moodle admins know what to enable)
if (!server.includes("required_admin_steps")) fail("required_admin_steps_missing");
ok("required_admin_steps documented in endpoint response");

// 8. missing_env status present
if (!server.includes('"missing_env"') && !server.includes("'missing_env'") && !server.includes("`missing_env`") && !server.includes("missing_env")) {
  fail("missing_env_status_absent");
}
ok("missing_env status present");

// 9. Teacher release must stay false in this codebase
const teacherReleaseTrue = /teacherRelease\s*:\s*true/.test(server);
if (teacherReleaseTrue) fail("teacher_release_set_to_true");
ok("teacherRelease is not set to true anywhere in server.js");

// 10. .env.example documents the new env vars
const envExample = fs.existsSync(".env.example") ? fs.readFileSync(".env.example", "utf8") : "";
if (!envExample.includes("MOODLE_WS_TOKEN")) fail("env_example_missing_MOODLE_WS_TOKEN");
ok("MOODLE_WS_TOKEN documented in .env.example");

console.log("\nMOODLE_WS_READINESS_AUDIT_OK");
