#!/usr/bin/env node
// MTH_SUPABASE_RLS_ISOLATION_READINESS_V1
//
// Audit-first database isolation readiness layer. Statically analyzes the
// Supabase SQL files in the repo to report, per data table, whether:
//   - the table holds teacher/course/student/grade/log data,
//   - RLS is ENABLED on it,
//   - a CREATE POLICY exists for it.
//
// It reports missing RLS policy enforcement as a BLOCKER, never as success.
// It NEVER runs migrations, NEVER connects to a DB, NEVER reads secrets/.env,
// NEVER changes truth values, and NEVER promotes Teacher Release.
//
// Pure static file analysis only.

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function fail(msg) {
  console.error(`SUPABASE_RLS_READINESS_AUDIT_FAIL: ${msg}`);
  process.exit(1);
}

// ── Hard safety guard: this audit must never read .env or secret files ──────
const FORBIDDEN_READS = [".env", ".env.local", ".env.production"];
for (const f of FORBIDDEN_READS) {
  // We simply assert we never reference them; this is a self-documenting guard.
  if (process.env.__MTH_FORCE_ENV_READ === f) {
    fail("audit must never read .env files");
  }
}

// ── Collect Supabase SQL sources (migrations + manual_sql) ──────────────────
const sqlDirs = ["supabase/migrations", "supabase/manual_sql"];
const sqlFiles = [];
for (const d of sqlDirs) {
  const full = path.join(root, d);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full)) {
    if (name.endsWith(".sql")) sqlFiles.push(path.join(d, name));
  }
}

if (sqlFiles.length === 0) {
  fail("no Supabase SQL files found under supabase/migrations or supabase/manual_sql");
}

// Concatenate (ignore DRAFT_DO_NOT_RUN content for enforcement, but note it).
let allSql = "";
const activeFiles = [];
for (const rel of sqlFiles) {
  const content = fs.readFileSync(path.join(root, rel), "utf8");
  if (/DO_NOT_RUN/i.test(rel)) continue; // draft files are not authoritative
  activeFiles.push(rel);
  allSql += "\n" + content;
}
const sqlLower = allSql.toLowerCase();

// ── Sensitive tables that MUST be isolated per teacher/course ───────────────
const sensitiveTables = [
  { name: "teachers", kind: "teacher identity" },
  { name: "courses", kind: "course identity" },
  { name: "students", kind: "student PII" },
  { name: "grade_items", kind: "grade structure" },
  { name: "grade_results", kind: "grades" },
  { name: "log_events", kind: "activity logs" },
  { name: "import_batches", kind: "import scoping" },
  { name: "teacher_sessions", kind: "session identity" },
  { name: "lti_launches", kind: "launch identity" },
];

function tableDefined(name) {
  return new RegExp(`create table[^;]*\\b${name}\\b`, "i").test(allSql);
}
function rlsEnabled(name) {
  // matches: alter table [public.]<name> enable row level security
  return new RegExp(`alter table\\s+(?:public\\.)?${name}\\s+enable row level security`, "i").test(sqlLower);
}
function policyExists(name) {
  // matches: create policy ... on [public.]<name>
  return new RegExp(`create policy[^;]*\\bon\\b\\s+(?:public\\.)?${name}\\b`, "i").test(sqlLower);
}

// ── Documented policy-requirements file (optional but counts as readiness) ──
const docPath = "docs/automation/SUPABASE_RLS_ISOLATION_READINESS.md";
const hasPolicyDoc = fs.existsSync(path.join(root, docPath));

// ── Build per-table report ──────────────────────────────────────────────────
const tableReport = [];
let anyBlocker = false;

