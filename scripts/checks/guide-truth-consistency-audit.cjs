const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const failures = [];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireText(rel, text, expected) {
  if (!text.includes(expected)) failures.push(`${rel}: missing required Guide truth: ${expected}`);
}

function forbidText(rel, text, forbidden) {
  if (text.includes(forbidden)) failures.push(`${rel}: stale Guide truth remains: ${forbidden}`);
}

const memory = read('PROJECT_MEMORY.md');
const publicMemory = read('public/PROJECT_MEMORY.md');
const current = read('STATE/CURRENT.md');
const readme = read('README.md');
const missing = read('docs/GUIDE_MISSING_CAPTURES.md');
const manifest = read('docs/GUIDE_SCREENSHOTS_MANIFEST.md');
const guideSource = read('src/pages/Guide.tsx');
const deckPath = path.join(root, 'src/data/guideDeck.ts');

const guideUrl = 'https://yanivmizrachiy.github.io/www/guide/';
const deckSource = 'src/data/guideDeck.ts';
const coverTitle = 'מדריך למורים במערכת Moodle';
const trainingTitle = 'איך פותחים מרחב למידה במודל?';

requireText('PROJECT_MEMORY.md', memory, guideUrl);
requireText('PROJECT_MEMORY.md', memory, coverTitle);
requireText('PROJECT_MEMORY.md', memory, trainingTitle);
requireText('PROJECT_MEMORY.md', memory, 'כפתור פעולה יחיד `התחל`');
requireText('STATE/CURRENT.md', current, guideUrl);
requireText('STATE/CURRENT.md', current, 'Cover contract: branding is at the top and the cover has exactly one CTA, `התחל`');
requireText('README.md', readme.split('<details>')[0], guideUrl);
requireText('README.md', readme.split('<details>')[0], deckSource);

requireText('docs/GUIDE_MISSING_CAPTURES.md', missing, `מקור השקפים היחיד: \`${deckSource}\``);
requireText('docs/GUIDE_MISSING_CAPTURES.md', missing, 'מסמך תפעולי בלבד');
forbidText('docs/GUIDE_MISSING_CAPTURES.md', missing, 'guideDeckSource.ts');

requireText('docs/GUIDE_SCREENSHOTS_MANIFEST.md', manifest, 'תיעוד נכסים תפעולי');
requireText('docs/GUIDE_SCREENSHOTS_MANIFEST.md', manifest, deckSource);
forbidText('docs/GUIDE_SCREENSHOTS_MANIFEST.md', manifest, 'מניפסט צילומי המדריך — מקור אמת מלא');
forbidText('docs/GUIDE_SCREENSHOTS_MANIFEST.md', manifest, 'GUIDE_BUTTON_BEHAVIOR.md');

if (memory !== publicMemory) {
  failures.push('public/PROJECT_MEMORY.md: deployment mirror differs from canonical PROJECT_MEMORY.md');
}

let deck;
try {
  deck = require(deckPath);
} catch (error) {
  failures.push(`src/data/guideDeck.ts: could not load deck: ${error.message}`);
}

if (deck && Array.isArray(deck.GUIDE_SLIDES)) {
  const deckMissingIds = new Set(deck.GUIDE_SLIDES.map((slide) => slide.missingCaptureId).filter(Boolean));
  const docIds = [...missing.matchAll(/^##\s+(M\d{2})\b/gm)].map((match) => match[1]);
  const docMissingIds = new Set(docIds);

  if (docIds.length !== docMissingIds.size) {
    failures.push('docs/GUIDE_MISSING_CAPTURES.md: duplicate M-ID heading');
  }

  for (const id of deckMissingIds) {
    if (!docMissingIds.has(id)) failures.push(`docs/GUIDE_MISSING_CAPTURES.md: ${id} is required by the deck but undocumented`);
  }
  for (const id of docMissingIds) {
    if (!deckMissingIds.has(id)) failures.push(`docs/GUIDE_MISSING_CAPTURES.md: ${id} is documented as missing but no slide currently waits for it`);
  }
}

const coverStart = guideSource.indexOf('if (slide.cover)');
const coverEnd = guideSource.indexOf('const hasScreenshots', coverStart);
const coverBlock = coverStart >= 0 && coverEnd > coverStart ? guideSource.slice(coverStart, coverEnd) : '';
if (!coverBlock) {
  failures.push('src/pages/Guide.tsx: cover block could not be located');
} else {
  requireText('src/pages/Guide.tsx cover', coverBlock, '              התחל\n');
  forbidText('src/pages/Guide.tsx cover', coverBlock, 'התחלה מהירה');
  forbidText('src/pages/Guide.tsx cover', coverBlock, 'תוכן העניינים');
}

if (failures.length) {
  console.error('GUIDE_TRUTH_CONSISTENCY_AUDIT_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('GUIDE_TRUTH_CONSISTENCY_AUDIT_OK');
