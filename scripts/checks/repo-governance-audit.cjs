const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
let failed = false;

function fail(message) {
  failed = true;
  console.error(`GOVERNANCE_FAIL: ${message}`);
}

function read(relative) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) {
    fail(`missing required file: ${relative}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, '');
}

function requireTokens(relative, tokens) {
  const text = read(relative);
  for (const token of tokens) {
    if (!text.includes(token)) fail(`${relative} must contain: ${token}`);
  }
  return text;
}

const teacherRuntime = 'https://www-tijc.onrender.com';
const guideRuntime = 'https://yanivmizrachiy.github.io/www/guide/';

const claude = requireTokens('CLAUDE.md', [
  'RULES.md',
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  teacherRuntime,
  guideRuntime,
]);

const rules = requireTokens('RULES.md', [
  'Moodle Teacher Hub',
  'Guide',
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  teacherRuntime,
  guideRuntime,
]);

if (rules.includes('מיועד ל־Moodle Teacher Hub בלבד')) {
  fail('RULES.md reverted to the obsolete Teacher-Hub-only repository boundary');
}

const readme = requireTokens('README.md', [
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  teacherRuntime,
  guideRuntime,
  'deploy/guide-static',
]);

for (const stale of [
  'ענף עבודה פעיל: `gemini/ai-studio-sync-20260428-193953`',
  'Real Moodle E2E and multi-teacher isolation are still not verified',
]) {
  if (readme.includes(stale)) fail(`README.md contains stale current-state text: ${stale}`);
}

requireTokens('docs/README.md', [
  'RULES.md',
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  teacherRuntime,
  guideRuntime,
]);

requireTokens('docs/operations/repository-map.md', [
  'RULES.md',
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  'src/data/guideDeck.ts',
  'deploy/guide-static',
  teacherRuntime,
  guideRuntime,
]);

requireTokens('STATE/README.md', [
  'PROJECT_RULES.md',
  'PROJECT_MEMORY.md',
  'historical snapshots',
  teacherRuntime,
  guideRuntime,
]);

const memory = read('PROJECT_MEMORY.md');
const publicMemory = read('public/PROJECT_MEMORY.md');
if (memory && publicMemory && memory !== publicMemory) {
  fail('PROJECT_MEMORY.md and public/PROJECT_MEMORY.md must be byte-equivalent after BOM normalization');
}

const renderRecovery = read('.github/workflows/render-deploy-recovery.yml');
for (const forbidden of [
  'guideHash',
  'EXPECTED_GUIDE_HASH',
  '/guide/release.json',
  'guide-content-hash.cjs',
]) {
  if (renderRecovery.includes(forbidden)) {
    fail(`Render recovery must not couple to Guide token: ${forbidden}`);
  }
}

requireTokens('.github/workflows/guide-live-smoke.yml', [guideRuntime]);
requireTokens('.github/workflows/guide-static-always-on.yml', ['deploy/guide-static']);

if (claude.includes('Runtime: `https://www-tijc.onrender.com`') && !claude.includes('Guide:')) {
  fail('CLAUDE.md looks like it reverted to a single-runtime model');
}

if (failed) process.exit(1);
console.log('REPO_GOVERNANCE_OK');
