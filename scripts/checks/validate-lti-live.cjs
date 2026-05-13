#!/usr/bin/env node
// PR #55 live-validation helper.
// Checks /api/lti/diagnostics on the live Render deployment and reports
// whether a real Moodle launch has been captured.
//
// BEFORE RUNNING this script you must:
//   1. Open Moodle in your browser.
//   2. Click the Teacher Hub external tool link to trigger a real LTI launch.
//   3. Then run: node scripts/checks/validate-lti-live.cjs
//
// This script never writes to Supabase, never generates mock data, and
// never sets Teacher Release to YES.

"use strict";

const DIAGNOSTICS_URL =
  "https://www-tijc.onrender.com/api/lti/diagnostics";

const PASS = "\x1b[32mPASS\x1b[0m";
const FAIL = "\x1b[31mFAIL\x1b[0m";
const WARN = "\x1b[33mWARN\x1b[0m";
const INFO = "\x1b[36mINFO\x1b[0m";

function label(ok) { return ok ? PASS : FAIL; }

async function fetchDiagnostics() {
  const res = await fetch(DIAGNOSTICS_URL, {
    headers: { "Cache-Control": "no-store" },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${DIAGNOSTICS_URL}`);
  return res.json();
}

async function main() {
  console.log(`\n${INFO} Fetching: ${DIAGNOSTICS_URL}\n`);

  let data;
  try {
    data = await fetchDiagnostics();
  } catch (err) {
    console.error(`${FAIL} Could not reach diagnostics endpoint: ${err.message}`);
    console.error(
      `       Check that https://www-tijc.onrender.com is awake (Render cold-start may take ~30s).`
    );
    process.exit(1);
  }

  const counts = data.safe_counts || {};
  const last   = data.last_capture_safe || null;

  const storeLaunches   = typeof counts.store_launches   === "number" ? counts.store_launches   : -1;
  const moodleCaptures  = typeof counts.moodle_captures  === "number" ? counts.moodle_captures  : -1;
  const ltiConfigured   = Boolean(data.lti_configured);
  const appBaseUrl      = Boolean(data.app_base_url_configured);
  const teacherRelease  = data.teacher_release_ready;

  // ── Infrastructure checks ──────────────────────────────────────────────
  console.log("── Infrastructure ──────────────────────────────────────────");
  console.log(`  ${label(data.ok)}          endpoint.ok`);
  console.log(`  ${label(ltiConfigured)}    lti_configured (LTI_SHARED_SECRET + LTI_CONSUMER_KEY)`);
  console.log(`  ${label(appBaseUrl)}       app_base_url_configured`);
  console.log(`  ${teacherRelease ? FAIL : PASS}    teacher_release_ready = ${teacherRelease} (must be false)`);

  // ── Launch capture counts ──────────────────────────────────────────────
  console.log("\n── Launch Capture (PR #55 validation) ───────────────────────");
  const storeOk   = storeLaunches  >= 1;
  const captureOk = moodleCaptures >= 1;
  console.log(`  ${label(storeOk)}    store_launches  = ${storeLaunches}   (need >= 1)`);
  console.log(`  ${label(captureOk)} moodle_captures = ${moodleCaptures}  (need >= 1)`);

  if (last) {
    console.log("\n── Last capture (safe fields only) ──────────────────────────");
    console.log(`  source           : ${last.source ?? "—"}`);
    console.log(`  verificationCode : ${last.verificationCode ?? "—"}`);
    console.log(`  createdAt        : ${last.createdAt ?? "—"}`);
    console.log(`  rawCount         : ${last.rawCount ?? 0}`);
    console.log(`  keys_count       : ${last.keys_count ?? 0}`);
  } else {
    console.log(`\n  ${WARN} last_capture_safe is null — no Moodle launch recorded yet.`);
  }

  // ── Overall verdict ────────────────────────────────────────────────────
  const allPass = data.ok && ltiConfigured && appBaseUrl && storeOk && captureOk && !teacherRelease;
  console.log("\n── Verdict ──────────────────────────────────────────────────");
  if (allPass) {
    console.log(`  ${PASS} PR #55 live Moodle launch capture CONFIRMED.\n`);
    process.exit(0);
  } else {
    console.log(`  ${FAIL} Live launch capture NOT yet confirmed.\n`);
    if (!storeOk || !captureOk) {
      console.log("  ACTION REQUIRED:");
      console.log("    1. Open Moodle in your browser.");
      console.log("    2. Click the Teacher Hub external tool link to trigger a real LTI launch.");
      console.log("    3. Re-run: node scripts/checks/validate-lti-live.cjs");
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`${FAIL} Unexpected error: ${err.message}`);
  process.exit(1);
});
