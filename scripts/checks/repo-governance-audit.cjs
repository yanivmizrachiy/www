const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const failures = [];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireText(rel, text, expected) {
  if (!text.includes(expected)) failures.push(`${rel}: missing required text: ${expected}`);
}

function forbidText(rel, text, forbidden) {
  if (text.includes(forbidden)) failures.push(`${rel}: forbidden stale text: ${forbidden}`);
}

function forbidPath(rel) {
  if (fs.existsSync(path.join(root, rel))) {
    failures.push(`${rel}: presentation artifact must live only in yanivmizrachiy/moodle-guide-presentation`);
  }
}

const ssot = read('SSOT.md');
const claude = read('CLAUDE.md');
const rules = read('RULES.md');
const readme = read('README.md');
const docsReadme = read('docs/README.md');
const current = read('STATE/CURRENT.md');
const termuxWorkflow = read('.github/workflows/build-termux-runtime.yml');

const teacherHubUrl = 'https://www-tijc.onrender.com';
const presentationRepo = 'yanivmizrachiy/moodle-guide-presentation';
const presentationUrl = 'https://yanivmizrachiy.github.io/moodle-guide-presentation/';
const oldGuideUrl = 'https://yanivmizrachiy.github.io/www/guide/';
const staleGeminiBranch = 'gemini/ai-studio-sync-20260428-193953';

// Current repository boundary: www is Teacher Hub only; the presentation has one external SSOT.
requireText('SSOT.md', ssot, 'Moodle Teacher Hub');
requireText('SSOT.md', ssot, teacherHubUrl);
requireText('SSOT.md', ssot, presentationRepo);
requireText('CLAUDE.md', claude, 'Moodle Teacher Hub');
requireText('CLAUDE.md', claude, teacherHubUrl);
requireText('CLAUDE.md', claude, presentationRepo);
requireText('RULES.md', rules, 'Moodle Teacher Hub');
requireText('RULES.md', rules, presentationRepo);
requireText('README.md', readme, teacherHubUrl);
requireText('README.md', readme, presentationRepo);
requireText('README.md', readme, presentationUrl);
requireText('docs/README.md', docsReadme, '../SSOT.md');
requireText('docs/README.md', docsReadme, '../PROJECT_RULES.md');
requireText('docs/README.md', docsReadme, presentationRepo);
requireText('STATE/CURRENT.md', current, teacherHubUrl);
requireText('STATE/CURRENT.md', current, presentationRepo);

for (const [rel, text] of [
  ['SSOT.md', ssot],
  ['CLAUDE.md', claude],
  ['RULES.md', rules],
  ['README.md', readme],
  ['docs/README.md', docsReadme],
  ['STATE/CURRENT.md', current],
]) {
  forbidText(rel, text, oldGuideUrl);
}

// Presentation implementation must not exist in www anymore.
for (const rel of [
  'src/pages/Guide.tsx',
  'src/data/guideDeck.ts',
  'src/data/guideHotspots.ts',
  'public/guide',
  'public/guide-visual-isolation.css',
  'guide',
  'docs/GUIDE_MISSING_CAPTURES.md',
  'docs/GUIDE_SCREENSHOTS_MANIFEST.md',
  'scripts/checks/guide-integrity-audit.cjs',
  'scripts/checks/guide-truth-consistency-audit.cjs',
  'scripts/checks/guide-presentation-quality-audit.cjs',
  'scripts/checks/guide-asset-integrity-audit.cjs',
  'scripts/maintenance/guide-content-hash.cjs',
  'scripts/maintenance/write-guide-release.cjs',
  '.github/workflows/guide-static-always-on.yml',
  '.github/workflows/guide-live-smoke.yml',
]) {
  forbidPath(rel);
}

// Legacy Termux packaging remains an explicit manual fallback only.
requireText('.github/workflows/build-termux-runtime.yml', termuxWorkflow, 'workflow_dispatch');
requireText('.github/workflows/build-termux-runtime.yml', termuxWorkflow, 'manual_fallback_only');
forbidText('.github/workflows/build-termux-runtime.yml', termuxWorkflow, staleGeminiBranch);
forbidText('.github/workflows/build-termux-runtime.yml', termuxWorkflow, 'termux-runtime-public-placeholder');
if (/^\s*push\s*:/m.test(termuxWorkflow)) {
  failures.push('.github/workflows/build-termux-runtime.yml: legacy fallback must not have a push trigger');
}

if (failures.length) {
  console.error('REPO_GOVERNANCE_AUDIT_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('REPO_GOVERNANCE_AUDIT_OK');
