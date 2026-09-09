#!/usr/bin/env node
// Guide screenshot pipeline.
//
// GUIDE_SCREENSHOTS_MANIFEST.md rule 6 requires every published screenshot to ship as
// source (.jpg/.png) + .webp + .avif. guide-integrity-audit.cjs enforces that both
// derivatives exist for every screenshot the deck references, and guideDeck.ts rewrites
// every runtime src to .avif while Guide.tsx falls back to .webp.
//
// This script regenerates the missing derivatives. It is deliberately NON-DESTRUCTIVE:
// an existing derivative is left untouched unless --force is passed, because every byte
// under public/guide/ feeds computeGuideHash() and therefore the deployed release
// fingerprint that guide-live-smoke.yml verifies.
//
// Usage:
//   node scripts/guide/optimize-screenshots.mjs            # create only what is missing
//   node scripts/guide/optimize-screenshots.mjs --force    # re-encode everything
//   node scripts/guide/optimize-screenshots.mjs --check    # report only, write nothing

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const screenshotsDir = path.join(root, 'public/guide/screenshots');
const guideDir = path.join(root, 'public/guide');

const force = process.argv.includes('--force');
const checkOnly = process.argv.includes('--check');

const MAX_WIDTH = 1200;
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const WEBP_OPTIONS = { quality: 82, effort: 5 };
const AVIF_OPTIONS = { quality: 50, effort: 5 };

const created = [];
const skipped = [];
const missing = [];
const resized = [];

async function buildDerivative(sourcePath, targetPath, format) {
  if (fs.existsSync(targetPath) && !force) {
    skipped.push(path.basename(targetPath));
    return;
  }
  if (checkOnly) {
    missing.push(path.basename(targetPath));
    return;
  }

  const pipeline = sharp(sourcePath);
  const { width } = await pipeline.metadata();
  const work = width && width > MAX_WIDTH ? pipeline.resize({ width: MAX_WIDTH }) : pipeline;
  const encoded = format === 'avif' ? work.avif(AVIF_OPTIONS) : work.webp(WEBP_OPTIONS);

  await encoded.toFile(targetPath);
  created.push(path.basename(targetPath));
}

async function processDirectory(directory, label) {
  if (!fs.existsSync(directory)) return;

  const sources = fs
    .readdirSync(directory)
    .filter((file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort();

  for (const file of sources) {
    const sourcePath = path.join(directory, file);
    const base = file.replace(/\.[^.]+$/, '');

    const { width } = await sharp(sourcePath).metadata();
    if (width && width > MAX_WIDTH) resized.push(`${label}/${file} (${width}px)`);

    await buildDerivative(sourcePath, path.join(directory, `${base}.webp`), 'webp');
    await buildDerivative(sourcePath, path.join(directory, `${base}.avif`), 'avif');
  }
}

// Screenshots only. The cover logo in public/guide/ deliberately ships as .png + .webp:
// Guide.tsx renders it through a <picture> that offers WebP with a PNG fallback and never
// requests AVIF, so generating a logo .avif would add an unreferenced file and move the
// guide content hash for nothing.
await processDirectory(screenshotsDir, 'screenshots');
void guideDir;

console.log(`Guide screenshot pipeline (${checkOnly ? 'check' : force ? 'force' : 'fill-missing'})`);
console.log(`  derivatives already present : ${skipped.length}`);
if (checkOnly) {
  console.log(`  derivatives MISSING         : ${missing.length}`);
  missing.forEach((name) => console.log(`      - ${name}`));
} else {
  console.log(`  derivatives written         : ${created.length}`);
  created.forEach((name) => console.log(`      + ${name}`));
}
if (resized.length) {
  console.log(`  sources wider than ${MAX_WIDTH}px  : ${resized.length}`);
  resized.forEach((name) => console.log(`      ! ${name}`));
}

if (checkOnly && missing.length) {
  console.error('\nMissing derivatives. Run: npm run guide:optimize');
  process.exit(1);
}