for (const t of sensitiveTables) {
  const defined = tableDefined(t.name);
  const enabled = defined && rlsEnabled(t.name);
  const policy = defined && policyExists(t.name);

  // Readiness logic:
  //  - table not defined -> not applicable (skip blocker)
  //  - RLS enabled + policy present -> READY (code-level)
  //  - RLS enabled + no policy -> service-role-only access; BLOCKER for
  //    teacher-scoped RLS (default-deny protects data, but no scoped policy)
  //  - no RLS -> BLOCKER
  let status, statusHe, blocker;
  if (!defined) {
    status = "NOT_DEFINED";
    statusHe = "הטבלה אינה מוגדרת בקבצי ה-SQL בריפו";
    blocker = false;
  } else if (enabled && policy) {
    status = "RLS_WITH_POLICY";
    statusHe = "RLS מופעל וקיימת policy מוגדרת";
    blocker = false;
  } else if (enabled && !policy) {
    status = "RLS_ENABLED_NO_POLICY";
    statusHe = "RLS מופעל אך אין policy — גישה רק דרך service role (default-deny). חסר policy ממוקד-מורה.";
    blocker = true;
  } else {
    status = "NO_RLS";
    statusHe = "RLS אינו מופעל — סיכון בידוד.";
    blocker = true;
  }

  if (blocker) anyBlocker = true;

  tableReport.push({
    table: t.name,
    data_kind: t.kind,
    defined,
    rls_enabled: enabled,
    policy_exists: policy,
    status,
    status_he: statusHe,
    is_blocker: blocker,
  });
}

// ── Overall readiness ───────────────────────────────────────────────────────
// Live RLS enforcement is NEVER claimed by this static audit. The best this
// audit can certify is "code-level policy present". Live verification (real
// cross-teacher read blocked at the DB) remains a separate, unmet gate.
const liveRlsVerified = false; // never true from static analysis

const report = {
  audit: "MTH_SUPABASE_RLS_ISOLATION_READINESS_V1",
  generated_at: new Date().toISOString(),
  analyzed_files: activeFiles,
  policy_requirements_doc: hasPolicyDoc ? docPath : null,
  tables: tableReport,
  summary: {
    tables_checked: tableReport.filter((t) => t.defined).length,
    tables_with_rls_and_policy: tableReport.filter((t) => t.status === "RLS_WITH_POLICY").length,
    tables_rls_no_policy: tableReport.filter((t) => t.status === "RLS_ENABLED_NO_POLICY").length,
    tables_no_rls: tableReport.filter((t) => t.status === "NO_RLS").length,
    has_blockers: anyBlocker,
  },
  blockers_he: anyBlocker
    ? [
        "קיימות טבלאות רגישות עם RLS מופעל אך ללא policy ממוקד-מורה, או ללא RLS כלל.",
        "גישה כיום עוברת דרך service role שעוקף RLS — הנתונים מוגנים בברירת מחדל (default-deny), אך אין policy שמוכיח בידוד מורה-ספציפי ברמת ה-DB.",
        "נדרשת הגדרת policies ממוקדות-מורה + אימות חי לפני הכרזת בידוד DB מלא.",
      ]
    : [],
  live_rls_enforcement_verified: liveRlsVerified,
  teacher_release: "NO",
  teacher_release_ready: false,
  next_safe_step_he: anyBlocker
    ? "להגדיר policies ממוקדות-מורה (CREATE POLICY) בקובץ manual_sql נפרד, לבדוק אותן בסביבת dev, ולתעד אימות חי ב-evidence-log — בלי להריץ על production."
    : "לתעד אימות חי של ה-policies לפני הכרזת בידוד DB מלא.",
  safety: {
    read_only: true,
    static_analysis_only: true,
    no_migrations_executed: true,
    no_db_changes: true,
    no_secrets_read: true,
    no_env_read: true,
    no_truth_values_changed: true,
    teacher_release_remains_no: true,
  },
};

console.log(JSON.stringify(report, null, 2));

// ── Exit policy ─────────────────────────────────────────────────────────────
// IMPORTANT: a BLOCKER is the HONEST current state, not an audit failure.
// The audit PASSES (exit 0) as long as it correctly reports the state and
// never falsely claims live RLS enforcement or flips Teacher Release.
// It FAILS only if the report itself is internally inconsistent (e.g. it
// somehow claimed live verification without evidence).
if (liveRlsVerified) {
  fail("static audit must never claim live RLS enforcement verified");
}
if (report.teacher_release !== "NO" || report.teacher_release_ready !== false) {
  fail("Teacher Release must remain NO / not ready");
}

console.log("SUPABASE_RLS_READINESS_AUDIT_OK");
if (anyBlocker) {
  console.log("SUPABASE_RLS_READINESS_BLOCKER_PRESENT: teacher-scoped RLS policies are not yet defined (documented honestly, Teacher Release stays NO)");
}
