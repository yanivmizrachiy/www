const fs = require('node:fs');
const path = require('node:path');
const { computeGuideHash } = require('../maintenance/guide-content-hash.cjs');

const root = path.resolve(__dirname, '../..');
const sourcePath = path.join(root, 'src/data/guideDeckSource.ts');
const deckPath = path.join(root, 'src/data/guideDeck.ts');
const missingPath = path.join(root, 'docs/GUIDE_MISSING_CAPTURES.md');
const manifestPath = path.join(root, 'docs/GUIDE_SCREENSHOTS_MANIFEST.md');
const memoryPath = path.join(root, 'PROJECT_MEMORY.md');
const publicMemoryPath = path.join(root, 'public/PROJECT_MEMORY.md');
const guideCssPath = path.join(root, 'public/guide-visual-isolation.css');
const screenshotsDir = path.join(root, 'public/guide/screenshots');
const guideSwPath = path.join(root, 'public/guide/sw.js');
const viteConfigPath = path.join(root, 'vite.config.ts');
const liveSmokePath = path.join(root, '.github/workflows/guide-live-smoke.yml');
const renderRecoveryPath = path.join(root, '.github/workflows/render-deploy-recovery.yml');
const staticPagesPath = path.join(root, '.github/workflows/guide-static-always-on.yml');

const errors = [];
const notes = [];
const fail = (message) => errors.push(message);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

for (const requiredPath of [
  sourcePath,
  deckPath,
  missingPath,
  manifestPath,
  memoryPath,
  publicMemoryPath,
  guideCssPath,
]) {
  if (!fs.existsSync(requiredPath)) fail(`Required Guide truth file is missing: ${path.relative(root, requiredPath)}`);
}

if (errors.length) {
  console.error('\nGuide integrity audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const source = fs.readFileSync(sourcePath, 'utf8');
const deck = fs.readFileSync(deckPath, 'utf8');
const missing = fs.readFileSync(missingPath, 'utf8');
const manifest = fs.readFileSync(manifestPath, 'utf8');
const memory = fs.readFileSync(memoryPath, 'utf8');
const publicMemory = fs.readFileSync(publicMemoryPath, 'utf8');
const guideCss = fs.readFileSync(guideCssPath, 'utf8');

// 1) Canonical truth must remain singular. public/PROJECT_MEMORY.md is only a mirror.
if (memory !== publicMemory) {
  fail('public/PROJECT_MEMORY.md is not byte-for-byte synchronized with canonical PROJECT_MEMORY.md.');
}

// 2) There must be exactly one application-facing publication gate.
if (/export\s+const\s+PUBLISHED_GUIDE_SLIDES\b/.test(source)) {
  fail('guideDeckSource.ts must not export PUBLISHED_GUIDE_SLIDES; publication policy belongs only in guideDeck.ts.');
}
if (/export\s+const\s+QUICK_START_SLIDE_IDS\b/.test(source)) {
  notes.push('guideDeckSource.ts still carries a legacy QUICK_START_SLIDE_IDS list; application policy remains protected in guideDeck.ts and source cleanup is still pending.');
}

for (const requiredFragment of ["slide.status === 'ready'", '!slide.missingCaptureId']) {
  if (!deck.includes(requiredFragment)) fail(`guideDeck.ts publication gate is missing: ${requiredFragment}`);
}
for (const forbiddenFragment of ["slide.status !== 'needs-capture'", "slide.status !== 'needs-fact'"]) {
  if (deck.includes(forbiddenFragment)) {
    fail(`guideDeck.ts uses a deny-list publication rule instead of explicit ready status: ${forbiddenFragment}`);
  }
}
for (const requiredFragment of ["slide.missingCaptureId && slide.status === 'ready'", "'needs-capture' as const"]) {
  if (!deck.includes(requiredFragment)) fail(`guideDeck.ts is missing defensive status normalization: ${requiredFragment}`);
}
for (const requiredFragment of [
  'toModernScreenshotFilename',
  "return src.replace(/\\.[^.]+$/, '.avif')",
  'src: toModernScreenshotFilename(screenshot.src)',
]) {
  if (!deck.includes(requiredFragment)) fail(`guideDeck.ts is missing AVIF screenshot mapping: ${requiredFragment}`);
}

const srcFiles = walk(path.join(root, 'src')).filter((file) => /\.[cm]?[jt]sx?$/.test(file));
for (const file of srcFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'src/data/guideDeck.ts' || relative === 'src/data/guideDeckSource.ts') continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('guideDeckSource')) {
    fail(`${relative} imports/references guideDeckSource directly; use src/data/guideDeck.ts so publication rules cannot be bypassed.`);
  }
}

