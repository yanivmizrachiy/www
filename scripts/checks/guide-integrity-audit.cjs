const fs = require('node:fs');
const path = require('node:path');
const { computeGuideHash } = require('../maintenance/guide-content-hash.cjs');

const root = path.resolve(__dirname, '../..');
const deckPath = path.join(root, 'src/data/guideDeck.ts');
const missingPath = path.join(root, 'docs/GUIDE_MISSING_CAPTURES.md');
const screenshotsDir = path.join(root, 'public/guide/screenshots');
const guideSwPath = path.join(root, 'public/guide/sw.js');
const viteConfigPath = path.join(root, 'vite.config.ts');
const liveSmokePath = path.join(root, '.github/workflows/guide-live-smoke.yml');
const renderRecoveryPath = path.join(root, '.github/workflows/render-deploy-recovery.yml');
const staticGuideWorkflowPath = path.join(root, '.github/workflows/guide-static-always-on.yml');

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

const deck = fs.readFileSync(deckPath, 'utf8');
const missing = fs.readFileSync(missingPath, 'utf8');

// The deck is audited as the application actually sees it. Node's native TypeScript
// type-stripping loads the real module, so every slide is checked no matter how it was
// authored. The previous text-only audit scanned one file and silently skipped the rest.
let DECK;
try {
  DECK = require(deckPath);
} catch (error) {
  console.error(`Guide integrity audit failed: could not load ${path.relative(root, deckPath)}: ${error.message}`);
  process.exit(1);
}
const {
  GUIDE_SECTIONS,
  GUIDE_SLIDES,
  PUBLISHED_GUIDE_SLIDES,
  QUICK_START_SLIDE_IDS,
  FIRST_GUIDE_SLIDE_ID,
  FIRST_TRAINING_SLIDE_ID,
} = DECK;
for (const [name, value] of Object.entries({ GUIDE_SECTIONS, GUIDE_SLIDES, PUBLISHED_GUIDE_SLIDES, QUICK_START_SLIDE_IDS })) {
  if (!Array.isArray(value)) fail(`guideDeck.ts must export an array named ${name}.`);
}
if (errors.length === 0) {
  if (!GUIDE_SLIDES.length) fail('guideDeck.ts exports an empty GUIDE_SLIDES array.');
  if (!PUBLISHED_GUIDE_SLIDES.length) fail('guideDeck.ts publishes no slides at all.');
}

for (const requiredFragment of ["slide.status === 'ready'", '!slide.missingCaptureId']) {
  if (!deck.includes(requiredFragment)) fail(`guideDeck.ts publication gate is missing: ${requiredFragment}`);
}
for (const forbiddenFragment of ["slide.status !== 'needs-capture'", "slide.status !== 'needs-fact'"]) {
  if (deck.includes(forbiddenFragment)) fail(`guideDeck.ts uses a deny-list publication rule instead of explicit ready status: ${forbiddenFragment}`);
}
for (const requiredFragment of ["slide.missingCaptureId && slide.status === 'ready'", "'needs-capture' as const"]) {
  if (!deck.includes(requiredFragment)) fail(`guideDeck.ts is missing defensive status normalization: ${requiredFragment}`);
}
for (const requiredFragment of ['toModernScreenshotFilename', "return src.replace(/\\.[^.]+$/, '.avif')", 'src: toModernScreenshotFilename(screenshot.src)']) {
  if (!deck.includes(requiredFragment)) fail(`guideDeck.ts is missing AVIF screenshot mapping: ${requiredFragment}`);
}

// Single source of truth: exactly one authored deck module, and nothing may bypass it.
const dataDir = path.join(root, 'src/data');
for (const entry of fs.readdirSync(dataDir)) {
  if (/^guideDeck.*\.ts$/.test(entry) && entry !== 'guideDeck.ts') {
    fail(`A second guide deck module exists: src/data/${entry}. Every slide must be authored in src/data/guideDeck.ts.`);
  }
}
const srcFiles = walk(path.join(root, 'src')).filter((file) => /\.[cm]?[jt]sx?$/.test(file));
for (const file of srcFiles) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'src/data/guideDeck.ts') continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('guideDeckSource')) fail(`${relative} references the removed guideDeckSource module; author slides in src/data/guideDeck.ts.`);
}

