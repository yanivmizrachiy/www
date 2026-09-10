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

const memory = read('PROJECT_MEMORY.md');
const claude = read('CLAUDE.md');
const rules = read('RULES.md');
const readme = read('README.md');
const docsReadme = read('docs/README.md');
const current = read('STATE/CURRENT.md');
const termuxWorkflow = read('.github/workflows/build-termux-runtime.yml');

const teacherHubUrl = 'https://www-tijc.onrender.com';
const guideUrl = 'https://yanivmizrachiy.github.io/www/guide/';
const staleGeminiBranch = 'gemini/ai-studio-sync-20260428-193953';

// Repository-wide canonical truth must describe both products and both runtimes.
requireText('PROJECT_MEMORY.md', memory, 'PROJECT_MEMORY.md');
requireText('PROJECT_MEMORY.md', memory, teacherHubUrl);
requireText('PROJECT_MEMORY.md', memory, guideUrl);
requireText('PROJECT_MEMORY.md', memory, 'Render לעולם אינו מפרסם ואינו מאמת את ה-Guide');

// AI entrypoint must not silently collapse the repository back to Teacher Hub only.
requireText('CLAUDE.md', claude, 'Moodle Teacher Hub');
requireText('CLAUDE.md', claude, 'Guide');
requireText('CLAUDE.md', claude, 'PROJECT_MEMORY.md');
requireText('CLAUDE.md', claude, teacherHubUrl);
requireText('CLAUDE.md', claude, guideUrl);
forbidText('CLAUDE.md', claude, 'מקור אמת עליון: `PROJECT_RULES.md`');

// Repository boundaries must explicitly allow the two canonical Moodle products.
requireText('RULES.md', rules, 'Moodle Teacher Hub');
requireText('RULES.md', rules, 'Guide');
requireText('RULES.md', rules, teacherHubUrl);
requireText('RULES.md', rules, guideUrl);
requireText('RULES.md', rules, 'luz-teddy/');
requireText('RULES.md', rules, 'smartcalendar-titan');
forbidText('RULES.md', rules, 'מיועד ל־Moodle Teacher Hub בלבד');

// Current-facing docs must resolve to the canonical hierarchy.
requireText('docs/README.md', docsReadme, '../PROJECT_MEMORY.md');
requireText('docs/README.md', docsReadme, '../PROJECT_RULES.md');
requireText('STATE/CURRENT.md', current, teacherHubUrl);
requireText('STATE/CURRENT.md', current, guideUrl);
requireText('STATE/CURRENT.md', current, 'PROJECT_MEMORY.md');

const readmeCurrent = readme.split('<details>')[0];
requireText('README.md', readmeCurrent, teacherHubUrl);
requireText('README.md', readmeCurrent, guideUrl);
requireText('README.md', readmeCurrent, 'PROJECT_MEMORY.md');
forbidText('README.md current section', readmeCurrent, staleGeminiBranch);

// Legacy Termux packaging is retained only as an explicit manual fallback.
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
