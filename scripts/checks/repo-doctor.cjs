#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");

function fail(msg) {
  console.error("REPO_DOCTOR_FAIL=" + msg);
  process.exit(1);
}
function ok(msg) {
  console.log(msg);
}
function read(path) {
  if (!fs.existsSync(path)) fail("missing_file_" + path);
  return fs.readFileSync(path, "utf8");
}

const tracked = execSync("git ls-files", { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

const risky = tracked
  .filter((p) =>
    p === "data/store.json" ||
    /\.env($|\.)/.test(p) ||
    /\.(xlsx|xls|csv|ods)$/i.test(p) ||
    /moodle-teacher-hub-students-backup.*\.json$/i.test(p)
  )
  .filter((p) => p !== ".env.example");

if (risky.length) fail("risky_tracked_files:" + risky.join(","));
ok("PRIVATE_FILE_SCAN_OK");

const textLike = /\.(js|jsx|ts|tsx|cjs|mjs|json|md|yml|yaml|html|css|txt|sql|sh|ps1)$/i;
const secretRegex =
  /(eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;

for (const p of tracked) {
  if (!textLike.test(p)) continue;
  if (p.includes("node_modules/") || p.includes("dist/")) continue;
  const t = fs.readFileSync(p, "utf8");
  if (secretRegex.test(t)) fail("secret_value_in_" + p);
}
ok("SECRET_VALUE_SCAN_OK");

const render = read("render.yaml");
if (!/branch:\s*main/.test(render)) fail("render_yaml_not_main");
if (!/healthCheckPath:\s*\/health/.test(render)) fail("render_health_missing");
ok("RENDER_CONFIG_OK");

const server = read("src/server.js");
[
  "/api/sync/status",
  "/api/sync/run",
  "/api/persistence/status",
  "/api/persistence/validate",
  "/api/release/readiness"
].forEach((route) => {
  if (!server.includes(route)) fail("missing_route_" + route);
});
ok("REQUIRED_ROUTES_OK");

const current = read("STATE/CURRENT.md");
if (!current.includes("Canonical branch: `main`")) fail("current_not_main");
if (!current.includes("Teacher release: **NO**")) fail("current_release_not_no");
ok("CURRENT_SOURCE_OF_TRUTH_OK");

const rules = read("PROJECT_RULES.md");
if (!rules.includes("MTH_CURRENT_VERIFIED_STATE_20260512_START")) fail("rules_current_marker_missing");
if (!rules.includes("Teacher release")) fail("rules_release_state_missing");
ok("PROJECT_RULES_OK");

console.log("REPO_DOCTOR_OK");
