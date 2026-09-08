const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const mapPath = path.join(root, 'public/guide/focus-map.json');
const enginePath = path.join(root, 'public/guide/focus-overlays.js');
const sourcePath = path.join(root, 'src/data/guideDeckSource.ts');
const indexPath = path.join(root, 'index.html');
const swPath = path.join(root, 'public/guide/sw.js');
const screenshotsDir = path.join(root, 'public/guide/screenshots');
const errors = [];

function fail(message) {
  errors.push(message);
}

for (const required of [mapPath, enginePath, sourcePath, indexPath, swPath]) {
  if (!fs.existsSync(required)) fail(`Missing Guide focus file: ${path.relative(root, required)}`);
}

if (errors.length) {
  console.error('\nGuide focus map audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

let focusMap;
try {
  focusMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch (error) {
  fail(`focus-map.json is not valid JSON: ${error.message}`);
  focusMap = {};
}

if (!focusMap || typeof focusMap !== 'object' || Array.isArray(focusMap)) {
  fail('focus-map.json must be a JSON object keyed by screenshot filename.');
  focusMap = {};
}

const source = fs.readFileSync(sourcePath, 'utf8');
const runtimeScreenshotNames = new Set(
  [...source.matchAll(/src:\s*'([^']+\.(?:jpg|jpeg|png|webp|avif))'/g)]
    .map((match) => match[1].replace(/\.[^.]+$/, '.avif'))
);

for (const [filename, box] of Object.entries(focusMap)) {
  if (filename.includes('/') || filename.includes('\\')) {
    fail(`Focus key must be a filename only: ${filename}`);
    continue;
  }
  if (!runtimeScreenshotNames.has(filename)) {
    fail(`Focus entry does not map to a screenshot used by the Guide runtime: ${filename}`);
  }
  if (!fs.existsSync(path.join(screenshotsDir, filename))) {
    fail(`Focus entry points to a missing screenshot: public/guide/screenshots/${filename}`);
  }
  if (!box || typeof box !== 'object' || Array.isArray(box)) {
    fail(`Focus entry must be an object: ${filename}`);
    continue;
  }

  const values = ['x', 'y', 'w', 'h'].map((key) => box[key]);
  if (!values.every((value) => Number.isFinite(value))) {
    fail(`Focus entry requires numeric x/y/w/h: ${filename}`);
    continue;
  }
  if (box.x < 0 || box.y < 0 || box.w <= 0 || box.h <= 0 || box.x + box.w > 100 || box.y + box.h > 100) {
    fail(`Focus entry is outside screenshot percentage bounds: ${filename}`);
  }
  if (typeof box.label !== 'string' || box.label.trim().length < 2) {
    fail(`Focus entry requires a clear label: ${filename}`);
  }
  if (typeof box.evidence !== 'string' || box.evidence.trim().length < 3) {
    fail(`Focus entry requires an evidence reference explaining how the coordinates were verified: ${filename}`);
  }
}

const engine = fs.readFileSync(enginePath, 'utf8');
for (const requiredFragment of [
  "const scriptUrl = document.currentScript?.src || window.location.href",
  "const focusMapUrl = new URL('focus-map.json', scriptUrl).href",
  'fetch(focusMapUrl',
  'Missing/invalid evidence means no overlay',
  'if (!validBox(box)) return',
]) {
  if (!engine.includes(requiredFragment)) fail(`focus-overlays.js is missing base-aware safety rule: ${requiredFragment}`);
}
if (engine.includes("fetch('/guide/focus-map.json'")) {
  fail('focus-overlays.js regressed to a root-only focus-map URL; static always-on hosting would break.');
}
if (/const\s+FOCUS_MAP\s*=/.test(engine)) {
  fail('focus-overlays.js contains a hard-coded focus map; use focus-map.json as the auditable source.');
}

const index = fs.readFileSync(indexPath, 'utf8');
if (!index.includes("focusOverlays.src = withBase('/guide/focus-overlays.js')")) {
  fail('index.html does not load the base-aware focus overlay engine on the Guide route.');
}

const sw = fs.readFileSync(swPath, 'utf8');
for (const shellAsset of ["withBase('/guide/focus-overlays.js')", "withBase('/guide/focus-map.json')"]) {
  if (!sw.includes(shellAsset)) fail(`Guide service worker does not precache base-aware ${shellAsset}.`);
}

if (errors.length) {
  console.error('\nGuide focus map audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Guide focus map audit passed: ${Object.keys(focusMap).length} verified focus overlays.`);
