const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const mainPath = path.join(root, 'src/main.tsx');
const appPath = path.join(root, 'src/App.tsx');
const errors = [];

const main = fs.readFileSync(mainPath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');

function fail(message) {
  errors.push(message);
}

if (/^import\s+App\s+from\s+["']\.\/App\.tsx["']/m.test(main)) {
  fail('src/main.tsx still statically imports App.tsx on the Guide entry path.');
}

if (/^import\s+["']\.\/yaniv-premium-ui\.css["']/m.test(main)) {
  fail('src/main.tsx still statically imports Teacher Hub premium CSS.');
}

for (const required of [
  'const isGuideRoute =',
  'await import("./pages/Guide.tsx")',
  'await import("./App.tsx")',
  'await import("./yaniv-premium-ui.css")',
]) {
  if (!main.includes(required)) fail(`src/main.tsx is missing Guide/Hub entry isolation rule: ${required}`);
}

if (!app.includes('useKeepAlive()')) {
  fail('Expected Teacher Hub keep-alive hook was not found in App.tsx; audit assumptions changed.');
}

if (errors.length) {
  console.error('\nGuide entry isolation audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Guide entry isolation audit passed: /guide can bootstrap without loading Teacher Hub App/session bundle.');
