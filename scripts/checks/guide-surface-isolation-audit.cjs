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

const nonScopedRule = css
  .split(/\n(?=[^\s@/])/)
  .filter((chunk) => chunk.includes('{'))
  .filter((chunk) => !chunk.startsWith('@'))
  .filter((chunk) => !chunk.startsWith('html[data-surface="guide"]'))
  .filter((chunk) => !chunk.startsWith('/*'));

if (nonScopedRule.length) {
  fail(`Guide CSS contains selectors outside the Guide surface scope: ${nonScopedRule.slice(0, 3).join(' | ')}`);
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

console.log('Guide surface isolation audit passed.');
