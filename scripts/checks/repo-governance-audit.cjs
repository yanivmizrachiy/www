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

function before(text, marker) {
  const index = text.indexOf(marker);
  return index === -1 ? text : text.slice(0, index);
}

const memory = read('PROJECT_MEMORY.md');
const publicMemory = read('public/PROJECT_MEMORY.md');
const claude = read('CLAUDE.md');
const rules = read('RULES.md');
const projectRules = read('PROJECT_RULES.md');
const readme = read('README.md');
const docsReadme = read('docs/README.md');
const current = read('STATE/CURRENT.md');
const projectStatus = read('STATE/project-status.md');
const setupGuide = read('MOODLE_SETUP_GUIDE.md');
const safeBacklog = read('SAFE_NEXT_PR_BACKLOG.md');
const workPlan = read('docs/operations/work-plan.md');
const syncPrinciples = read('STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md');
const uiPrinciples = read('STATE/PRINCIPLES_HEBREW_UI_REAL_PRODUCT.md');
const missingCaptures = read('docs/GUIDE_MISSING_CAPTURES.md');
const termuxWorkflow = read('.github/workflows/build-termux-runtime.yml');

const teacherHubUrl = 'https://www-tijc.onrender.com';
const guideUrl = 'https://yanivmizrachiy.github.io/www/guide/';
const staleGeminiBranch = 'gemini/ai-studio-sync-20260428-193953';
const staleRenderGuideBranch = 'rebuild/lti13-secure-teacher-hub';

// Repository-wide canonical truth must describe both products and both runtimes.
requireText('PROJECT_MEMORY.md', memory, 'PROJECT_MEMORY.md');
requireText('PROJECT_MEMORY.md', memory, teacherHubUrl);
requireText('PROJECT_MEMORY.md', memory, guideUrl);
requireText('PROJECT_MEMORY.md', memory, 'Render לעולם אינו מפרסם ואינו מאמת את ה-Guide');
if (memory !== publicMemory) {
  failures.push('public/PROJECT_MEMORY.md: public mirror differs from canonical PROJECT_MEMORY.md');
}

// AI entrypoint must not silently collapse the repository back to Teacher Hub only.
requireText('CLAUDE.md', claude, 'Moodle Teacher Hub');
requireText('CLAUDE.md', claude, 'Guide');
requireText('CLAUDE.md', claude, 'PROJECT_MEMORY.md');
requireText('CLAUDE.md', claude, teacherHubUrl);
requireText('CLAUDE.md', claude, guideUrl);
forbidText('CLAUDE.md', claude, 'מקור אמת עליון: `PROJECT_RULES.md`');
forbidText('CLAUDE.md', claude, staleGeminiBranch);
forbidText('CLAUDE.md', claude, staleRenderGuideBranch);

// Repository boundaries must explicitly allow the two canonical Moodle products.
requireText('RULES.md', rules, 'Moodle Teacher Hub');
requireText('RULES.md', rules, 'Guide');
requireText('RULES.md', rules, teacherHubUrl);
requireText('RULES.md', rules, guideUrl);
requireText('RULES.md', rules, 'luz-teddy/');
requireText('RULES.md', rules, 'smartcalendar-titan');
forbidText('RULES.md', rules, 'מיועד ל־Moodle Teacher Hub בלבד');
forbidText('RULES.md', rules, staleGeminiBranch);
forbidText('RULES.md', rules, staleRenderGuideBranch);

// PROJECT_RULES is Teacher-Hub detail. Only its current top block is evaluated;
// older blocks are retained as history and may contain superseded wording.
const projectRulesCurrent = before(projectRules, '<!-- MTH_SOURCE_OF_TRUTH_AUTOMATION_PLAN_20260519_START -->');
requireText('PROJECT_RULES.md current block', projectRulesCurrent, 'Moodle Teacher Hub');
requireText('PROJECT_RULES.md current block', projectRulesCurrent, teacherHubUrl);
requireText('PROJECT_RULES.md current block', projectRulesCurrent, 'Teacher Release: **NO**');
forbidText('PROJECT_RULES.md current block', projectRulesCurrent, staleGeminiBranch);
forbidText('PROJECT_RULES.md current block', projectRulesCurrent, staleRenderGuideBranch);

// Current-facing docs must resolve to the canonical hierarchy.
requireText('docs/README.md', docsReadme, '../PROJECT_MEMORY.md');
requireText('docs/README.md', docsReadme, '../PROJECT_RULES.md');
requireText('STATE/CURRENT.md', current, teacherHubUrl);
requireText('STATE/CURRENT.md', current, guideUrl);
requireText('STATE/CURRENT.md', current, 'PROJECT_MEMORY.md');
forbidText('STATE/CURRENT.md', current, staleGeminiBranch);
forbidText('STATE/CURRENT.md', current, staleRenderGuideBranch);

