const fs = require('node:fs');
const path = require('node:path');
const { computeGuideHash } = require('./guide-content-hash.cjs');

const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'public/guide/release.json');
const commit = process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || 'local';
const branch = process.env.RENDER_GIT_BRANCH || process.env.GITHUB_REF_NAME || 'local';
const guideHash = computeGuideHash();
const generatedAt = new Date().toISOString();

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(
  output,
  `${JSON.stringify({ product: 'moodle-guide', commit, branch, guideHash, generatedAt }, null, 2)}\n`,
  'utf8'
);

console.log(`Guide release marker written for ${commit} (${branch}), guideHash=${guideHash}.`);
