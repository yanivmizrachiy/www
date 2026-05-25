#!/usr/bin/env node
// MTH_MULTI_TEACHER_ISOLATION_EVIDENCE_V1
//
// Proves, from the actual server code, that the isolation invariants required
// for safe multi-teacher / multi-course operation are PRESENT, and reports
// the remaining blockers honestly. This is audit-first evidence — it does NOT
// claim isolation is fully live-verified; it verifies the code-level guarantees
// and lists what still needs a live two-teacher test.
//
// It NEVER changes truth values, NEVER promotes Teacher Release, NEVER reads
// secrets or student rows. Pure static analysis of source files.

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function fail(msg) {
  console.error(`MTH_ISOLATION_EVIDENCE_AUDIT_FAIL: ${msg}`);
  process.exit(1);
}
function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) fail(`missing required file: ${rel}`);
  return fs.readFileSync(p, "utf8");
}

const server = read("src/server.js");

// ─── Invariant checks (each must be present in code) ────────────────────────
// The result object documents WHAT proves isolation and WHAT is still missing.

const invariants = [];

function checkInvariant(id, labelHe, present, provingSignalHe, missingHe) {
  invariants.push({
    id,
    labelHe,
    present: !!present,
    provingSignalHe: present ? provingSignalHe : null,
    missingHe: present ? null : missingHe,
  });
  return !!present;
}

let allPresent = true;

// 1. Session is resolved per-request from a token/cookie, not global state.
allPresent &= checkInvariant(
  "session_per_request",
  "סשן נפתר לכל בקשה בנפרד (token/cookie)",
  /function sessionFromRequest\(req\)/.test(server) &&
    /tokenSessions\.(get|has)\(/.test(server),
  "sessionFromRequest(req) פותר סשן לפי token/cookie ייחודי לכל בקשה.",
  "אין פתרון סשן לכל בקשה — סיכון לערבוב נתונים בין מורים."
);

// 2. Teacher identity derives a stable id from the Moodle user identity.
allPresent &= checkInvariant(
  "teacher_identity_scoped",
  "זהות מורה נגזרת ממזהה Moodle",
  /stableUuidFromText\(\s*["'`]teacher\|/.test(server) &&
    /function ensureTeacher\(supabase, session\)/.test(server),
  "ensureTeacher גוזר teacherId יציב מ-moodleUserId/username של הסשן.",
  "זהות מורה אינה נגזרת ממזהה ייחודי — סיכון לדריסת נתוני מורה."
);

// 3. Course identity is scoped from the session course id.
allPresent &= checkInvariant(
  "course_identity_scoped",
  "זהות קורס נגזרת מהסשן",
  /function ensureCourse\(supabase, session\)/.test(server),
  "ensureCourse יוצר/מעדכן קורס לפי courseId של הסשן.",
  "זהות קורס אינה מקושרת לסשן — סיכון לערבוב קורסים."
);

// 4. Imports tie rows to a batch tied to teacher+course of the session.
allPresent &= checkInvariant(
  "imports_scoped_to_batch",
  "ייבוא נקשר ל-batch לפי מורה+קורס",
  /import_batch_id/.test(server) &&
    /tryInsertImportBatch\(supabase, batch, session, teacherResult, courseResult\)/.test(server),
  "כל ייבוא יוצר import_batch הקשור ל-teacherResult ו-courseResult של הסשן, וכל שורה נושאת import_batch_id.",
  "שורות ייבוא אינן מקושרות ל-batch ממוקד מורה/קורס."
);

// 5. Grade results carry course-scoped stable ids (no cross-course collision).
allPresent &= checkInvariant(
  "grades_course_scoped_ids",
  "מזהי ציונים כוללים את הקורס",
  /stableUuidFromText\(\s*["'`]grade_result\|["'`]\s*\+\s*courseId/.test(server),
  "מזהה כל grade_result נגזר מ-courseId, כך ששני קורסים לא מתנגשים.",
  "מזהי ציונים אינם כוללים קורס — סיכון להתנגשות בין קורסים."
);

// 6. No hardcoded pilot course / teacher (delegated to existing audit, asserted here too).
const hardcoded =
  /(?:courseId|course_id|contextId|context_id)\s*[:=]\s*["'`]259["'`]/i.test(server) ||
  /(?:course|id)=259\b/i.test(server);
allPresent &= checkInvariant(
  "no_hardcoded_pilot_identity",
  "אין מזהה קורס/מורה קשיח",
  !hardcoded,
  "לא נמצאו מזהי קורס/מורה קשיחים ב-server.js.",
  "נמצא מזהה קשיח — חובה להסיר לפני ריבוי מורים."
);

// 7. Diagnostic endpoints are aggregate-only (no raw rows leaked cross-teacher).
allPresent &= checkInvariant(
  "diagnostics_aggregate_only",
  "אבחון מחזיר אגרגט בלבד",
  /no_raw_student_rows:\s*true/.test(server) &&
    /no_raw_grade_rows:\s*true/.test(server),
  "endpoints האבחון מצהירים no_raw_student_rows ו-no_raw_grade_rows.",
  "endpoints האבחון אינם מבטיחים אגרגט בלבד — סיכון דליפה."
);

// ─── Honest remaining blockers (live, not code) ─────────────────────────────

const remainingBlockers = [
  {
    id: "live_two_teacher_test",
    labelHe: "בדיקה חיה עם שני מורים",
    statusHe: "טרם בוצעה",
    detailHe:
      "צריך להריץ שתי פתיחות LTI ממורים/קורסים שונים ולוודא ששאילתות מחזירות רק את נתוני המורה הנכון.",
  },
  {
    id: "rls_enforcement",
    labelHe: "אכיפת Row Level Security ב-Supabase",
    statusHe: "טרם אומת חי",
    detailHe:
      "צריך לאמת שמדיניות RLS חוסמת קריאה חוצת-מורים ברמת ה-DB, לא רק ברמת הקוד.",
  },
  {
    id: "teacher_release_gate",
    labelHe: "שער Teacher Release",
    statusHe: "נשאר NO",
    detailHe:
      "Teacher Release יישאר NO עד שהבדיקה החיה ואכיפת ה-RLS יתועדו כראיה.",
  },
];

// ─── Emit evidence report (stdout JSON, for transparency) ───────────────────

const report = {
  audit: "MTH_MULTI_TEACHER_ISOLATION_EVIDENCE_V1",
  generated_at: new Date().toISOString(),
  code_level_invariants: invariants,
  invariants_all_present: !!allPresent,
  remaining_live_blockers: remainingBlockers,
  teacher_release: "NO",
  teacher_release_ready: false,
  safety: {
    read_only: true,
    no_secrets_read: true,
    no_student_rows_read: true,
    no_truth_values_changed: true,
    static_analysis_only: true,
  },
};

console.log(JSON.stringify(report, null, 2));

if (!allPresent) {
  fail("one or more code-level isolation invariants are missing (see report)");
}

console.log("MTH_ISOLATION_EVIDENCE_AUDIT_OK");