// Structural invariants, evaluated against the real merged deck.
const slideIds = GUIDE_SLIDES.map((slide) => slide.id);
for (const id of new Set(slideIds)) {
  if (slideIds.filter((candidate) => candidate === id).length > 1) fail(`Duplicate slide id in the deck: ${id}`);
}
const sectionIds = new Set(GUIDE_SECTIONS.map((section) => section.id));
for (const slide of GUIDE_SLIDES) {
  if (!slide.id) fail('A slide is missing an id.');
  if (!sectionIds.has(slide.section)) fail(`Slide ${slide.id} belongs to unknown section: ${slide.section}`);
  if (!slide.title) fail(`Slide ${slide.id} has no title.`);
}
// A section with nothing published is dead data rather than a teacher-visible bug:
// Guide.tsx only uses GUIDE_SECTIONS to label the current slide, never to list sections.
for (const section of GUIDE_SECTIONS) {
  if (!PUBLISHED_GUIDE_SLIDES.some((slide) => slide.section === section.id)) {
    notes.push(`Section "${section.id}" currently has no published slide (all of its slides await a real capture).`);
  }
}
if (!PUBLISHED_GUIDE_SLIDES.some((slide) => slide.id === FIRST_GUIDE_SLIDE_ID)) {
  fail(`FIRST_GUIDE_SLIDE_ID "${FIRST_GUIDE_SLIDE_ID}" is not a published slide.`);
}
const publishedIds = new Set(PUBLISHED_GUIDE_SLIDES.map((slide) => slide.id));
for (const id of QUICK_START_SLIDE_IDS) {
  if (!publishedIds.has(id)) fail(`Quick-start slide ${id} is not published.`);
}

// Opening order, exactly as PROJECT_MEMORY section 4.1 defines it:
// slide 1 is the cover, slide 2 opens the training, and Quick Start skips the cover.
const COVER_TITLE = 'מדריך למורים במערכת Moodle';
const TRAINING_TITLE = 'איך פותחים מרחב למידה במודל?';
const firstPublished = PUBLISHED_GUIDE_SLIDES[0];
const secondPublished = PUBLISHED_GUIDE_SLIDES[1];
if (!firstPublished || firstPublished.id !== FIRST_GUIDE_SLIDE_ID) {
  fail(`The first published slide must be ${FIRST_GUIDE_SLIDE_ID}, found ${firstPublished ? firstPublished.id : 'nothing'}.`);
}
if (!firstPublished || !firstPublished.cover) {
  fail('The first published slide must be the presentation cover (cover: true).');
}
if (firstPublished && firstPublished.title !== COVER_TITLE) {
  fail(`The cover title must be "${COVER_TITLE}", found "${firstPublished.title}".`);
}
if (GUIDE_SLIDES.filter((slide) => slide.cover).length !== 1) {
  fail('The deck must define exactly one cover slide.');
}
if (!FIRST_TRAINING_SLIDE_ID) {
  fail('guideDeck.ts must export FIRST_TRAINING_SLIDE_ID so Quick Start can skip the cover.');
} else {
  if (FIRST_TRAINING_SLIDE_ID === FIRST_GUIDE_SLIDE_ID) {
    fail('FIRST_TRAINING_SLIDE_ID must differ from FIRST_GUIDE_SLIDE_ID; the training may not start on the cover.');
  }
  if (!secondPublished || secondPublished.id !== FIRST_TRAINING_SLIDE_ID) {
    fail(`The second published slide must be ${FIRST_TRAINING_SLIDE_ID}, found ${secondPublished ? secondPublished.id : 'nothing'}.`);
  }
  if (secondPublished && secondPublished.title !== TRAINING_TITLE) {
    fail(`The training must open with "${TRAINING_TITLE}", found "${secondPublished.title}".`);
  }
  if (QUICK_START_SLIDE_IDS[0] !== FIRST_TRAINING_SLIDE_ID) {
    fail(`Quick Start must begin at ${FIRST_TRAINING_SLIDE_ID}, found ${QUICK_START_SLIDE_IDS[0]}.`);
  }
}

