const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const sourcePath = path.join(root, 'src/data/guideDeckSource.ts');
const deckPath = path.join(root, 'src/data/guideDeck.ts');
const missingPath = path.join(root, 'docs/GUIDE_MISSING_CAPTURES.md');
const screenshotsDir = path.join(root, 'public/guide/screenshots');

const errors = [];
const notes = [];

function fail(message) {
  errors.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
}

const source = fs.readFileSync(sourcePath, 'utf8');
const deck = fs.readFileSync(deckPath, 'utf8');
const missing = fs.readFileSync(missingPath, 'utf8');

// 1) There must be exactly one application-facing publication gate.
// Use an allow-list: only slides explicitly marked ready can be public.
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
  notes.push('guideDeckSource.ts still contains a legacy publication export; it is guarded by the direct-import rule and is not application-facing.');
}

// 2) Every slide heading is a question, except the cover.
const slidesStart = source.indexOf('export const GUIDE_SLIDES');
const slidesEnd = source.indexOf('export const PUBLISHED_GUIDE_SLIDES', slidesStart);
const slidesBlock = source.slice(slidesStart, slidesEnd > slidesStart ? slidesEnd : undefined);
const titleRegex = /title:\s*'([^']+)'/g;
let titleMatch;
while ((titleMatch = titleRegex.exec(slidesBlock))) {
  const title = titleMatch[1].trim();
  if (title === 'מדריך למורים במערכת Moodle') continue;
  if (!title.endsWith('?')) fail(`Slide title is not a question: ${title}`);
}

// Surface source-status debt without weakening the publication gate.
const readyWithMissingIds = [
  ...slidesBlock.matchAll(/status:\s*'ready',\s*\n\s*missingCaptureId:\s*'(M\d{2})'/g),
].map((match) => match[1]);
if (readyWithMissingIds.length) {
  notes.push(`Source status cleanup still needed for: ${readyWithMissingIds.join(', ')}. These slides remain withheld because missingCaptureId is authoritative.`);
}

// 3) Missing-capture IDs in source and docs must stay synchronized.
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

const expectedIds = Array.from({ length: 22 }, (_, index) => `M${String(index + 1).padStart(2, '0')}`);
for (const id of expectedIds) {
  if (!docMissingSet.has(id)) fail(`Expected missing-capture item ${id} is absent from the canonical missing-capture list.`);
}

// 4) Every screenshot referenced by the deck must physically exist.
const screenshotRefs = [...source.matchAll(/src:\s*'([^']+\.(?:jpg|jpeg|png|webp|avif))'/g)].map((match) => match[1]);
for (const screenshot of new Set(screenshotRefs)) {
  if (screenshot.includes('/') || screenshot.includes('\\')) {
    fail(`Screenshot reference must be a filename only: ${screenshot}`);
    continue;
  }
  if (!fs.existsSync(path.join(screenshotsDir, screenshot))) {
    fail(`Referenced screenshot does not exist: public/guide/screenshots/${screenshot}`);
  }
}

// 5) The canonical missing-capture document must explicitly forbid fake/demo captures.
for (const requiredPhrase of ['אין Demo', 'אין Placeholder', 'אין צילום מומצא']) {
  if (!missing.includes(requiredPhrase)) fail(`GUIDE_MISSING_CAPTURES.md is missing safety rule: ${requiredPhrase}`);
}

if (notes.length) {
  for (const note of notes) console.log(`NOTE: ${note}`);
}

if (errors.length) {
  console.error('\nGuide integrity audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Guide integrity audit passed: ${screenshotRefs.length} screenshot references, ${docMissingSet.size} canonical missing-capture IDs.`);
