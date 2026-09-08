const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/data/guideDeckSource.ts'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const coverBlock = source.match(/id:\s*'cover'[\s\S]*?status:\s*'ready'/)?.[0] ?? '';
if (!coverBlock) {
  console.error('Guide public-copy audit failed: cover block was not found.');
  process.exit(1);
}

const forbiddenCoverCopy = [
  'שאלה אחת בכל שקף',
  'צילום אמיתי',
  'צילומים אמיתיים',
  'רצף לחיצות ברור',
  'דמו',
  'demo',
  'placeholder',
];

const errors = [];
for (const phrase of forbiddenCoverCopy) {
  if (coverBlock.toLocaleLowerCase().includes(phrase.toLocaleLowerCase())) {
    errors.push(`Public Guide cover exposes internal/demo copy: ${phrase}`);
  }
}

const forbiddenMetaCopy = [
  'שאלה אחת בכל שקף',
  'צילום אמיתי',
  'צילומים אמיתיים',
  'רצף לחיצות ברור',
];
for (const phrase of forbiddenMetaCopy) {
  if (indexHtml.includes(phrase)) {
    errors.push(`Guide HTML metadata exposes internal design copy: ${phrase}`);
  }
}

if (errors.length) {
  console.error('Guide public-copy audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('GUIDE_PUBLIC_COPY_OK');
