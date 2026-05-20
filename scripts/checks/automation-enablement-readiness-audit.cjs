#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredFiles = [
  'docs/automation/MOODLE_AUTOMATION_ENABLEMENT_READINESS_V1.md',
  'docs/moodle/MOODLE_AUTOMATION_ADMIN_ENABLEMENT_CHECKLIST_HE.md',
  'scripts/checks/automation-enablement-readiness-audit.cjs',
  '.github/workflows/moodle-automation-safety.yml',
];

function fail(message) {
  console.error(`AUTOMATION_ENABLEMENT_READINESS_AUDIT_FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function full(rel) {
  return path.join(root, rel);
}

function exists(rel) {
  return fs.existsSync(full(rel));
}

function read(rel) {
  return fs.readFileSync(full(rel), 'utf8');
}

function walk(dir, out = []) {
  const start = full(dir);
  if (!fs.existsSync(start)) return out;
  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    const abs = path.join(start, entry.name);
    const rel = path.relative(root, abs).split(path.sep).join('/');
    if (
      rel.includes('node_modules') ||
      rel.includes('.git') ||
      rel.startsWith('dist/') ||
      rel.startsWith('build/') ||
      rel.startsWith('coverage/')
    ) continue;
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.(js|jsx|ts|tsx|mjs|cjs|md|yml|yaml)$/.test(entry.name)) out.push(rel);
  }
  return out;
}

for (const file of requiredFiles) {
  if (!exists(file)) fail(`required file missing: ${file}`);
  ok(`found ${file}`);
}

const spec = read('docs/automation/MOODLE_AUTOMATION_ENABLEMENT_READINESS_V1.md');
for (const phrase of [
  'Manual import remains a fallback only',
  'core_webservice_get_site_info',
  'Do not claim automatic sync',
  'Teacher Release remains **NO**',
]) {
  if (!spec.includes(phrase)) fail(`automation readiness spec missing: ${phrase}`);
}
ok('automation readiness spec contains required truth boundaries');

const admin = read('docs/moodle/MOODLE_AUTOMATION_ADMIN_ENABLEMENT_CHECKLIST_HE.md');
for (const phrase of ['LTI 1.3', 'NRPS', 'AGS', 'Moodle Web Services', 'core_course_get_contents']) {
  if (!admin.includes(phrase)) fail(`admin checklist missing: ${phrase}`);
}
ok('admin checklist contains required enablement questions');

const workflow = read('.github/workflows/moodle-automation-safety.yml');
for (const phrase of [
  'npm run audit:moodle-automation',
  'npm run audit:multi-teacher-safety',
  'npm run audit:deep-launch-context',
  'npm run audit:lti-probes',
  'node scripts/checks/automation-enablement-readiness-audit.cjs',
  'npm run check',
  'npm run build',
  'npm run doctor',
]) {
  if (!workflow.includes(phrase)) fail(`workflow missing command: ${phrase}`);
}
ok('workflow contains required safety commands');

const forbiddenPatterns = [
  { id: 'fake_sync_claim', regex: /automatic sync\s*(is|:)?\s*(ready|enabled|working|complete)/i },
  { id: 'teacher_release_yes', regex: /Teacher\s+Release\s*[:=]?\s*YES/i },
  { id: 'teacher_release_true', regex: /teacherRelease\s*[:=]\s*true\b/i },
  { id: 'hardcoded_course_259_assignment', regex: /(?:courseId|course_id|contextId|context_id|id)\s*[:=]\s*["'`]259["'`]/i },
  { id: 'hardcoded_course_259_query', regex: /(?:course|id)=259\b/i },
];

const scanFiles = walk('src').concat(walk('docs'), walk('STATE'), walk('WORK_ORDERS'));
const findings = [];
for (const file of scanFiles) {
  const text = read(file);
  text.split(/\r?\n/).forEach((line, index) => {
    for (const rule of forbiddenPatterns) {
      if (rule.regex.test(line)) {
        findings.push({ rule: rule.id, file, line: index + 1, text: line.trim().slice(0, 180) });
      }
    }
  });
}

if (findings.length) {
  console.error(JSON.stringify(findings, null, 2));
  fail('unsafe automation readiness marker found');
}
ok('no unsafe automation readiness markers found');

console.log('AUTOMATION_ENABLEMENT_READINESS_AUDIT_OK');
