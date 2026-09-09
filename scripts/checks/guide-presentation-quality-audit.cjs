const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const sourcePath = path.join(root, 'src/data/guideDeckSource.ts');
const deckPath = path.join(root, 'src/data/guideDeck.ts');
const guidePath = path.join(root, 'src/pages/Guide.tsx');
const cssPath = path.join(root, 'public/guide-visual-isolation.css');
const screenshotsDir = path.join(root, 'public/guide/screenshots');

const source = fs.readFileSync(sourcePath, 'utf8');
const deck = fs.readFileSync(deckPath, 'utf8');
const guide = fs.readFileSync(guidePath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const errors = [];

function fail(message) {
  errors.push(message);
}

function baseName(filename) {
  return filename.replace(/\.[^.]+$/, '');
}

// 1) The product contract: the presentation begins with the opening-space question,
// never with the old generic cover.
for (const fragment of [
  "export const FIRST_GUIDE_SLIDE_ID = 'open-space-start'",
  "title: 'איך פותחים מרחב למידה במודל?'",
  "'cover'",
]) {
  if (!deck.includes(fragment)) fail(`Canonical opening-flow contract is missing: ${fragment}`);
}

if (!deck.includes("const REPLACED_SOURCE_IDS = new Set([") || !deck.includes("'cover',")) {
  fail('The legacy generic cover is not explicitly removed from the published deck.');
}

// 2) M01 is a real missing capture and must never be disguised as a ready slide.
const m01Slide = /id:\s*'open-space-content',[\s\S]*?status:\s*'needs-capture',[\s\S]*?missingCaptureId:\s*'M01'/m;
if (!m01Slide.test(deck)) {
  fail('The missing content-selection screen M01 must remain an explicit needs-capture blocker.');
}

// 3) Every original real Moodle screenshot in the canonical screenshot directory
// must be referenced by either the source deck or the derived premium deck.
const originalScreenshotFiles = fs
  .readdirSync(screenshotsDir)
  .filter((name) => /\.(?:jpg|jpeg|png)$/i.test(name));

const referencedFiles = [source, deck]
  .flatMap((text) => [...text.matchAll(/src:\s*'([^']+\.(?:jpg|jpeg|png|webp|avif))'/gi)].map((match) => match[1]));
const referencedBases = new Set(referencedFiles.map(baseName));
const uncovered = originalScreenshotFiles.filter((name) => !referencedBases.has(baseName(name)));

for (const filename of uncovered) {
  fail(`Real Moodle screenshot is not represented in the Guide deck: public/guide/screenshots/${filename}`);
}

// 4) Premium interaction must remain presentation-grade but accessible.
for (const fragment of [
  'AnimatePresence',
  'LazyMotion',
  'useReducedMotion',
  'useSpring',
  'guide-shot-card',
  'data-guide-shell="premium-presentation"',
  'slide.link ??',
  'setLightbox',
]) {
  if (!guide.includes(fragment)) fail(`Premium Guide interaction contract is missing: ${fragment}`);
}

for (const fragment of [
  '[data-guide-shell="premium-presentation"]',
  'perspective: 1600px',
  'transform-style: preserve-3d',
  '@media (prefers-reduced-motion: reduce)',
]) {
  if (!css.includes(fragment)) fail(`Guide visual isolation / 3D contract is missing: ${fragment}`);
}

if (errors.length) {
  console.error('\nGuide presentation quality audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Guide presentation quality audit passed: ${originalScreenshotFiles.length} original Moodle screenshots are represented; premium motion/3D/reduced-motion contracts are present.`
);
