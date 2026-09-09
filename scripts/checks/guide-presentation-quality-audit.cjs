const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const sourcePath = path.join(root, 'src/data/guideDeckSource.ts');
const deckPath = path.join(root, 'src/data/guideDeck.ts');
const guidePath = path.join(root, 'src/pages/Guide.tsx');
const hotspotsPath = path.join(root, 'src/data/guideHotspots.ts');
const cssPath = path.join(root, 'public/guide-visual-isolation.css');
const screenshotsDir = path.join(root, 'public/guide/screenshots');

const source = fs.readFileSync(sourcePath, 'utf8');
const deck = fs.readFileSync(deckPath, 'utf8');
const guide = fs.readFileSync(guidePath, 'utf8');
const hotspots = fs.readFileSync(hotspotsPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const errors = [];

function fail(message) {
  errors.push(message);
}

function baseName(filename) {
  return filename.replace(/\.[^.]+$/, '');
}

// 1) Current training-flow contract. A separate presentation cover may precede
// the training, but the training itself begins with the opening-space question.
for (const fragment of [
  "title: 'איך פותחים מרחב למידה במודל?'",
  "id: 'open-space-my-courses'",
]) {
  if (!deck.includes(fragment)) fail(`Canonical opening-flow contract is missing: ${fragment}`);
}

// 2) M01 was resolved on 2026-09-09 from a verified real frame in the official
// Ministry of Education “new wizard” video. It must no longer be blocked as a
// missing capture in the derived Guide deck.
if (!deck.includes("src: '23-wizard-content-ready.jpg'")) {
  fail('The verified M01 content-selection screenshot is missing from the Guide deck.');
}
if (deck.includes("missingCaptureId: 'M01'")) {
  fail('M01 is resolved and must not remain an explicit missing-capture blocker.');
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

// 5) Verified hotspots are data-driven, bounded to the real screenshot and rendered
// in both the presentation card and the full-size lightbox. Empty hotspot data is
// valid; invented coordinates are not.
for (const fragment of [
  "import { getGuideScreenshotHotspots } from '@/data/guideHotspots';",
  'function HotspotLayer',
  '<HotspotLayer src={screenshot.src} />',
  '<HotspotLayer src={lightbox.screenshot.src} />',
]) {
  if (!guide.includes(fragment)) fail(`Verified hotspot rendering contract is missing: ${fragment}`);
}

for (const fragment of [
  'GUIDE_SCREENSHOT_HOTSPOTS',
  'hotspot.x + hotspot.width <= 100',
  'hotspot.y + hotspot.height <= 100',
  '.filter(isValidHotspot)',
]) {
  if (!hotspots.includes(fragment)) fail(`Verified hotspot data-safety contract is missing: ${fragment}`);
}

// 6) Opening-space teaching contract: one action and one screenshot at most per slide.
const openingStartIndex = deck.indexOf('const OPENING_GUIDE_SLIDES: GuideSlide[] = [');
const openingEndIndex = deck.indexOf('const ASSET_COVERAGE_SLIDES: GuideSlide[] = [');
if (openingStartIndex < 0 || openingEndIndex <= openingStartIndex) {
  fail('Opening Guide slide block could not be located.');
} else {
  const opening = deck.slice(openingStartIndex, openingEndIndex);
  const slideChunks = opening.split(/\n  \{\n(?=    id:)/).slice(1);
  for (const chunk of slideChunks) {
    const id = chunk.match(/id:\s*'([^']+)'/)?.[1] ?? 'unknown';
    const stepBody = chunk.match(/steps:\s*\[([\s\S]*?)\]/)?.[1] ?? '';
    const stepCount = [...stepBody.matchAll(/'[^']*'/g)].length;
    const screenshotBody = chunk.match(/screenshots:\s*\[([\s\S]*?)\]/)?.[1] ?? '';
    const screenshotCount = [...screenshotBody.matchAll(/src:\s*'/g)].length;
    if (stepCount > 1) fail(`Opening slide ${id} contains ${stepCount} actions; maximum is one.`);
    if (screenshotCount > 1) fail(`Opening slide ${id} contains ${screenshotCount} screenshots; maximum is one.`);
  }
}

for (const fragment of [
  'הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין',
  'האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים',
]) {
  if (!guide.includes(fragment)) fail(`Guide branding contract is missing: ${fragment}`);
}

if (errors.length) {
  console.error('\nGuide presentation quality audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Guide presentation quality audit passed: ${originalScreenshotFiles.length} original Moodle screenshots are represented; verified M01, premium motion/3D/reduced-motion and hotspot contracts are present.`
);