// 3) Every slide heading is a question, except the cover.
const slidesStart = source.indexOf('export const GUIDE_SLIDES');
const quickStartStart = source.indexOf('export const QUICK_START_SLIDE_IDS', slidesStart);
const slidesBlock = source.slice(slidesStart, quickStartStart > slidesStart ? quickStartStart : undefined);
const titleRegex = /title:\s*'([^']+)'/g;
let titleMatch;
while ((titleMatch = titleRegex.exec(slidesBlock))) {
  const title = titleMatch[1].trim();
  if (title === 'מדריך למורים במערכת Moodle') continue;
  if (!title.endsWith('?')) fail(`Slide title is not a question: ${title}`);
}

const readyWithMissingIds = [
  ...slidesBlock.matchAll(/status:\s*'ready',\s*\n\s*missingCaptureId:\s*'(M\d{2})'/g),
].map((match) => match[1]);
if (readyWithMissingIds.length) {
  notes.push(`Source entries normalized to needs-capture at runtime: ${[...new Set(readyWithMissingIds)].join(', ')}.`);
}

// 4) Missing-capture truth is dynamic. IDs disappear when evidence is genuinely completed.
const sourceMissingIds = [...source.matchAll(/missingCaptureId:\s*'(M\d{2})'/g)].map((match) => match[1]);
const docMissingIds = [...missing.matchAll(/^##\s+(M\d{2})\b/gm)].map((match) => match[1]);
const sourceMissingSet = new Set(sourceMissingIds);
const docMissingSet = new Set(docMissingIds);
for (const id of sourceMissingSet) {
  if (!docMissingSet.has(id)) fail(`${id} is referenced by guideDeckSource.ts but missing from GUIDE_MISSING_CAPTURES.md.`);
}
for (const id of docMissingSet) {
  if (!sourceMissingSet.has(id)) fail(`${id} exists in GUIDE_MISSING_CAPTURES.md but no slide references it.`);
}
if (docMissingIds.length !== docMissingSet.size) fail('GUIDE_MISSING_CAPTURES.md contains duplicate M-IDs.');

// 5) Every screenshot referenced by the deck must exist with AVIF + WebP derivatives.
const screenshotRefs = [...source.matchAll(/src:\s*'([^']+\.(?:jpg|jpeg|png|webp|avif))'/g)].map((match) => match[1]);
for (const screenshot of new Set(screenshotRefs)) {
  if (screenshot.includes('/') || screenshot.includes('\\')) {
    fail(`Screenshot reference must be a filename only: ${screenshot}`);
    continue;
  }
  if (!fs.existsSync(path.join(screenshotsDir, screenshot))) {
    fail(`Referenced screenshot does not exist: public/guide/screenshots/${screenshot}`);
  }
  const base = screenshot.replace(/\.[^.]+$/, '');
  for (const extension of ['avif', 'webp']) {
    const modern = `${base}.${extension}`;
    if (!fs.existsSync(path.join(screenshotsDir, modern))) {
      fail(`Modern Guide screenshot derivative is missing: public/guide/screenshots/${modern}`);
    }
  }
}

// 6) Guide visual isolation must be route-scoped and avoid fragile Tailwind selectors.
if (!guideCss.includes('html[data-surface="guide"]')) {
  fail('guide-visual-isolation.css is not scoped to html[data-surface="guide"].');
}
for (const fragileCoverSelector of ['from-slate-950', 'via-blue-950', 'to-slate-900']) {
  if (guideCss.includes(fragileCoverSelector)) fail(`guide-visual-isolation.css still depends on fragile cover utility class: ${fragileCoverSelector}`);
}
if (!guideCss.includes(':has(img[alt^="יחידת מתמטיקה"])')) {
  fail('guide-visual-isolation.css is missing the stable branded-cover selector.');
}

// 7) Service worker must stay valid, fail-open, and work both at /guide and a static host base path such as /www/guide.
if (!fs.existsSync(guideSwPath)) {
  fail('Guide service worker is missing: public/guide/sw.js');
} else {
  const guideSw = fs.readFileSync(guideSwPath, 'utf8');
  try {
    new Function(guideSw);
  } catch (error) {
    fail(`Guide service worker has invalid JavaScript: ${error.message}`);
  }

  for (const requiredFragment of [
    "CACHE_PREFIX = 'moodle-guide-'",
    'NAVIGATION_FRESHNESS_MS',
    'Promise.race([',
    'event.waitUntil(networkPromise)',
    'self.registration.scope',
    "scopePath.endsWith('/guide')",
    "`${scopePath}/release.json`",
    "withBase('/assets/')",
  ]) {
    if (!guideSw.includes(requiredFragment)) {
      fail(`Guide service worker is missing base-aware freshness/isolation rule: ${requiredFragment}`);
    }
  }

  if (guideSw.includes("url.pathname === '/guide/release.json'") || guideSw.includes("url.pathname.startsWith('/assets/')")) {
    fail('Guide service worker regressed to root-only hard-coded paths; static always-on hosting would break.');
  }
}

// 8) Live verification must compare canonical Guide content, not branch commit SHA.
// Single-source routing: PROJECT_MEMORY.md owns every /guide authoring rule, so the governance
// documents must actually say so. Without this gate the routing silently rots and an agent reading
// only CLAUDE.md or docs/ decides guide questions against the wrong file.
const routingTargets = [
  ['CLAUDE.md', 'PROJECT_MEMORY.md'],
  ['README.md', 'PROJECT_MEMORY.md'],
  ['RULES.md', 'PROJECT_MEMORY.md'],
  ['PROJECT_RULES.md', 'PROJECT_MEMORY.md'],
];
for (const [file, needle] of routingTargets) {
  const routingPath = path.join(root, file);
  if (!fs.existsSync(routingPath)) {
    fail(`Governance document is missing: ${file}`);
    continue;
  }
  if (!fs.readFileSync(routingPath, 'utf8').includes(needle)) {
    fail(`${file} must name ${needle} as the source of truth for the /guide presentation.`);
  }
}

// Slide ids are the navigation primitive: jumpToSlide/?slide= resolve by findIndex, so a duplicate
// id silently makes the second slide unreachable. Nothing else in the repo guards this.
const slideIds = [...slidesBlock.matchAll(/(?:^|\n)\s{4}id: '([^']+)',/g)].map((match) => match[1]);
if (slideIds.length === 0) {
  fail('Could not parse any slide ids from guideDeckSource.ts; this audit would otherwise pass while checking nothing.');
}
const duplicateSlideIds = [...new Set(slideIds.filter((id, index) => slideIds.indexOf(id) !== index))];
if (duplicateSlideIds.length) {
  fail(`Duplicate slide ids in guideDeckSource.ts (navigation only ever reaches the first): ${duplicateSlideIds.join(', ')}`);
}

// Quick Start is a hand-maintained id list in guideDeck.ts; a typo there silently drops a step.
const quickStartBlock = deck.match(/const QUICK_START_CANDIDATES = \[([\s\S]*?)\];/);
if (!quickStartBlock) {
  fail('Could not locate QUICK_START_CANDIDATES in src/data/guideDeck.ts.');
} else {
  const quickStartIds = [...quickStartBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  const unknownQuickStart = quickStartIds.filter((id) => !slideIds.includes(id));
  if (unknownQuickStart.length) {
    fail(`QUICK_START_CANDIDATES references slide ids that do not exist: ${unknownQuickStart.join(', ')}`);
  }

  // A candidate that is blocked on a capture is filtered out at runtime, so the teacher's Quick Start
  // path silently loses that step. That is legitimate, but it must never be invisible.
  const publishedIds = new Set(
    slidesBlock
      .split(/\n  \{\r?\n/)
      .slice(1)
      .filter((block) => /status: 'ready'/.test(block) && !/missingCaptureId/.test(block))
      .map((block) => (block.match(/id: '([^']+)'/) || [])[1])
      .filter(Boolean)
  );
  const droppedQuickStart = quickStartIds.filter((id) => slideIds.includes(id) && !publishedIds.has(id));
  if (droppedQuickStart.length) {
    notes.push(
      `Quick Start shows ${quickStartIds.length - droppedQuickStart.length}/${quickStartIds.length} steps; ` +
        `blocked on a capture and hidden from the teacher: ${droppedQuickStart.join(', ')}`
    );
  }
}

// Rule 24 (PROJECT_MEMORY.md, chapter 2): the two cover branding lines are fixed verbatim,
// matching the misparim / zaviyot-digital-workbook projects. They must live in the deck source
// (single source of truth) and stay byte-identical to the truth document.
const brandingLines = [
  'הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין',
  'האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים',
];
if (!/export const GUIDE_BRANDING_LINES/.test(source)) {
  fail('GUIDE_BRANDING_LINES must be declared in src/data/guideDeckSource.ts (single source of truth for cover branding).');
}
if (!deck.includes('GUIDE_BRANDING_LINES')) {
  fail('src/data/guideDeck.ts must re-export GUIDE_BRANDING_LINES so pages never import guideDeckSource directly.');
}
for (const line of brandingLines) {
  if (!source.includes(line)) fail(`Cover branding line missing or reworded in guideDeckSource.ts: ${line}`);
  if (!memory.includes(line)) fail(`Cover branding line missing from PROJECT_MEMORY.md rule 24: ${line}`);
}

const guideHash = computeGuideHash();
if (!/^[a-f0-9]{64}$/.test(guideHash)) fail(`Guide content fingerprint is invalid: ${guideHash}`);

const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
for (const requiredFragment of ['guide-content-hash.cjs', 'const guideHash = currentGuideHash()', 'guideHash, generatedAt']) {
  if (!viteConfig.includes(requiredFragment)) fail(`vite.config.ts is missing Guide release fingerprint wiring: ${requiredFragment}`);
}

for (const [workflowName, workflowPath] of [
  ['Guide Live Smoke', liveSmokePath],
  ['Render Deploy Recovery', renderRecoveryPath],
]) {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const requiredFragment of ['EXPECTED_GUIDE_HASH', 'guideHash', 'guide-content-hash.cjs']) {
    if (!workflow.includes(requiredFragment)) fail(`${workflowName} is missing content-fingerprint verification: ${requiredFragment}`);
  }
}

// The source-of-truth performance rule requires an always-on static Guide route independent of Render sleep.
// PRs may build/prove the static artifact, but deployment must remain main-push-only.
if (!fs.existsSync(staticPagesPath)) {
  fail('Canonical static always-on Guide workflow is missing: .github/workflows/guide-static-always-on.yml');
} else {
  const staticPages = fs.readFileSync(staticPagesPath, 'utf8');
  for (const requiredFragment of [
    'actions/configure-pages@v5',
    'actions/upload-pages-artifact@v4',
    'actions/deploy-pages@v4',
    'dist/guide/index.html',
    "github.event_name == 'push' && github.ref == 'refs/heads/main'",
  ]) {
    if (!staticPages.includes(requiredFragment)) fail(`Static Guide workflow is missing required always-on/no-PR-deploy rule: ${requiredFragment}`);
  }
}

// 9) Missing-capture and screenshot documentation must preserve truth/safety rules.
for (const requiredPhrase of ['אין Demo', 'אין Placeholder', 'אין צילום מומצא']) {
  if (!missing.includes(requiredPhrase)) fail(`GUIDE_MISSING_CAPTURES.md is missing safety rule: ${requiredPhrase}`);
}
for (const staleArchitectureTerm of ['guideButtons.ts', 'ButtonArea', 'QUESTION_SHOTS']) {
  if (manifest.includes(staleArchitectureTerm)) fail(`GUIDE_SCREENSHOTS_MANIFEST.md still documents retired Guide architecture: ${staleArchitectureTerm}`);
}

if (notes.length) for (const note of notes) console.log(`NOTE: ${note}`);
if (errors.length) {
  console.error('\nGuide integrity audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Guide integrity audit passed: ${screenshotRefs.length} screenshot references, ${docMissingSet.size} unresolved canonical capture IDs, guideHash=${guideHash}.`);
