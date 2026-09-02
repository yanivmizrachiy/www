const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const HASH_INPUTS = [
  'index.html',
  'public/guide-visual-isolation.css',
  'public/guide',
  'src/data/guideDeck.ts',
  'src/data/guideDeckSource.ts',
  'src/pages/Guide.tsx',
];

function collectFiles(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return [];

  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return [relativePath.replaceAll('\\', '/')];

  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relativePath, entry.name).replaceAll('\\', '/');
    return collectFiles(child);
  });
}

function computeGuideHash() {
  const files = HASH_INPUTS
    .flatMap(collectFiles)
    .filter((file) => file !== 'public/guide/release.json')
    .sort();

  const hash = crypto.createHash('sha256');
  for (const file of files) {
    hash.update(file);
    hash.update('\0');
    hash.update(fs.readFileSync(path.join(root, file)));
    hash.update('\0');
  }

  return hash.digest('hex');
}

if (require.main === module) {
  process.stdout.write(`${computeGuideHash()}\n`);
}

module.exports = { computeGuideHash, HASH_INPUTS };
