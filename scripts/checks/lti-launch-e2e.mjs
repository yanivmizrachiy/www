#!/usr/bin/env node
// End-to-end LTI 1.1 launch regression test — self-contained.
//
// Spawns the real server with a test LTI secret, signs a launch exactly like
// Moodle (OAuth1 HMAC-SHA1), follows the minted session token, and asserts the
// full teacher chain works: signed launch -> 303+token, bad signature -> 401,
// student role -> 403, every /api/imports/* -> 200+JSON with a session,
// bootstrap resolves the launched course, and no-token -> 401. Not a mock — it
// exercises verifyLti() and the real /api/lti/launch route + data endpoints.
//
// Run: node scripts/checks/lti-launch-e2e.mjs   (or: npm run test:lti:e2e)
// Exits 0 on all-pass, non-zero otherwise. Uses only Node built-ins.

import crypto from "crypto";
import http from "http";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const PORT = process.env.E2E_PORT || "3199";
const BASE = `http://127.0.0.1:${PORT}`;
const SECRET = "e2e-test-shared-secret";
const KEY = "yaniv-lti-tool";
const LAUNCH_URL = `${BASE}/api/lti/launch`;

function rfc3986(v) {
  return encodeURIComponent(String(v)).replace(/[!'()*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
}
function sign(url, params, secret) {
  const enc = Object.entries(params)
    .filter(([k]) => k !== "oauth_signature")
    .map(([k, v]) => [rfc3986(k), rfc3986(v ?? "")])
    .sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
  const paramString = enc.map(([k, v]) => `${k}=${v}`).join("&");
  const baseString = ["POST", rfc3986(url), rfc3986(paramString)].join("&");
  return crypto.createHmac("sha1", `${rfc3986(secret)}&`).update(baseString).digest("base64");
}
function request(method, urlPath, { body, headers } = {}) {
  return new Promise((resolve, reject) => {
    const r = http.request(BASE + urlPath, { method, headers, timeout: 8000 }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    r.on("error", reject);
    r.on("timeout", () => { r.destroy(); reject(new Error("request timeout")); });
    if (body) r.write(body);
    r.end();
  });
}
function formOf(params) {
  return Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}
async function waitForHealth(tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { const r = await request("GET", "/health"); if (r.status === 200) return true; } catch {}
    await new Promise((res) => setTimeout(res, 250));
  }
  return false;
}

const results = [];
const check = (name, pass, detail) => { results.push({ name, pass }); console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); };

async function run() {
  const params = {
    lti_message_type: "basic-lti-launch-request",
    lti_version: "LTI-1p0",
    oauth_consumer_key: KEY,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_version: "1.0",
    resource_link_id: "e2e-resource-1",
    context_id: "420042",
    context_title: "מתמטיקה ט1 — בדיקת E2E",
    roles: "Instructor",
    user_id: "teacher-e2e-1",
    ext_user_username: "e2e.teacher",
    lis_person_name_full: "מורה בדיקה",
    tool_consumer_instance_guid: "moodlemoe.e2e",
  };
  params.oauth_signature = sign(LAUNCH_URL, params, SECRET);
  const launch = await request("POST", "/api/lti/launch", {
    body: formOf(params),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const token = (String(launch.headers.location || "").match(/[?&]t=([^&]+)/) || [])[1];
  check("signed teacher launch -> 303 + session token", launch.status === 303 && !!token, `status=${launch.status}`);
  if (!token) return;
  const t = decodeURIComponent(token);

  const bad = { ...params, oauth_nonce: crypto.randomBytes(16).toString("hex"), oauth_signature: "WRONG" };
  const badRes = await request("POST", "/api/lti/launch", { body: formOf(bad), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  check("bad signature -> 401", badRes.status === 401, `status=${badRes.status}`);

  const stu = { ...params, oauth_nonce: crypto.randomBytes(16).toString("hex"), roles: "Learner" };
  stu.oauth_signature = sign(LAUNCH_URL, stu, SECRET);
  const stuRes = await request("POST", "/api/lti/launch", { body: formOf(stu), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  check("student (Learner) role -> 403", stuRes.status === 403, `status=${stuRes.status}`);

  const endpoints = [
    "/api/imports/overview", "/api/imports/students", "/api/imports/grades-matrix",
    "/api/imports/course-structure", "/api/imports/activity-overview",
    "/api/imports/student-reports", "/api/imports/task-completion",
    "/api/imports/daily-activity", "/api/teacher/dashboard-context",
  ];
  for (const ep of endpoints) {
    const r = await request("GET", `${ep}?t=${encodeURIComponent(t)}`);
    let jsonOk = false; try { JSON.parse(r.body); jsonOk = true; } catch {}
    check(`${ep} with session -> 200 + JSON`, r.status === 200 && jsonOk, `status=${r.status}`);
  }

  const boot = await request("GET", `/api/bootstrap?t=${encodeURIComponent(t)}`);
  check("bootstrap resolves the launched course", boot.status === 200 && (boot.body.includes("420042") || boot.body.includes("מתמטיקה")), `status=${boot.status}`);

  const noTok = await request("GET", "/api/imports/overview");
  check("data endpoint without token -> 401", noTok.status === 401, `status=${noTok.status}`);
}

(async () => {
  console.log("=== LTI 1.1 launch e2e ===");
  const server = spawn(process.execPath, [path.join(ROOT, "src", "server.js")], {
    cwd: ROOT,
    env: { ...process.env, PORT, NODE_ENV: "development", APP_BASE_URL: BASE, LTI_SHARED_SECRET: SECRET, LTI_CONSUMER_KEY: KEY },
    stdio: ["ignore", "ignore", "inherit"],
  });
  let code = 1;
  try {
    if (!(await waitForHealth())) { console.error("  server did not become healthy in time"); process.exitCode = 1; return; }
    await run();
    const passed = results.filter((r) => r.pass).length;
    console.log(`=== ${passed}/${results.length} passed ===`);
    code = passed === results.length ? 0 : 2;
  } catch (e) {
    console.error("  e2e error:", e && e.message);
    code = 1;
  } finally {
    server.kill("SIGKILL");
    process.exitCode = code;
  }
})();
