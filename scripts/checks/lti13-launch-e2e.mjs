#!/usr/bin/env node
// End-to-end LTI 1.3 handshake regression test — self-contained.
//
// Stands up a minimal real "platform" (RSA keypair + live JWKS endpoint), spawns
// the real server pointed at it, and drives the full OIDC third-party-initiated
// flow exactly like Moodle does:
//   login initiation -> 303 to platform auth (state+nonce cookies) ->
//   RS256-signed id_token posted to /api/lti13/launch -> 303 + session token ->
//   data endpoints work with that session.
// Then the attack matrix: tampered signature, unknown registration, wrong nonce,
// wrong state, expired token, student role — each must be rejected.
//
// This certifies the tool-side handshake with real cryptography (nothing is
// mocked inside the server). The only thing it cannot prove is the real MOE
// platform's side — that needs one live launch (see /api/lti13/status).
//
// Run: node scripts/checks/lti13-launch-e2e.mjs   (or: npm run test:lti13:e2e)

import crypto from "crypto";
import http from "http";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

const TOOL_PORT = process.env.E2E13_PORT || "3197";
const PLATFORM_PORT = process.env.E2E13_PLATFORM_PORT || "3298";
const BASE = `http://127.0.0.1:${TOOL_PORT}`;
const PLATFORM = `http://127.0.0.1:${PLATFORM_PORT}`;
const CLIENT_ID = "e2e-client-13";
const DEPLOYMENT_ID = "7";
const KID = "e2e-key-1";

// ── real platform crypto ─────────────────────────────────────────────────────
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = { ...publicKey.export({ format: "jwk" }), kid: KID, alg: "RS256", use: "sig" };

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function signIdToken(payload) {
  const header = { alg: "RS256", typ: "JWT", kid: KID };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey);
  return `${signingInput}.${b64url(signature)}`;
}

// Minimal live platform: serves its JWKS like Moodle's /mod/lti/certs.php.
const platformServer = http.createServer((req, res) => {
  if (req.url.startsWith("/certs")) {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ keys: [publicJwk] }));
  }
  res.writeHead(404);
  res.end();
});

// ── helpers ──────────────────────────────────────────────────────────────────
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

// Runs OIDC login initiation and returns { state, nonce, cookieHeader }.
async function initiateLogin() {
  const qs = formOf({
    iss: PLATFORM,
    login_hint: "user-77",
    target_link_uri: `${BASE}/api/lti13/launch`,
    lti_message_hint: "mh-1",
    client_id: CLIENT_ID,
  });
  const res = await request("GET", `/api/lti13/login?${qs}`);
  const location = String(res.headers.location || "");
  const url = location ? new URL(location) : null;
  const setCookies = [].concat(res.headers["set-cookie"] || []);
  const cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");
  return {
    status: res.status,
    location,
    state: url ? url.searchParams.get("state") : null,
    nonce: url ? url.searchParams.get("nonce") : null,
    redirectUri: url ? url.searchParams.get("redirect_uri") : null,
    cookieHeader,
  };
}

const INSTRUCTOR = "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor";
const LEARNER = "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner";

function baseClaims(nonce, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: PLATFORM,
    aud: CLIENT_ID,
    sub: "teacher-13-e2e",
    name: "מורה בדיקה 13",
    iat: now,
    exp: now + 300,
    nonce,
    "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": DEPLOYMENT_ID,
    "https://purl.imsglobal.org/spec/lti/claim/roles": [INSTRUCTOR],
    "https://purl.imsglobal.org/spec/lti/claim/context": { id: "5150", title: "מתמטיקה ז2 — בדיקת 1.3" },
    "https://purl.imsglobal.org/spec/lti/claim/resource_link": { id: "rl-e2e-13" },
    ...overrides,
  };
}

async function postLaunch(idToken, state, cookieHeader) {
  return request("POST", "/api/lti13/launch", {
    body: formOf({ id_token: idToken, state }),
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: cookieHeader },
  });
}