const readmeCurrent = before(readme, '<details>');
requireText('README.md current section', readmeCurrent, teacherHubUrl);
requireText('README.md current section', readmeCurrent, guideUrl);
requireText('README.md current section', readmeCurrent, 'PROJECT_MEMORY.md');
forbidText('README.md current section', readmeCurrent, staleGeminiBranch);
forbidText('README.md current section', readmeCurrent, staleRenderGuideBranch);

// The legacy project-status filename must not masquerade as current truth.
const projectStatusCurrent = before(projectStatus, '<details>');
requireText('STATE/project-status.md routing notice', projectStatusCurrent, 'Historical Teacher Hub status snapshot');
requireText('STATE/project-status.md routing notice', projectStatusCurrent, 'PROJECT_MEMORY.md');
requireText('STATE/project-status.md routing notice', projectStatusCurrent, 'STATE/CURRENT.md');
requireText('STATE/project-status.md routing notice', projectStatusCurrent, teacherHubUrl);
requireText('STATE/project-status.md routing notice', projectStatusCurrent, guideUrl);
forbidText('STATE/project-status.md routing notice', projectStatusCurrent, '## Current product truth');
forbidText('STATE/project-status.md routing notice', projectStatusCurrent, staleGeminiBranch);

// Setup instructions must point to the real canonical Teacher Hub runtime, not tunnels.
requireText('MOODLE_SETUP_GUIDE.md', setupGuide, 'Moodle Teacher Hub בלבד');
requireText('MOODLE_SETUP_GUIDE.md', setupGuide, `${teacherHubUrl}/api/lti/launch`);
requireText('MOODLE_SETUP_GUIDE.md', setupGuide, 'Teacher Release');
requireText('MOODLE_SETUP_GUIDE.md', setupGuide, 'PROJECT_MEMORY.md');
forbidText('MOODLE_SETUP_GUIDE.md', setupGuide, 'YOUR-TUNNEL.loca.lt');
forbidText('MOODLE_SETUP_GUIDE.md', setupGuide, 'rebuild/lti13-secure-teacher-hub');

// Root backlog and operations plan are historical indexes, not active source-of-truth files.
const backlogCurrent = before(safeBacklog, '---');
requireText('SAFE_NEXT_PR_BACKLOG.md routing notice', backlogCurrent, 'אינו מקור אמת קנוני');
requireText('SAFE_NEXT_PR_BACKLOG.md routing notice', backlogCurrent, 'STATE/CURRENT.md');
requireText('SAFE_NEXT_PR_BACKLOG.md routing notice', backlogCurrent, 'docs/GUIDE_MISSING_CAPTURES.md');
forbidText('SAFE_NEXT_PR_BACKLOG.md routing notice', backlogCurrent, staleGeminiBranch);

const workPlanCurrent = before(workPlan, '<details>');
requireText('docs/operations/work-plan.md routing notice', workPlanCurrent, 'תכנית עבודה היסטורית');
requireText('docs/operations/work-plan.md routing notice', workPlanCurrent, 'PROJECT_MEMORY.md');
requireText('docs/operations/work-plan.md routing notice', workPlanCurrent, teacherHubUrl);
requireText('docs/operations/work-plan.md routing notice', workPlanCurrent, guideUrl);
requireText('docs/operations/work-plan.md routing notice', workPlanCurrent, `אסור להשתמש בענף \`${staleGeminiBranch}\` כענף עבודה פעיל`);

// Old STATE addenda may retain useful principles, but they must never present themselves
// as parallel memory files or independent current truth.
requireText('STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md', syncPrinciples, 'historical principles snapshot');
requireText('STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md', syncPrinciples, 'PROJECT_MEMORY.md');
requireText('STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md', syncPrinciples, 'only repository-wide canonical source of truth');
forbidText('STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md', syncPrinciples, 'Main memory files:');

requireText('STATE/PRINCIPLES_HEBREW_UI_REAL_PRODUCT.md', uiPrinciples, 'historical principles snapshot');
requireText('STATE/PRINCIPLES_HEBREW_UI_REAL_PRODUCT.md', uiPrinciples, 'PROJECT_MEMORY.md');
requireText('STATE/PRINCIPLES_HEBREW_UI_REAL_PRODUCT.md', uiPrinciples, 'not an independent source of truth');

// Guide operational docs must not reintroduce removed deck modules or old deployment branches.
requireText('docs/GUIDE_MISSING_CAPTURES.md', missingCaptures, 'src/data/guideDeck.ts');
forbidText('docs/GUIDE_MISSING_CAPTURES.md', missingCaptures, 'src/data/guideDeckSource.ts');
forbidText('docs/GUIDE_MISSING_CAPTURES.md', missingCaptures, staleRenderGuideBranch);

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
