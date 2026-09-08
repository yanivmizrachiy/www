#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
  console.error("REPO_DOCTOR_FAIL=" + msg);
}

function warn(msg) {
  warnings.push(msg);
  console.warn("REPO_DOCTOR_WARN=" + msg);
}

function ok(msg) {
  console.log("REPO_DOCTOR_OK=" + msg);
}

function read(path) {
  if (!fs.existsSync(path)) {
    fail("missing_file:" + path);
    return "";
  }
  return fs.readFileSync(path, "utf8");
}

function exists(path) {
  return fs.existsSync(path);
}

const tracked = execSync("git ls-files", { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

// Canonical repository map. These are intentionally the only product truth entry points.
const requiredCanonicalFiles = [
  "README.md",
  "RULES.md",
  "PROJECT_RULES.md",
  "PROJECT_MEMORY.md",
  "STATE/evidence-log.md",
  "august-experience/README.md",
  "august-experience/docs/TEACHER_USE.md",
  "august-experience/docs/RELEASE_GATES.md",
  "august-experience/extension/manifest.json"
];

for (const path of requiredCanonicalFiles) {
  if (!exists(path)) fail("missing_canonical_file:" + path);
}
if (!errors.length) ok("CANONICAL_FILES_PRESENT");

// Files/directories deliberately retired during repository consolidation.
const forbiddenExact = new Set([
  "AI_LTI_SETUP_LOG.md",
  "MOODLE_SETUP_GUIDE.md",
  "PROJECT_MEMORY_AUGUST_2026.md",
  "SAFE_NEXT_PR_BACKLOG.md",
  "SESSION_HISTORY.md",
  "metadata.json",
  "STATE/CURRENT.md",
  "STATE/TODO-NEXT.md",
  "STATE/AI_STUDIO_AUDIT_CHECKPOINT.md",
  "august-experience/ARCHITECTURE_V1.md",
  "august-experience/STATE/PROGRESS.md"
]);

const forbiddenPrefixes = [
  "archive/",
  "downloads/",
  "WORK_ORDERS/",
  "STATE/gemini-sync/",
  "STATE/local-audit/",
  "STATE/file-classification/",
  "STATE/ai-learning/",
  "STATE/evidence-log-additions/"
];

const retired = tracked.filter(
  (p) => forbiddenExact.has(p) || forbiddenPrefixes.some((prefix) => p.startsWith(prefix))
);
if (retired.length) fail("retired_paths_tracked:" + retired.join(","));
else ok("NO_RETIRED_PATHS_TRACKED");

// Re-creatable/generated junk must never be tracked.
const generatedPatterns = [
  /(^|\/)node_modules\//,
  /(^|\/)dist\//,
  /(^|\/)coverage\//,
  /(^|\/)tmp\//,
  /(^|\/)temp\//,
  /(^|\/)backup(s)?\//i,
  /\.log$/i,
  /\.tmp$/i,
  /\.bak$/i,
  /\.backup$/i,
  /\.orig$/i,
  /\.rej$/i,
  /~$/
];
const generated = tracked.filter((p) => generatedPatterns.some((pattern) => pattern.test(p)));
if (generated.length) fail("generated_junk_tracked:" + generated.join(","));
else ok("NO_GENERATED_JUNK_TRACKED");

// Private/raw Moodle exports and local runtime stores must never be tracked.
const risky = tracked
  .filter((p) =>
    p === "data/store.json" ||
    /(^|\/)\.env($|\.)/.test(p) ||
    /\.(xlsx|xls|csv|ods)$/i.test(p) ||
    /moodle-teacher-hub-students-backup.*\.json$/i.test(p)
  )
  .filter((p) => p !== ".env.example");
if (risky.length) fail("risky_tracked_files:" + risky.join(","));
else ok("PRIVATE_FILE_SCAN_OK");

// Known high-confidence secret formats only; avoid flagging documentation placeholders.
const textLike = /\.(js|jsx|ts|tsx|cjs|mjs|json|md|yml|yaml|html|css|txt|sql|sh|ps1)$/i;
const secretRegex =
  /(eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|\bsk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;

for (const p of tracked) {
  if (!textLike.test(p)) continue;
  if (!exists(p)) continue;
  const text = fs.readFileSync(p, "utf8");
  if (secretRegex.test(text)) fail("secret_value_in:" + p);
}
if (!errors.some((e) => e.startsWith("secret_value_in:"))) ok("SECRET_VALUE_SCAN_OK");

// Root README is the repository-level truth index and must point to all three products.
const rootReadme = read("README.md");
for (const marker of ["PROJECT_RULES.md", "PROJECT_MEMORY.md", "august-experience/README.md"]) {
  if (!rootReadme.includes(marker)) fail("root_truth_index_missing:" + marker);
}
if (rootReadme.includes("PROJECT_MEMORY_AUGUST_2026.md")) {
  fail("root_truth_index_references_retired_august_memory");
}
ok("ROOT_TRUTH_INDEX_CHECKED");

// Product truth files must remain clearly scoped.
const teacherRules = read("PROJECT_RULES.md");
if (!/Teacher Release/i.test(teacherRules)) fail("teacher_hub_release_boundary_missing");

const guideMemory = read("PROJECT_MEMORY.md");
if (!/Moodle/i.test(guideMemory)) warn("guide_memory_moodle_marker_not_found");

const augustReadme = read("august-experience/README.md");
if (!augustReadme.includes("מקור האמת היחיד")) fail("august_single_truth_marker_missing");
if (!augustReadme.includes("Teacher Release")) fail("august_release_boundary_missing");

// August V1 must remain constrained to the approved Ministry Moodle host.
try {
  const manifest = JSON.parse(read("august-experience/extension/manifest.json"));
  if (manifest.manifest_version !== 3) fail("august_manifest_not_v3");
  const matches = [];
  for (const script of manifest.content_scripts || []) {
    for (const match of script.matches || []) matches.push(match);
  }
  for (const host of manifest.host_permissions || []) matches.push(host);
  if (!matches.length) fail("august_manifest_has_no_scoped_matches");
  const badMatches = matches.filter(
    (value) => !/^https:\/\/moodlemoe\.lms\.education\.gov\.il\//.test(value)
  );
  if (badMatches.length) fail("august_manifest_broad_host_scope:" + badMatches.join(","));
  else ok("AUGUST_HOST_SCOPE_OK");
} catch (error) {
  fail("august_manifest_invalid_json:" + error.message);
}

// Teacher Hub deployment invariants.
const render = read("render.yaml");
if (!/branch:\s*main/.test(render)) fail("render_yaml_not_main");
if (!/healthCheckPath:\s*\/health/.test(render)) fail("render_health_missing");
else ok("RENDER_CONFIG_OK");

const server = read("src/server.js");
for (const route of [
  "/api/sync/status",
  "/api/sync/run",
  "/api/persistence/status",
  "/api/persistence/validate",
  "/api/release/readiness"
]) {
  if (!server.includes(route)) fail("missing_route:" + route);
}
if (!errors.some((e) => e.startsWith("missing_route:"))) ok("REQUIRED_ROUTES_OK");

// Known non-Moodle compatibility leftovers are intentionally not auto-deleted.
for (const path of ["luz-teddy", "yanivcar"]) {
  if (exists(path)) warn("non_moodle_compatibility_leftover_kept_intentionally:" + path);
}

console.log(`REPO_DOCTOR_SUMMARY errors=${errors.length} warnings=${warnings.length}`);
if (errors.length) process.exit(1);
console.log("REPO_DOCTOR_OK");
