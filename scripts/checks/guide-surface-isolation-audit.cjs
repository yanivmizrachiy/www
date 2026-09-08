const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const indexPath = path.join(root, 'index.html');
const cssPath = path.join(root, 'public/guide-visual-isolation.css');
const errors = [];

const index = fs.readFileSync(indexPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

function fail(message) {
  errors.push(message);
}

if (!index.includes("document.documentElement.dataset.surface = 'guide'")) {
  fail('index.html does not mark the Guide route with data-surface="guide".');
}

if (!index.includes("guideStyles.href = '/guide-visual-isolation.css'")) {
  fail('index.html does not load Guide presentation CSS from the Guide-only route branch.');
}

if (/<link[^>]+href=["']\/guide-visual-isolation\.css["']/i.test(index)) {
  fail('Guide isolation CSS is linked globally; it must load only when isGuideRoute is true.');
}

if (!css.includes('html[data-surface="guide"]')) {
  fail('Guide CSS is not scoped to html[data-surface="guide"].');
}

// Validate real selector preludes instead of splitting CSS text by lines.
// This correctly handles nested @media blocks: every actual selector inside them
// must still begin with the Guide surface scope. At-rules themselves are allowed.
function selectorPreludes(text) {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const preludes = [];
  let boundary = -1;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    if (char === '{') {
      const prelude = clean.slice(boundary + 1, i).trim();
      if (prelude && !prelude.startsWith('@')) preludes.push(prelude);
      boundary = i;
    } else if (char === '}') {
      boundary = i;
    }
  }
  return preludes;
}

const nonScopedSelectors = [];
for (const prelude of selectorPreludes(css)) {
  for (const selector of prelude.split(',').map((value) => value.trim()).filter(Boolean)) {
    // Keyframe selectors would be percentages/from/to, but this stylesheet does
    // not define keyframes. If that changes, the audit should be updated deliberately.
    if (!selector.startsWith('html[data-surface="guide"]')) {
      nonScopedSelectors.push(selector);
    }
  }
}

if (nonScopedSelectors.length) {
  fail(`Guide CSS contains selectors outside the Guide surface scope: ${nonScopedSelectors.slice(0, 5).join(' | ')}`);
}

for (const requiredAccessibilityRule of [
  ':focus-visible',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)',
]) {
  if (!css.includes(requiredAccessibilityRule)) {
    fail(`Guide CSS is missing accessibility rule: ${requiredAccessibilityRule}`);
  }
}

if (errors.length) {
  console.error('\nGuide surface isolation audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Guide surface isolation audit passed: ${selectorPreludes(css).length} scoped rule groups checked.`);
