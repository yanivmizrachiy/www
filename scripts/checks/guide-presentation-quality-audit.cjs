const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const deckPath = path.join(root, 'src/data/guideDeck.ts');
const guidePath = path.join(root, 'src/pages/Guide.tsx');
const hotspotsPath = path.join(root, 'src/data/guideHotspots.ts');
const cssPath = path.join(root, 'public/guide-visual-isolation.css');
const screenshotsDir = path.join(root, 'public/guide/screenshots');

const deck = fs.readFileSync(deckPath, 'utf8');
const DECK = require(deckPath);
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

// 2) A missing capture is resolved by a committed asset, never by an assertion.
// Whether M01 counts as resolved is decided by the file on disk, so this gate can
// never again certify a screenshot that the browser cannot load.
const m01Slide = DECK.GUIDE_SLIDES.find((slide) => slide.id === 'open-space-content');
if (!m01Slide) {
  fail('The M01 content-selection slide (open-space-content) is missing from the Guide deck.');
} else {
  const m01Capture = (m01Slide.screenshots ?? [])[0];
  const m01Exists = Boolean(m01Capture) && fs.existsSync(path.join(screenshotsDir, m01Capture.src));
  if (m01Exists && m01Slide.missingCaptureId === 'M01') {
    fail(`M01 is resolved on disk (${m01Capture.src}); remove its missingCaptureId so the slide can publish.`);
  }
  if (!m01Exists && m01Slide.missingCaptureId !== 'M01') {
    fail('M01 has no committed screenshot; the slide must carry missingCaptureId M01 so it stays withheld.');
  }
  if (!m01Exists && DECK.PUBLISHED_GUIDE_SLIDES.some((slide) => slide.id === 'open-space-content')) {
    fail('The M01 slide is published while its screenshot does not exist.');
  }
}

// 3) Every original real Moodle screenshot in the canonical screenshot directory
// must be represented somewhere in the deck.
const originalScreenshotFiles = fs
  .readdirSync(screenshotsDir)
  .filter((name) => /\.(?:jpg|jpeg|png)$/i.test(name));

const referencedBases = new Set(
  DECK.GUIDE_SLIDES.flatMap((slide) => (slide.screenshots ?? []).map((shot) => baseName(shot.src)))
);
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
  // The lightbox renders the capture through LightboxImage, which owns both the
  // hotspot overlay and the honest "capture did not load" fallback.
  'function LightboxImage(',
  '<LightboxImage',
  'src={lightbox.screenshot.src}',
  'onError={() => setFailed(true)}',
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
// Evaluated on the real deck, so renaming or reordering an authoring array cannot
// silently switch this rule off.
const openingSlides = DECK.GUIDE_SLIDES.filter(
  (slide) => slide.section === 'opening' || slide.section === 'wizard-new'
);
if (!openingSlides.length) {
  fail('No opening-space slides found in the Guide deck.');
}
for (const slide of openingSlides) {
  const stepCount = (slide.steps ?? []).length;
  const screenshotCount = (slide.screenshots ?? []).length;
  if (stepCount > 1) fail(`Opening slide ${slide.id} contains ${stepCount} actions; maximum is one.`);
  if (screenshotCount > 1) fail(`Opening slide ${slide.id} contains ${screenshotCount} screenshots; maximum is one.`);
}

for (const fragment of [
  'הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין',
  'האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים',
]) {
  if (!guide.includes(fragment)) fail(`Guide branding contract is missing: ${fragment}`);
}

// 7) Cover CTA contract: the cover is source-authored, has one visible action only,
// and must never rely on DOM-position CSS to hide or relabel duplicate buttons.
const coverStart = guide.indexOf('if (slide.cover) {');
const coverEnd = guide.indexOf('const hasScreenshots = Boolean(slide.screenshots?.length);', coverStart);
const coverSource = coverStart >= 0 && coverEnd > coverStart ? guide.slice(coverStart, coverEnd) : '';
const coverButtonCount = (coverSource.match(/<Button\b/g) ?? []).length;
if (!coverSource) fail('Guide cover source block could not be located.');
if (coverButtonCount !== 1) fail(`Guide cover must contain exactly one Button; found ${coverButtonCount}.`);
if (!coverSource.includes('              התחל\n')) fail('Guide cover CTA must be labeled exactly התחל.');
for (const forbidden of ['התחלה מהירה', 'תוכן העניינים']) {
  if (coverSource.includes(forbidden)) fail(`Guide cover contains forbidden legacy action: ${forbidden}`);
}
if (css.includes('.from-slate-950.via-blue-950.to-slate-900.text-white')) {
  fail('Guide cover must not rely on brittle DOM-position CSS overrides.');
}
const coverBrandingIndex = coverSource.indexOf('הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין');
const coverEyebrowIndex = coverSource.indexOf('{slide.eyebrow}');
if (coverBrandingIndex < 0 || coverEyebrowIndex < 0 || coverBrandingIndex > coverEyebrowIndex) {
  fail('Guide cover branding must be source-authored above the main cover content.');
}

if (errors.length) {
  console.error('\nGuide presentation quality audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Guide presentation quality audit passed: ${originalScreenshotFiles.length} original Moodle screenshots are represented; ` +
    `${DECK.PUBLISHED_GUIDE_SLIDES.length}/${DECK.GUIDE_SLIDES.length} slides published; ` +
    'premium motion/3D/reduced-motion and hotspot contracts are present.'
);