async function run() {
  // 1) OIDC login initiation
  const login = await initiateLogin();
  check(
    "login initiation -> 303 to platform auth with state+nonce+cookies",
    login.status === 303 && login.location.startsWith(PLATFORM) && !!login.state && !!login.nonce && login.cookieHeader.includes("lti13_state="),
    `status=${login.status}`
  );
  check("login redirect_uri points back at /api/lti13/launch", login.redirectUri === `${BASE}/api/lti13/launch`, String(login.redirectUri));
  if (!login.state || !login.nonce) return;

  // 2) happy path: real signed id_token -> session
  const good = await postLaunch(signIdToken(baseClaims(login.nonce)), login.state, login.cookieHeader);
  const token = (String(good.headers.location || "").match(/[?&]t=([^&]+)/) || [])[1];
  check("signed teacher launch -> 303 + session token", good.status === 303 && !!token, `status=${good.status} body=${good.body.slice(0, 120)}`);

  if (token) {
    const t = decodeURIComponent(token);
    const boot = await request("GET", `/api/bootstrap?t=${encodeURIComponent(t)}`);
    check("bootstrap resolves the 1.3-launched course", boot.status === 200 && (boot.body.includes("5150") || boot.body.includes("מתמטיקה")), `status=${boot.status}`);
    const data = await request("GET", `/api/imports/overview?t=${encodeURIComponent(t)}`);
    let jsonOk = false; try { JSON.parse(data.body); jsonOk = true; } catch {}
    check("data endpoint works with a 1.3 session", data.status === 200 && jsonOk, `status=${data.status}`);
  }

  // 3) attack matrix — each launch gets its own fresh login (fresh state/nonce)
  {
    // Valid JSON, valid kid — but signed by a DIFFERENT private key, like a
    // forged token from an attacker who knows the real kid.
    const l = await initiateLogin();
    const { privateKey: foreignKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
    const header = { alg: "RS256", typ: "JWT", kid: KID };
    const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(baseClaims(l.nonce)))}`;
    const forged = `${signingInput}.${b64url(crypto.sign("RSA-SHA256", Buffer.from(signingInput), foreignKey))}`;
    const r = await postLaunch(forged, l.state, l.cookieHeader);
    check("forged signature (foreign key) -> 401", r.status === 401, `status=${r.status}`);
  }
  {
    const l = await initiateLogin();
    const r = await postLaunch(
      signIdToken(baseClaims(l.nonce, { aud: "rogue-client", "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "9" })),
      l.state,
      l.cookieHeader
    );
    check("unknown client/deployment -> 403 (not auto-approved)", r.status === 403, `status=${r.status}`);
  }
  {
    const l = await initiateLogin();
    const r = await postLaunch(signIdToken(baseClaims("stolen-different-nonce")), l.state, l.cookieHeader);
    check("nonce mismatch -> 401", r.status === 401, `status=${r.status}`);
  }
  {
    const l = await initiateLogin();
    const r = await postLaunch(signIdToken(baseClaims(l.nonce)), "forged-state", l.cookieHeader);
    check("state mismatch -> 401", r.status === 401, `status=${r.status}`);
  }
  {
    const l = await initiateLogin();
    const now = Math.floor(Date.now() / 1000);
    const r = await postLaunch(signIdToken(baseClaims(l.nonce, { iat: now - 4000, exp: now - 3600 })), l.state, l.cookieHeader);
    check("expired id_token -> 401", r.status === 401, `status=${r.status}`);
  }
  {
    const l = await initiateLogin();
    const r = await postLaunch(
      signIdToken(baseClaims(l.nonce, { "https://purl.imsglobal.org/spec/lti/claim/roles": [LEARNER], sub: "student-13-e2e", name: "תלמיד בדיקה" })),
      l.state,
      l.cookieHeader
    );
    check("student (Learner) role -> 403", r.status === 403, `status=${r.status}`);
  }
  {
    const r = await request("POST", "/api/lti13/launch", { body: formOf({}), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    check("no id_token -> 4xx (never a session)", r.status >= 400 && r.status < 500, `status=${r.status}`);
  }
}

(async () => {
  console.log("=== LTI 1.3 handshake e2e ===");
  await new Promise((res) => platformServer.listen(Number(PLATFORM_PORT), "127.0.0.1", res));
  const server = spawn(process.execPath, [path.join(ROOT, "src", "server.js")], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: TOOL_PORT,
      NODE_ENV: "development",
      APP_BASE_URL: BASE,
      LTI13_ISSUER: PLATFORM,
      LTI13_CLIENT_ID: CLIENT_ID,
      LTI13_DEPLOYMENT_ID: DEPLOYMENT_ID,
      LTI13_PLATFORM_JWKS_URL: `${PLATFORM}/certs`,
      LTI13_AUTH_LOGIN_URL: `${PLATFORM}/auth`,
    },
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
    platformServer.close();
    process.exitCode = code;
  }
})();
