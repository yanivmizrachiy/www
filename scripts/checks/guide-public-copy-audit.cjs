const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/data/guideDeckSource.ts'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const slidesStart = source.indexOf('export const GUIDE_SLIDES');
const coverStart = source.indexOf("id: 'cover'", slidesStart);
const nextSlide = source.indexOf("id: 'quick-start'", coverStart);

if (slidesStart < 0 || coverStart < 0 || nextSlide < 0) {
  console.error('Guide public-copy audit failed: full cover object boundaries were not found.');
  process.exit(1);
}

const coverBlock = source.slice(coverStart, nextSlide);
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
const lowerCover = coverBlock.toLocaleLowerCase();
for (const phrase of forbiddenCoverCopy) {
  if (lowerCover.includes(phrase.toLocaleLowerCase())) {
    errors.push(`Public Guide cover exposes internal/demo copy: ${phrase}`);
  }
}

for (const phrase of ['שאלה אחת בכל שקף', 'צילום אמיתי', 'צילומים אמיתיים', 'רצף לחיצות ברור']) {
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