// The published copy of the source of truth may never drift from the tracked one.
const memoryPath = path.join(root, 'PROJECT_MEMORY.md');
const publicMemoryPath = path.join(root, 'public/PROJECT_MEMORY.md');
if (!fs.existsSync(publicMemoryPath)) {
  fail('public/PROJECT_MEMORY.md is missing; the Guide ships the source of truth alongside the deck.');
} else if (fs.readFileSync(memoryPath, 'utf8') !== fs.readFileSync(publicMemoryPath, 'utf8')) {
  fail('PROJECT_MEMORY.md and public/PROJECT_MEMORY.md differ; re-copy the tracked file over the published one.');
}
const memory = fs.readFileSync(memoryPath, 'utf8');
for (const requiredPhrase of [COVER_TITLE, TRAINING_TITLE]) {
  if (!memory.includes(requiredPhrase)) fail(`PROJECT_MEMORY.md no longer states the opening contract: ${requiredPhrase}`);
}

// Every published slide asks a question, so the deck stays a guide and not a brochure.
for (const slide of PUBLISHED_GUIDE_SLIDES) {
  const title = String(slide.title).trim();
  if (title === 'מדריך למורים במערכת Moodle') continue;
  if (!title.endsWith('?')) fail(`Slide title is not a question (${slide.id}): ${title}`);
}

