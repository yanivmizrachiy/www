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
const screenshotsDir = path.join(root, 'public/guide/screenshots');
const guideSwPath = path.join(root, 'public/guide/sw.js');
const viteConfigPath = path.join(root, 'vite.config.ts');
const liveSmokePath = path.join(root, '.github/workflows/guide-live-smoke.yml');
const renderRecoveryPath = path.join(root, '.github/workflows/render-deploy-recovery.yml');

const errors = [];
const notes = [];

function fail(message) {
  errors.push(message);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
}

for (const requiredPath of [sourcePath, deckPath, missingPath, manifestPath, memoryPath, publicMemoryPath]) {
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

// 1) Canonical truth must remain singular. public/PROJECT_MEMORY.md is only a mirror.
if (memory !== publicMemory) {
  fail('public/PROJECT_MEMORY.md is not byte-for-byte synchronized with canonical PROJECT_MEMORY.md.');
}

// 2) There must be exactly one application-facing publication gate.
// Use an allow-list: only slides explicitly marked ready and without unresolved capture evidence can be public.
for (const requiredFragment of [
  "slide.status === 'ready'",
  '!slide.missingCaptureId',
]) {
  if (!deck.includes(requiredFragment)) {
    fail(`guideDeck.ts publication gate is missing: ${requiredFragment}`);
  }
}

for (const forbiddenFragment of [
  "slide.status !== 'needs-capture'",
  "slide.status !== 'needs-fact'",
]) {
  if (deck.includes(forbiddenFragment)) {
    fail(`guideDeck.ts uses a deny-list publication rule instead of explicit ready status: ${forbiddenFragment}`);
  }
}

// Legacy source entries may still say ready while carrying missingCaptureId.
// Runtime must normalize those entries before publication/search/quick-start.
for (const requiredFragment of [
  "slide.missingCaptureId && slide.status === 'ready'",
  "'needs-capture' as const",
]) {
  if (!deck.includes(requiredFragment)) {
    fail(`guideDeck.ts is missing defensive status normalization: ${requiredFragment}`);
  }
}

// Runtime must use verified AVIF derivatives rather than heavier source JPG/PNG files.
for (const requiredFragment of [
  'toModernScreenshotFilename',
  "return src.replace(/\\.[^.]+$/, '.avif')",
  'src: toModernScreenshotFilename(screenshot.src)',
]) {
  if (!deck.includes(requiredFragment)) {
    fail(`guideDeck.ts is missing AVIF screenshot mapping: ${requiredFragment}`);
  }
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

if (/export const PUBLISHED_GUIDE_SLIDES\s*=/.test(source)) {
  notes.push('guideDeckSource.ts still contains a legacy publication export; remove it when source cleanup is committed.');
}

// 3) Every slide heading is a question, except the cover.
const slidesStart = source.indexOf('export const GUIDE_SLIDES');
const legacyPublicationStart = source.indexOf('export const PUBLISHED_GUIDE_SLIDES', slidesStart);
const quickStartStart = source.indexOf('export const QUICK_START_SLIDE_IDS', slidesStart);
const slidesEndCandidates = [legacyPublicationStart, quickStartStart].filter((index) => index > slidesStart);
const slidesEnd = slidesEndCandidates.length ? Math.min(...slidesEndCandidates) : undefined;
const slidesBlock = source.slice(slidesStart, slidesEnd);
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
// Never hard-code that M01-M22 (or any fixed count) must remain forever.
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
if (sourceMissingIds.some((id) => !/^M\d{2}$/.test(id))) fail('guideDeckSource.ts contains a malformed missingCaptureId.');

// 5) Every screenshot referenced by the deck must physically exist, together with AVIF + WebP derivatives.
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

// 6) The isolated Guide service worker must exist and remain syntax-valid.
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
    "url.pathname === '/guide/release.json'",
    "url.pathname.startsWith('/assets/')",
  ]) {
    if (!guideSw.includes(requiredFragment)) {
      fail(`Guide service worker is missing freshness/isolation rule: ${requiredFragment}`);
    }
  }
}

// 7) Live verification must compare canonical Guide content, not branch commit SHA.
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
  if (workflow.includes('LIVE_SHA" = "$EXPECTED_SHA')) {
    fail(`${workflowName} still gates Guide success on an exact branch commit SHA.`);
  }
}

// 8) Missing-capture and screenshot documentation must preserve truth/safety rules.
for (const requiredPhrase of ['אין Demo', 'אין Placeholder', 'אין צילום מומצא']) {
  if (!missing.includes(requiredPhrase)) fail(`GUIDE_MISSING_CAPTURES.md is missing safety rule: ${requiredPhrase}`);
}
for (const staleArchitectureTerm of ['guideButtons.ts', 'ButtonArea', 'QUESTION_SHOTS']) {
  if (manifest.includes(staleArchitectureTerm)) {
    fail(`GUIDE_SCREENSHOTS_MANIFEST.md still documents retired Guide architecture: ${staleArchitectureTerm}`);
  }
}

if (notes.length) for (const note of notes) console.log(`NOTE: ${note}`);
if (errors.length) {
  console.error('\nGuide integrity audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Guide integrity audit passed: ${screenshotRefs.length} screenshot references, ${docMissingSet.size} unresolved canonical capture IDs, guideHash=${guideHash}.`);
