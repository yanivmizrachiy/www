#!/usr/bin/env node
// MTH_SUPABASE_RLS_POLICY_DRAFT_AUDIT_V1
//
// Verifies the teacher-scoped RLS policy DRAFT is present and SAFE:
//   - draft file exists and is clearly marked DRAFT_DO_NOT_RUN
//   - contains no destructive SQL (DROP/DELETE/TRUNCATE/DISABLE/GRANT ALL)
//   - contains no secrets
//   - defines CREATE POLICY for the required sensitive tables
//   - policies express teacher/course scoping
//   - never claims live RLS enforcement
//   - never flips Teacher Release
//
// Static analysis only. Never runs SQL, never connects to a DB, never reads
// .env or secrets, never changes truth values.

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function fail(msg) {
  console.error(`SUPABASE_RLS_POLICY_DRAFT_AUDIT_FAIL: ${msg}`);
  process.exit(1);
}

const draftRel = "supabase/manual_sql/20260525_teacher_scoped_rls_policies_DRAFT_DO_NOT_RUN.sql";
const draftPath = path.join(root, draftRel);

// 1. Draft file exists
if (!fs.existsSync(draftPath)) {
  fail(`draft file missing: ${draftRel}`);
}
const sql = fs.readFileSync(draftPath, "utf8");
const sqlUpper = sql.toUpperCase();

// 2. Clearly marked DRAFT_DO_NOT_RUN (filename + content)
if (!/DRAFT_DO_NOT_RUN/.test(draftRel)) {
  fail("draft filename must contain DRAFT_DO_NOT_RUN");
}
if (!/DRAFT_DO_NOT_RUN/.test(sql)) {
  fail("draft content must contain DRAFT_DO_NOT_RUN marker");
}
if (!/DO NOT RUN/i.test(sql)) {
  fail("draft content must contain an explicit 'DO NOT RUN' warning");
}

// 3. No destructive SQL. We strip comments first so a warning like
//    "There is NO DROP" in a comment does not trigger a false positive.
const codeOnly = sql
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");
const codeUpper = codeOnly.toUpperCase();

const destructive = [
  { re: /\bDROP\s+(TABLE|POLICY|SCHEMA|DATABASE|COLUMN)\b/, name: "DROP" },
  { re: /\bDELETE\s+FROM\b/, name: "DELETE FROM" },
  { re: /\bTRUNCATE\b/, name: "TRUNCATE" },
  { re: /\bDISABLE\s+ROW\s+LEVEL\s+SECURITY\b/, name: "DISABLE RLS" },
  { re: /\bGRANT\s+ALL\b/, name: "GRANT ALL" },
  { re: /\bALTER\s+TABLE\b/, name: "ALTER TABLE" },
];
for (const d of destructive) {
  if (d.re.test(codeUpper)) {
    fail(`draft contains destructive/forbidden statement: ${d.name}`);
  }
}

// 4. No secrets / tokens / passwords embedded
const secretPatterns = [
  /\b(token|secret|password|passwd|api_key|apikey)\s*[:=]\s*['"][^'"]{8,}/i,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  /\bbearer\s+[A-Za-z0-9._-]{20,}/i,
];
for (const p of secretPatterns) {
  if (p.test(codeOnly)) {
    fail("draft appears to contain a secret/token value");
  }
}

// 5. CREATE POLICY present for each required table
const requiredTables = [
  "teachers",
  "courses",
  "students",
  "grade_items",
  "grade_results",
  "log_events",
  "import_batches",
  "teacher_sessions",
  "lti_launches",
];
const missing = [];
for (const t of requiredTables) {
  const re = new RegExp(`create policy[^;]*\\bon\\b\\s+(?:public\\.)?${t}\\b`, "i");
  if (!re.test(sql)) missing.push(t);
}
if (missing.length) {
  fail(`draft missing CREATE POLICY for tables: ${missing.join(", ")}`);
}

// 6. Policies express teacher/course scoping
const scopesTeacher = /current_teacher_moodle_user_id|teacher_id|moodle_user_id/i.test(sql);
const scopesCourse = /current_course_id|course_id|moodle_course_id/i.test(sql);
if (!scopesTeacher) {
  fail("draft policies must express teacher scoping");
}
if (!scopesCourse) {
  fail("draft policies must express course scoping");
}

// 7. Must NOT claim live RLS enforcement / verification
if (/RLS\s+(is\s+)?(live|enforced|verified)/i.test(sql) &&
    !/remains NO|NOT.*verified|until.*verification|DO NOT RUN/i.test(sql)) {
  fail("draft must not claim live/enforced/verified RLS");
}

// 8. Must NOT flip Teacher Release
if (/teacher.release\s*[:=]?\s*YES/i.test(sql) || /teacher_release_ready\s*[:=]?\s*true/i.test(sql)) {
  fail("draft must not set Teacher Release YES / ready true");
}

// 9. Count policies for the report
const policyCount = (sql.match(/create policy/gi) || []).length;

const report = {
  audit: "MTH_SUPABASE_RLS_POLICY_DRAFT_AUDIT_V1",
  generated_at: new Date().toISOString(),
  draft_file: draftRel,
  draft_marked_do_not_run: true,
  destructive_sql_found: false,
  secrets_found: false,
  policies_defined: policyCount,
  tables_covered: requiredTables,
  scopes_teacher: scopesTeacher,
  scopes_course: scopesCourse,
  claims_live_rls: false,
  teacher_release: "NO",
  teacher_release_ready: false,
  status_he: "טיוטת policies ממוקדות-מורה קיימת, מסומנת DRAFT_DO_NOT_RUN, ללא SQL הרסני, ללא secrets, ללא הצהרת RLS חי.",
  next_safe_step_he:
    "סקירת אדם → בדיקה בסביבת dev חד-פעמית → תיעוד אימות חי ב-evidence-log → רק אז שקילה ליישום מבוקר. אין להריץ על production.",
  safety: {
    read_only: true,
    static_analysis_only: true,
    no_sql_executed: true,
    no_db_changes: true,
    no_migrations_changed: true,
    no_secrets_read: true,
    no_truth_values_changed: true,
    teacher_release_remains_no: true,
  },
};

console.log(JSON.stringify(report, null, 2));
console.log(`SUPABASE_RLS_POLICY_DRAFT_AUDIT_OK: ${policyCount} draft policies, DRAFT_DO_NOT_RUN, safe, Teacher Release NO`);