// Missing-capture bookkeeping, checked across the whole deck.
const deckMissingIds = GUIDE_SLIDES.map((slide) => slide.missingCaptureId).filter(Boolean);
const docMissingIds = [...missing.matchAll(/^##\s+(M\d{2})\b/gm)].map((match) => match[1]);
const deckMissingSet = new Set(deckMissingIds);
const docMissingSet = new Set(docMissingIds);
for (const id of deckMissingSet) if (!docMissingSet.has(id)) fail(`${id} is referenced by guideDeck.ts but missing from GUIDE_MISSING_CAPTURES.md.`);
// The strict direction is deck -> doc: a slide may never wait on an undocumented capture.
// The reverse is bookkeeping, so a documented gap whose slide was retired is only reported.
for (const id of docMissingSet) if (!deckMissingSet.has(id)) notes.push(`${id} is documented in GUIDE_MISSING_CAPTURES.md but no slide references it; retire the entry once the gap is genuinely gone.`);
if (docMissingIds.length !== docMissingSet.size) fail('GUIDE_MISSING_CAPTURES.md contains duplicate M-IDs.');
for (const slide of PUBLISHED_GUIDE_SLIDES) {
  if (slide.missingCaptureId) fail(`Slide ${slide.id} is published while still carrying missingCaptureId ${slide.missingCaptureId}.`);
}

// Screenshot truth: every capture a published slide points at must really exist on disk.
const screenshotRefs = [];
for (const slide of GUIDE_SLIDES) {
  for (const screenshot of slide.screenshots ?? []) {
    screenshotRefs.push(screenshot.src);
    if (!screenshot.caption || !String(screenshot.caption).trim()) fail(`Screenshot on slide ${slide.id} has an empty caption.`);
    if (screenshot.src.includes('/') || screenshot.src.includes('\\')) {
      fail(`Screenshot reference must be a filename only (${slide.id}): ${screenshot.src}`);
      continue;
    }
    if (!publishedIds.has(slide.id)) continue;
    if (!fs.existsSync(path.join(screenshotsDir, screenshot.src))) {
      fail(`Published slide ${slide.id} references a screenshot that does not exist: public/guide/screenshots/${screenshot.src}`);
      continue;
    }
    const base = screenshot.src.replace(/\.[^.]+$/, '');
    for (const extension of ['avif', 'webp']) {
      const derivative = `${base}.${extension}`;
      if (!fs.existsSync(path.join(screenshotsDir, derivative))) {
        fail(`Guide screenshot derivative is missing: public/guide/screenshots/${derivative}`);
      }
    }
    // Keep a lossless original next to the modern derivatives so the capture can be re-encoded.
    const hasOriginal = ['jpg', 'jpeg', 'png'].some((extension) =>
      fs.existsSync(path.join(screenshotsDir, `${base}.${extension}`))
    );
    if (!hasOriginal) fail(`Guide screenshot has no jpg/png original: public/guide/screenshots/${base}.*`);
  }
}

if (!fs.existsSync(guideSwPath)) {
  fail('Guide service worker is missing: public/guide/sw.js');
} else {
  const guideSw = fs.readFileSync(guideSwPath, 'utf8');
  try { new Function(guideSw); } catch (error) { fail(`Guide service worker has invalid JavaScript: ${error.message}`); }
  for (const requiredFragment of ["CACHE_PREFIX = 'moodle-guide-'", 'NAVIGATION_FRESHNESS_MS = 1200', 'Promise.race([', 'event.waitUntil(networkPromise)', 'self.registration.scope', "scopePath.endsWith('/guide')", "`${scopePath}/release.json`", "withBase('/assets/')"]) {
    if (!guideSw.includes(requiredFragment)) fail(`Guide service worker is missing base-aware freshness/isolation rule: ${requiredFragment}`);
  }
  for (const forbiddenFragment of ["url.pathname === '/guide/release.json'", "url.pathname.startsWith('/assets/')"]) {
    if (guideSw.includes(forbiddenFragment)) fail(`Guide service worker regressed to a Render/root-only path: ${forbiddenFragment}`);
  }
}

// 6) Build the Guide statically and publish the generated /guide subtree through
// a dedicated unprotected deployment branch. main stays protected; generated
// binaries are merged only after CI instead of being pushed directly to main.
if (!fs.existsSync(staticGuideWorkflowPath)) {
  fail('Missing .github/workflows/guide-static-always-on.yml required by the Guide always-on rule.');
} else {
  const staticWorkflow = fs.readFileSync(staticGuideWorkflowPath, 'utf8');
  for (const requiredFragment of [
    'Guide Static Always-On',
    'Publish generated Guide to deployment branch',
    'GUIDE_DEPLOY_BRANCH: deploy/guide-static',
    'git push --force origin HEAD:"${GUIDE_DEPLOY_BRANCH}"',
    "github.event_name == 'push' && github.ref == 'refs/heads/main'",
  ]) {
    if (!staticWorkflow.includes(requiredFragment)) fail(`Static Guide workflow is missing protected deployment-branch rule: ${requiredFragment}`);
  }
  for (const forbiddenFragment of ['git push origin HEAD:main', 'actions/deploy-pages@', 'actions/upload-pages-artifact@']) {
    if (staticWorkflow.includes(forbiddenFragment)) fail(`Static Guide workflow must not bypass protected main or replace the whole Pages site: ${forbiddenFragment}`);
  }
}

const guideHash = computeGuideHash();
if (!/^[a-f0-9]{64}$/.test(guideHash)) fail(`Guide content fingerprint is invalid: ${guideHash}`);
const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
for (const requiredFragment of ['guide-content-hash.cjs', 'const guideHash = currentGuideHash()', 'guideHash, generatedAt']) {
  if (!viteConfig.includes(requiredFragment)) fail(`vite.config.ts is missing Guide release fingerprint wiring: ${requiredFragment}`);
}
for (const [workflowName, workflowPath] of [['Guide Live Smoke', liveSmokePath], ['Render Deploy Recovery', renderRecoveryPath]]) {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const requiredFragment of ['EXPECTED_GUIDE_HASH', 'guideHash', 'guide-content-hash.cjs']) {
    if (!workflow.includes(requiredFragment)) fail(`${workflowName} is missing content-fingerprint verification: ${requiredFragment}`);
  }
  if (workflow.includes('LIVE_SHA" = "$EXPECTED_SHA')) fail(`${workflowName} still gates Guide success on an exact branch commit SHA.`);
}

for (const requiredPhrase of ['אין Demo', 'אין Placeholder', 'אין צילום מומצא']) {
  if (!missing.includes(requiredPhrase)) fail(`GUIDE_MISSING_CAPTURES.md is missing safety rule: ${requiredPhrase}`);
}
if (notes.length) for (const note of notes) console.log(`NOTE: ${note}`);
if (errors.length) {
  console.error('\nGuide integrity audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  `Guide integrity audit passed: ${GUIDE_SLIDES.length} slides (${PUBLISHED_GUIDE_SLIDES.length} published), ` +
    `${new Set(screenshotRefs).size} screenshot references, ${docMissingSet.size} canonical missing-capture IDs, guideHash=${guideHash}.`
);
