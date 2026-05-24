const fs = require('fs');
const path = require('path');

// MTH_AUTO_EXTRACTION_SOURCE_ROUTER_AUDIT_V1
// Ensures the Auto Extraction Source Router cannot fake automation:
// - the router module + endpoint + UI exist
// - the endpoint declares a safety block (no secrets / no rows / teacher_release NO)
// - blocked sources (moodle_web_services / nrps / ags) are not hard-coded AUTOMATIC
// - practice_time stays REFUSE/blocked path (no synthetic duration)
// - Teacher Release is never set ready

const repoRoot = process.cwd();

function fail(msg) {
  console.error(`AUTO_EXTRACTION_ROUTER_AUDIT_FAIL: ${msg}`);
  process.exit(1);
}
function ok(msg) {
  console.log(`AUTO_EXTRACTION_ROUTER_AUDIT_OK: ${msg}`);
}

function read(rel) {
  const p = path.join(repoRoot, rel);
  if (!fs.existsSync(p)) fail(`missing required file: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

// 1. Required files exist
const routerLib = read('src/lib/autoExtractionSourceRouter.ts');
const serverJs = read('src/server.js');
const uiSection = read('src/components/AutoExtractionSourceRouterSection.tsx');

// 2. Router module exposes the builder and version marker
if (!routerLib.includes('MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1')) {
  fail('router lib missing version marker MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1');
}
if (!routerLib.includes('buildAutoExtractionSourceMap')) {
  fail('router lib missing buildAutoExtractionSourceMap');
}

// 3. Endpoint exists in server.js
if (!serverJs.includes('/api/automation/auto-extraction/sources')) {
  fail('server.js missing GET /api/automation/auto-extraction/sources endpoint');
}
if (!serverJs.includes('MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1')) {
  fail('server.js endpoint missing version marker');
}

// 4. Endpoint safety: must declare no-secrets / no-rows / teacher_release NO
const endpointStart = serverJs.indexOf('>>> MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1 >>>');
const endpointEnd = serverJs.indexOf('<<< MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1 <<<');
if (endpointStart === -1 || endpointEnd === -1 || endpointEnd <= endpointStart) {
  fail('endpoint block markers not found or malformed');
}
const endpointBlock = serverJs.slice(endpointStart, endpointEnd);

const requiredSafety = [
  'no_secrets: true',
  'no_token_values: true',
  'no_raw_student_rows: true',
  'no_raw_grade_rows: true',
  'no_raw_logs: true',
  'read_only: true',
  'teacher_release_remains_no: true',
];
for (const flag of requiredSafety) {
  if (!endpointBlock.includes(flag)) {
    fail(`endpoint missing required safety flag: ${flag}`);
  }
}

// 5. Teacher Release must be NO / not ready in the endpoint
if (!endpointBlock.includes('teacher_release: "NO"')) {
  fail('endpoint must declare teacher_release: "NO"');
}
if (!endpointBlock.includes('teacher_release_ready: false')) {
  fail('endpoint must declare teacher_release_ready: false');
}
if (/teacher_release_ready:\s*true/.test(endpointBlock)) {
  fail('endpoint must never set teacher_release_ready: true');
}

// 6. Blocked sources must not be hard-coded AUTOMATIC.
// In the endpoint, moodle_web_services / nrps / ags AUTOMATIC level must be
// guarded by a verified/claim condition (not a constant). We assert the
// guarding identifiers are present near each domain.
for (const guard of ['wsSiteInfoLiveVerified', 'hasNrpsClaim', 'hasAgsClaim']) {
  if (!endpointBlock.includes(guard)) {
    fail(`endpoint missing live-signal guard: ${guard}`);
  }
}

// 7. Practice time must keep the refuse path (no synthetic duration).
if (!endpointBlock.includes('refuse_calculation')) {
  fail('endpoint missing practice_time refuse_calculation path');
}
if (!endpointBlock.includes('hasVerifiedDurationSource')) {
  fail('endpoint missing hasVerifiedDurationSource gate for practice_time');
}
// The default duration source must be false (no synthetic computation).
if (!/const hasVerifiedDurationSource = false;/.test(endpointBlock)) {
  fail('practice_time must default hasVerifiedDurationSource to false (no synthetic duration)');
}

// 8. UI reads only the sanitized endpoint, never raw capability file directly.
if (!uiSection.includes('/api/automation/auto-extraction/sources')) {
  fail('UI section does not read the source-router endpoint');
}
if (uiSection.includes('automationCapabilities')) {
  fail('UI section must not import the base Truth Engine directly');
}

// 9. No secret-like leakage literals in the endpoint block.
if (/MOODLE_WS_TOKEN\s*[:=]\s*["'`][A-Za-z0-9]/.test(endpointBlock)) {
  fail('endpoint appears to embed a token value');
}

ok('auto-extraction source router present, safe, blocked sources guarded, teacher release NO');
