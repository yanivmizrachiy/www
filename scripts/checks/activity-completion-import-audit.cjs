#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function fail(message) {
  console.error(`ACTIVITY_COMPLETION_IMPORT_AUDIT_FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function walk(dir, out = []) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return out;

  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const p = path.join(full, entry.name);
    const rel = path.relative(root, p).split(path.sep).join("/");

    if (
      rel.includes("node_modules") ||
      rel.includes(".git") ||
      rel.startsWith("dist/") ||
      rel.startsWith("build/") ||
      rel.startsWith("coverage/")
    ) continue;

    if (entry.isDirectory()) walk(rel, out);
    else if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(entry.name)) out.push(rel);
  }

  return out;
}

const requiredFiles = [
  "docs/imports/ACTIVITY_COMPLETION_MANUAL_IMPORT_V1.md",
  "docs/moodle/MOODLE_TEACHER_ACTIVITY_COMPLETION_EXPORT_GUIDE_HE.md",
  "docs/moodle/MOODLE_ADMIN_ENABLEMENT_REQUEST_HE.md",
  "scripts/checks/activity-completion-import-audit.cjs",
  "WORK_ORDERS/CLAUDE_ACTIVITY_COMPLETION_MANUAL_IMPORT_V1.md",
  "package.json",
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`required file missing: ${file}`);
  ok(`found ${file}`);
}

const progressFilesDir = path.join(root, "STATE", "progress");
const progressFileFound =
  fs.existsSync(progressFilesDir) &&
  fs.readdirSync(progressFilesDir).some((name) => /activity-completion-manual-import-readiness\.md$/.test(name));

if (!progressFileFound) fail("missing STATE/progress/*activity-completion-manual-import-readiness.md");
ok("found progress state file");

const pkg = JSON.parse(read("package.json"));
if (!pkg.scripts || pkg.scripts["audit:activity-completion-import"] !== "node scripts/checks/activity-completion-import-audit.cjs") {
  fail("package.json missing script: audit:activity-completion-import");
}
ok("package.json script exists");

const spec = read("docs/imports/ACTIVITY_COMPLETION_MANUAL_IMPORT_V1.md");
for (const requiredPhrase of [
  "context_key",
  "import_batch_id",
  "source_provenance",
  "courseStructure=true",
  "completionAvailable=true",
  "activityCompletionImported=true",
  "no raw student rows",
]) {
  if (!spec.includes(requiredPhrase)) fail(`import spec missing required phrase: ${requiredPhrase}`);
}
ok("import spec contains required gating/provenance terms");

const teacherGuide = read("docs/moodle/MOODLE_TEACHER_ACTIVITY_COMPLETION_EXPORT_GUIDE_HE.md");
if (!/Activity Completion|Completion Progress|Progress report|דוח השלמת פעילות|דוח התקדמות/.test(teacherGuide)) {
  fail("teacher guide does not mention Activity Completion / Progress terms");
}
ok("teacher guide contains Moodle report terms");

const adminRequest = read("docs/moodle/MOODLE_ADMIN_ENABLEMENT_REQUEST_HE.md");
for (const requiredPhrase of [
  "LTI 1.3",
  "NRPS",
  "AGS",
  "Moodle Web Services",
  "core_course_get_contents",
  "core_completion_get_activities_completion_status",
]) {
  if (!adminRequest.includes(requiredPhrase)) fail(`admin request missing required phrase: ${requiredPhrase}`);
}
ok("admin request contains integration enablement terms");

const srcFiles = walk("src");
const findings = [];
const rules = [
  { id: "hardcoded_course_259_assignment", regex: /(?:courseId|course_id|contextId|context_id|id)\s*[:=]\s*["'`]259["'`]/i },
  { id: "hardcoded_course_259_query", regex: /(?:course|id)=259\b/i },
  { id: "hardcoded_pilot_course_title", regex: /ספר\s+המודל\s*-\s*חלק\s+ג/ },
  { id: "teacher_release_true", regex: /teacherRelease\s*[:=]\s*true\b/i },
  { id: "teacher_release_yes", regex: /Teacher\s+Release\s*[:=]?\s*YES/i },
  { id: "hardcoded_course_structure_true", regex: /courseStructure\s*[:=]\s*true\b/i },
  { id: "fake_demo_completion", regex: /\b(fake|demo|sample)\b.{0,80}\b(completion|activityCompletion|courseStructure)\b/i },
];

for (const file of srcFiles) {
  const text = read(file);
  text.split(/\r?\n/).forEach((line, index) => {
    for (const rule of rules) {
      if (rule.regex.test(line)) {
        findings.push({ rule: rule.id, file, line: index + 1, text: line.trim().slice(0, 220) });
      }
    }
  });
}

if (findings.length) {
  console.error(JSON.stringify(findings, null, 2));
  fail("unsafe production marker found in src");
}

ok("no unsafe production markers found in src");
console.log("ACTIVITY_COMPLETION_IMPORT_AUDIT_OK");
process.exit(0);
