const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const sourcePath = path.join(root, 'src/data/guideDeckSource.ts');
const missingPath = path.join(root, 'docs/GUIDE_MISSING_CAPTURES.md');

const source = fs.readFileSync(sourcePath, 'utf8');
const missingDoc = fs.readFileSync(missingPath, 'utf8');

const slidesStart = source.indexOf('export const GUIDE_SLIDES');
if (slidesStart < 0) {
  console.error('Guide gap report failed: GUIDE_SLIDES was not found.');
  process.exit(1);
}

const slidesEndCandidates = [
  source.indexOf('export const PUBLISHED_GUIDE_SLIDES', slidesStart),
  source.indexOf('export const QUICK_START_SLIDE_IDS', slidesStart),
].filter((index) => index > slidesStart);
const slidesEnd = slidesEndCandidates.length ? Math.min(...slidesEndCandidates) : source.length;
const block = source.slice(slidesStart, slidesEnd);

const slides = [];
const objectRegex = /\n  \{\n    id: '([^']+)',([\s\S]*?)\n  \},/g;
let objectMatch;
while ((objectMatch = objectRegex.exec(block))) {
  const id = objectMatch[1];
  const body = objectMatch[2];
  const title = body.match(/\n    title: '([^']+)'/)?.[1] ?? id;
  const sourceStatus = body.match(/\n    status: '([^']+)'/)?.[1] ?? 'unknown';
  const missingCaptureId = body.match(/\n    missingCaptureId: '(M\d{2})'/)?.[1] ?? null;
  const effectiveStatus = missingCaptureId ? 'needs-capture' : sourceStatus;
  const screenshotCount = [...body.matchAll(/src: '[^']+\.(?:jpg|jpeg|png|webp|avif)'/g)].length;
  const hasLink = /\n    link: \{ href: 'https?:\/\//.test(body);

  slides.push({ id, title, sourceStatus, effectiveStatus, missingCaptureId, screenshotCount, hasLink });
}

if (!slides.length) {
  console.error('Guide gap report failed: no slide objects were parsed.');
  process.exit(1);
}

const published = slides.filter((slide) => slide.effectiveStatus === 'ready');
const needsCapture = slides.filter((slide) => slide.effectiveStatus === 'needs-capture');
const needsFact = slides.filter((slide) => slide.effectiveStatus === 'needs-fact');
const unknown = slides.filter((slide) => !['ready', 'needs-capture', 'needs-fact'].includes(slide.effectiveStatus));
const docMissingIds = [...missingDoc.matchAll(/^##\s+(M\d{2})\b/gm)].map((match) => match[1]);

const captureMap = new Map();
for (const slide of needsCapture) {
  if (!slide.missingCaptureId) continue;
  const ids = captureMap.get(slide.missingCaptureId) ?? [];
  ids.push(slide.id);
  captureMap.set(slide.missingCaptureId, ids);
}

console.log('GUIDE GAP REPORT');
console.log(`Total slides: ${slides.length}`);
console.log(`Publishable now: ${published.length}`);
console.log(`Blocked by real capture evidence: ${needsCapture.length}`);
console.log(`Blocked by missing fact: ${needsFact.length}`);
console.log(`Canonical unresolved capture IDs: ${new Set(docMissingIds).size}`);
console.log(`Unknown status: ${unknown.length}`);
console.log('');

if (captureMap.size) {
  console.log('CAPTURE GAPS');
  for (const [id, slideIds] of [...captureMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`- ${id}: ${slideIds.join(', ')}`);
  }
  console.log('');
}

if (needsFact.length) {
  console.log('FACT GAPS');
  for (const slide of needsFact) console.log(`- ${slide.id}: ${slide.title}`);
  console.log('');
}

const publishedWithoutScreenshots = published.filter((slide) => slide.id !== 'cover' && slide.screenshotCount === 0);
if (publishedWithoutScreenshots.length) {
  console.log('PUBLISHED SLIDES WITHOUT SCREENSHOTS — review against PROJECT_MEMORY requirements');
  for (const slide of publishedWithoutScreenshots) console.log(`- ${slide.id}: ${slide.title}`);
  console.log('');
}

const publishedWithoutLinks = published.filter((slide) => slide.id !== 'cover' && !slide.hasLink);
console.log(`Published slides without an explicit direct link: ${publishedWithoutLinks.length}`);
console.log('This is a review signal, not an automatic failure: some slides have no safe stable direct URL.');
