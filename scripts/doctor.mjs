#!/usr/bin/env node
// doctor — אבחון בריאות הפרויקט. לא מדפיס ערכי env, רק אם הם מוגדרים (boolean).
// שימוש: npm run doctor
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ok = (b) => (b ? 'OK ' : 'MISSING');
let problems = 0;
const line = (label, good) => {
  if (!good) problems++;
  console.log(`  [${ok(good)}] ${label}`);
};

// env from process + optional .env (values never printed)
const env = { ...process.env };
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const l of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const s = l.trim();
    if (!s || s.startsWith('#')) continue;
    const i = s.indexOf('=');
    if (i > 0) env[s.slice(0, i).trim()] ??= s.slice(i + 1).trim();
  }
}
const has = (k) => Boolean(env[k] && env[k].trim());

console.log('== סביבה ==');
console.log(`  node ${process.version}`);

console.log('== משתני env (מוגדרים? — ערכים לא מודפסים) ==');
line('VITE_SUPABASE_URL', has('VITE_SUPABASE_URL'));
line('VITE_SUPABASE_PUBLISHABLE_KEY', has('VITE_SUPABASE_PUBLISHABLE_KEY'));
line('APP_BASE_URL', has('APP_BASE_URL'));
line('LTI11_KEY', has('LTI11_KEY'));
line('LTI11_SECRET', has('LTI11_SECRET'));

console.log('== קבצים מרכזיים ==');
line('src/server.js', fs.existsSync(path.join(ROOT, 'src/server.js')));
line('dist/index.html (build קיים)', fs.existsSync(path.join(ROOT, 'dist/index.html')));
line('supabase/migrations/20260708_admin_users.sql',
  fs.existsSync(path.join(ROOT, 'supabase/migrations/20260708_admin_users.sql')));
line('public/guide/screenshots (צילומי מדריך)',
  fs.existsSync(path.join(ROOT, 'public/guide/screenshots')));

console.log('== אבטחה ==');
line('אין SUPABASE_SERVICE_ROLE_KEY בקוד client (src/)',
  !fs.readFileSync(path.join(ROOT, 'src/integrations/supabase/client.ts'), 'utf8')
    .includes('SERVICE_ROLE'));

console.log('');
if (problems === 0) {
  console.log('doctor: הכל תקין ✓');
} else {
  console.log(`doctor: ${problems} פריטים חסרים/דורשים הגדרה (ראו למעלה).`);
  console.log('הערה: env חסר מקומית זה תקין — הוא מוגדר ב-Render. ראו docs/ADMIN_SETUP.md.');
}
