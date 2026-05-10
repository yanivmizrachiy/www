import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const stateDir = path.join(root, 'STATE', 'readiness-audit');
fs.mkdirSync(stateDir, { recursive: true });

function run(command) {
  try {
    return execSync(command, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    return String(error.stdout || error.stderr || error.message || '').trim();
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
  } catch {
    return '';
  }
}

function countPattern(pattern) {
  const files = run('git ls-files').split(/\r?\n/).filter(Boolean).filter((file) => /\.(ts|tsx|js|jsx|mjs|cjs|json|md|sql|ps1|txt|css|html)$/.test(file));
  let count = 0;
  const hits = [];
  for (const file of files) {
    const text = read(file);
    let index = text.indexOf(pattern);
    while (index !== -1) {
      count += 1;
      const lineNumber = text.slice(0, index).split(/\r?\n/).length;
      hits.push(`${file}:${lineNumber}`);
      index = text.indexOf(pattern, index + pattern.length);
    }
  }
  return { pattern, count, hits: hits.slice(0, 20) };
}

const requiredFiles = [
  'PROJECT_RULES.md',
  'STATE/evidence-log.md',
  'STATE/project-status.md',
  'docs/supabase-deployment-runbook.md',
  'package.json',
  'server.ts',
  'src/server.js',
  'src/App.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Import.tsx',
  'src/pages/Export.tsx',
  'src/pages/LtiBootstrap.tsx',
  'src/pages/reports/GapReport.tsx',
  'src/hooks/useImports.tsx',
  'src/lib/moodleImport.ts',
  'supabase/functions/lti-launch/index.ts',
  'supabase/functions/import-moodle-report/index.ts',
  'supabase/migrations/20260501_initial_schema.sql',
  'supabase/migrations/20240428_initial_reconstruction_DRAFT_DO_NOT_RUN.sql',
];

const patterns = [
  'teacher-demo',
  'space-demo',
  '/dev/login',
  'מורה לדוגמה',
  'מרחב לדוגמה',
  'const is_valid = true',
  '/api/lti/launch',
  '/lti/launch-1p1',
  'HMAC-SHA1',
  'oauth_signature',
  'timingSafeEqual',
  'SUPABASE_SERVICE_ROLE_KEY',
  'LTI_SHARED_SECRET',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'ייבוא נתונים',
  'ייצוא לאקסל',
  'דוח פערים',
];

const fileChecks = requiredFiles.map((file) => ({ file, exists: exists(file) }));
const searches = patterns.map(countPattern);
const branch = run('git branch --show-current');
const commit = run('git log -1 --oneline');
const status = run('git status --short');

const hasUnsafeLtiPlaceholder = searches.find((item) => item.pattern === 'const is_valid = true')?.count > 0;
const hasDemoStrings = ['teacher-demo', 'space-demo', '/dev/login', 'מורה לדוגמה', 'מרחב לדוגמה']
  .some((pattern) => (searches.find((item) => item.pattern === pattern)?.count || 0) > 0);
const hasCanonicalEndpoint = (searches.find((item) => item.pattern === '/api/lti/launch')?.count || 0) > 0;
const hasLegacyEndpoint = (searches.find((item) => item.pattern === '/lti/launch-1p1')?.count || 0) > 0;
const hasLtiOauthSignals = ['HMAC-SHA1', 'oauth_signature', 'timingSafeEqual']
  .every((pattern) => (searches.find((item) => item.pattern === pattern)?.count || 0) > 0);

const blockers = [];
if (fileChecks.some((item) => !item.exists)) blockers.push('missing_required_source_files');
if (hasUnsafeLtiPlaceholder) blockers.push('unsafe_lti_placeholder_exists');
if (hasDemoStrings) blockers.push('demo_strings_exist');
if (!hasCanonicalEndpoint) blockers.push('missing_canonical_lti_endpoint');
if (hasLegacyEndpoint) blockers.push('legacy_lti_endpoint_still_present');
if (!hasLtiOauthSignals) blockers.push('missing_oauth_signal_terms');
blockers.push('supabase_sql_not_verified_by_this_script');
blockers.push('supabase_functions_not_deployed_by_this_script');
blockers.push('real_moodle_launch_not_verified_by_this_script');
blockers.push('real_import_not_verified_by_this_script');

const report = {
  timestamp: new Date().toISOString(),
  branch,
  commit,
  status,
  fileChecks,
  searches,
  summary: {
    hasUnsafeLtiPlaceholder,
    hasDemoStrings,
    hasCanonicalEndpoint,
    hasLegacyEndpoint,
    hasLtiOauthSignals,
    readyForMoodleProduction: false,
    blockers,
  },
};

const jsonPath = path.join(stateDir, `readiness-audit-${stamp}.json`);
const mdPath = path.join(stateDir, `readiness-audit-${stamp}.md`);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

const md = [];
md.push('# Moodle Teacher Hub Readiness Audit');
md.push('');
md.push(`- Timestamp: ${report.timestamp}`);
md.push(`- Branch: ${branch}`);
md.push(`- Commit: ${commit}`);
md.push(`- Git status: ${status || 'clean'}`);
md.push('');
md.push('## Summary');
md.push('');
md.push(`- Unsafe LTI placeholder exists: ${hasUnsafeLtiPlaceholder}`);
md.push(`- Demo strings exist: ${hasDemoStrings}`);
md.push(`- Canonical /api/lti/launch found: ${hasCanonicalEndpoint}`);
md.push(`- Legacy /lti/launch-1p1 found: ${hasLegacyEndpoint}`);
md.push(`- OAuth signal terms found: ${hasLtiOauthSignals}`);
md.push('- Ready for real Moodle production: false');
md.push('');
md.push('## Blockers');
md.push('');
for (const blocker of blockers) md.push(`- ${blocker}`);
md.push('');
md.push('## Required files');
md.push('');
md.push('| File | Exists |');
md.push('|---|---:|');
for (const item of fileChecks) md.push(`| \`${item.file}\` | ${item.exists} |`);
md.push('');
md.push('## Pattern counts');
md.push('');
md.push('| Pattern | Count |');
md.push('|---|---:|');
for (const item of searches) md.push(`| \`${item.pattern}\` | ${item.count} |`);
md.push('');
md.push('## Truth note');
md.push('');
md.push('This script never runs SQL, never deploys Supabase Functions, never changes Moodle Tool URL, and never claims production readiness.');
fs.writeFileSync(mdPath, md.join('\n'), 'utf8');

console.log('READINESS_AUDIT_DONE=true');
console.log(`BRANCH=${branch}`);
console.log(`COMMIT=${commit}`);
console.log(`READY_FOR_MOODLE_PRODUCTION=false`);
console.log(`BLOCKERS=${blockers.join(',')}`);
console.log(`JSON_REPORT=${path.relative(root, jsonPath)}`);
console.log(`MD_REPORT=${path.relative(root, mdPath)}`);
console.log(`GIT_STATUS=${status || 'clean'}`);
