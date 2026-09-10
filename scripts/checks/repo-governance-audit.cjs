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
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

function requireText(rel, text, expected) {
  if (!text.includes(expected)) failures.push(`${rel}: missing required text: ${expected}`);
}

function forbidText(rel, text, forbidden) {
  if (text.includes(forbidden)) failures.push(`${rel}: forbidden stale text: ${forbidden}`);
}

function requireHistoricalHeading(rel, text) {
  if (!text.startsWith('# HISTORICAL SNAPSHOT')) {
    failures.push(`${rel}: must identify dated/actionable legacy content as a historical snapshot`);
  }
}

const memory = read('PROJECT_MEMORY.md');
const publicMemory = read('public/PROJECT_MEMORY.md');
const projectRules = read('PROJECT_RULES.md');
const claude = read('CLAUDE.md');
const rules = read('RULES.md');
const readme = read('README.md');
const docsReadme = read('docs/README.md');
const repoMap = read('docs/operations/repository-map.md');
const current = read('STATE/CURRENT.md');
const stateReadme = read('STATE/README.md');
const todoNext = read('STATE/TODO-NEXT.md');
const sessionHistory = read('SESSION_HISTORY.md');
const ltiSetupLog = read('AI_LTI_SETUP_LOG.md');
const automationStatus = read('STATE/automation/AUTOMATION_STATUS.md');
const currentLtiNrps = read('STATE/progress/current-lti13-nrps-status.md');
const implementationPlan = read('docs/architecture/implementation-plan.md');
const productRoadmap = read('docs/product/MOODLE_TEACHER_HUB_FINAL_PRODUCT_RULES_AND_ROADMAP_V1.md');
const moodleSetupGuide = read('MOODLE_SETUP_GUIDE.md');
const termuxWorkflow = read('.github/workflows/build-termux-runtime.yml');

const teacherHubUrl = 'https://www-tijc.onrender.com';
const guideUrl = 'https://yanivmizrachiy.github.io/www/guide/';
const staleGeminiBranch = 'gemini/ai-studio-sync-20260428-193953';

// Repository-wide canonical truth must describe both products and both runtimes.
requireText('PROJECT_MEMORY.md', memory, 'PROJECT_MEMORY.md');
requireText('PROJECT_MEMORY.md', memory, teacherHubUrl);
requireText('PROJECT_MEMORY.md', memory, guideUrl);
requireText('PROJECT_MEMORY.md', memory, 'Render לעולם אינו מפרסם ואינו מאמת את ה-Guide');
if (memory !== publicMemory) {
  failures.push('PROJECT_MEMORY.md and public/PROJECT_MEMORY.md must remain identical');
}

// PROJECT_RULES contains preserved historical blocks. Only its leading current block
// may be treated as current Teacher Hub truth, and that current block must not revive
// the obsolete Gemini authoring branch.
const projectRulesCurrent = projectRules.split('<!-- MTH_SOURCE_OF_TRUTH_AUTOMATION_PLAN_20260519_START -->')[0];
requireText('PROJECT_RULES.md current block', projectRulesCurrent, 'Moodle Teacher Hub');
requireText('PROJECT_RULES.md current block', projectRulesCurrent, teacherHubUrl);
requireText('PROJECT_RULES.md current block', projectRulesCurrent, 'Teacher Release: **NO**');
forbidText('PROJECT_RULES.md current block', projectRulesCurrent, staleGeminiBranch);

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
requireText('STATE/README.md', stateReadme, '../PROJECT_MEMORY.md');
requireText('STATE/README.md', stateReadme, 'historical snapshots');
requireText('STATE/README.md', stateReadme, teacherHubUrl);
requireText('STATE/README.md', stateReadme, guideUrl);
requireText('docs/operations/repository-map.md', repoMap, 'PROJECT_MEMORY.md');
requireText('docs/operations/repository-map.md', repoMap, 'src/data/guideDeck.ts');
requireText('docs/operations/repository-map.md', repoMap, teacherHubUrl);
requireText('docs/operations/repository-map.md', repoMap, guideUrl);

const readmeCurrent = readme.split('<details>')[0];
requireText('README.md current section', readmeCurrent, teacherHubUrl);
requireText('README.md current section', readmeCurrent, guideUrl);
requireText('README.md current section', readmeCurrent, 'PROJECT_MEMORY.md');
forbidText('README.md current section', readmeCurrent, staleGeminiBranch);

// Files whose names/content look current or actionable but are actually old snapshots
// must carry an explicit historical marker before the old claims/tasks appear.
for (const [rel, text] of [
  ['SESSION_HISTORY.md', sessionHistory],
  ['STATE/TODO-NEXT.md', todoNext],
  ['AI_LTI_SETUP_LOG.md', ltiSetupLog],
  ['STATE/automation/AUTOMATION_STATUS.md', automationStatus],
  ['STATE/progress/current-lti13-nrps-status.md', currentLtiNrps],
  ['docs/architecture/implementation-plan.md', implementationPlan],
  ['docs/product/MOODLE_TEACHER_HUB_FINAL_PRODUCT_RULES_AND_ROADMAP_V1.md', productRoadmap],
]) {
  requireHistoricalHeading(rel, text);
}

// Active setup guide must point to the actual canonical Teacher Hub runtime and
// must not advertise temporary tunnels as production setup.
requireText('MOODLE_SETUP_GUIDE.md', moodleSetupGuide, teacherHubUrl);
requireText('MOODLE_SETUP_GUIDE.md', moodleSetupGuide, `${teacherHubUrl}/api/lti/launch`);
requireText('MOODLE_SETUP_GUIDE.md', moodleSetupGuide, 'Teacher Release: **NO**');
requireText('MOODLE_SETUP_GUIDE.md', moodleSetupGuide, 'אין להשתמש ב-LocalTunnel, trycloudflare, Termux או URL זמני ככתובת production');

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
