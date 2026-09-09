// Guide asset integrity: prove a screenshot is a real picture, not just a present file.
//
// PR #293 offered a replacement 02-my-courses-home.avif that existed, returned 200 and
// passed every "does the file exist" check. Its header parsed and the browser reported
// naturalWidth 1867, yet it painted nothing: drawn to a canvas it produced 1867x901 of
// zero-alpha pixels, i.e. it never decoded into a visible image. Existence is not
// evidence, so this audit reads the actual image headers.
//
// No new dependency: every format below is parsed from its own container bytes with
// node:fs alone. ImageMagick would decode more, but it is not guaranteed on a Windows
// dev machine the way it is on ubuntu-latest, and a gate that only really runs in CI is
// a gate nobody trusts locally.
//
// What it proves:
//   1. every derivative has the same pixel dimensions as its source capture,
//   2. a derivative of an opaque source does not smuggle in an alpha channel,
//   3. no file is so small for its pixel count that it cannot hold a screenshot.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const deckPath = path.join(root, 'src/data/guideDeck.ts');
const screenshotsDir = path.join(root, 'public/guide/screenshots');

const errors = [];
const notes = [];
const fail = (message) => errors.push(message);

// A real UI screenshot carries text and chrome and never compresses this far.
// Calibrated against the 64 derivatives actually in this repo:
//   AVIF  min 11664, p10 16475, median 30470 bytes per megapixel
//   WebP  min 16683, p10 23011, median 40989
// The unusable file from #293 sat at 4459. 6000 leaves a 2.6x margin above that file
// and a 1.9x margin below the leanest genuine capture (24-wizard-step4.avif), so it
// separates the two populations without crowding either.
const MIN_BYTES_PER_MEGAPIXEL = 6000;

function readUInt32BE(buffer, offset) {
  return buffer.readUInt32BE(offset);
}

/** JPEG: walk the marker chain to the frame header. Baseline JPEG has no alpha. */
function readJpeg(buffer) {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    // SOF0..SOF15, excluding DHT (c4), JPGA (c8) and DAC (cc)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5), alpha: false };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    offset += 2 + buffer.readUInt16BE(offset + 2);
  }
  return null;
}

/** PNG: IHDR is always the first chunk. Colour types 4 and 6 carry alpha. */
function readPng(buffer) {
  if (buffer.length < 26) return null;
  const colourType = buffer[25];
  return {
    width: readUInt32BE(buffer, 16),
    height: readUInt32BE(buffer, 20),
    alpha: colourType === 4 || colourType === 6,
  };
}

/** WebP: VP8X carries an alpha flag, VP8 is always opaque, VP8L keeps its flag in bit 28. */
function readWebp(buffer) {
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
      alpha: Boolean(buffer[20] & 0x10),
    };
  }
  if (chunk === 'VP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff, alpha: false };
  }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
      alpha: Boolean((buffer.readUInt32LE(24) >> 4) & 0x1),
    };
  }
  return null;
}

/**
 * AVIF is ISOBMFF. `ispe` holds the pixel dimensions of the primary item; `auxC`
 * marks an auxiliary image, which for AVIF in practice means a separate alpha plane.
 */
function readAvif(buffer) {
  let width = null;
  let height = null;
  let alpha = false;

  for (let i = 0; i + 12 <= buffer.length; i += 1) {
    const type = buffer.toString('ascii', i, i + 4);
    if (type === 'ispe' && width === null) {
      width = readUInt32BE(buffer, i + 8);
      height = readUInt32BE(buffer, i + 12);
    } else if (type === 'auxC') {
      alpha = true;
    }
  }

  if (width === null || height === null) return null;
  return { width, height, alpha };
}

function readImage(file) {
  const buffer = fs.readFileSync(file);
  const extension = path.extname(file).toLowerCase();
  let info = null;

  if (extension === '.jpg' || extension === '.jpeg') info = readJpeg(buffer);
  else if (extension === '.png') info = readPng(buffer);
  else if (extension === '.webp') info = readWebp(buffer);
  else if (extension === '.avif') info = readAvif(buffer);

  if (!info || !info.width || !info.height) return null;
  return { ...info, bytes: buffer.length };
}

let DECK;
try {
  DECK = require(deckPath);
} catch (error) {
  console.error(`Guide asset integrity audit failed: could not load the deck: ${error.message}`);
  process.exit(1);
}

const published = DECK.PUBLISHED_GUIDE_SLIDES ?? [];
const bases = new Set();
for (const slide of published) {
  for (const screenshot of slide.screenshots ?? []) {
    bases.add(screenshot.src.replace(/\.[^.]+$/, ''));
  }
}

if (!bases.size) fail('No published slide references any screenshot.');

let checked = 0;
for (const base of [...bases].sort()) {
  const present = ['jpg', 'jpeg', 'png', 'avif', 'webp']
    .map((extension) => ({ extension, file: path.join(screenshotsDir, `${base}.${extension}`) }))
    .filter((candidate) => fs.existsSync(candidate.file));

  const source = present.find((candidate) => ['jpg', 'jpeg', 'png'].includes(candidate.extension));
  if (!source) {
    fail(`${base}: no jpg/png source capture to verify the derivatives against.`);
    continue;
  }

  const sourceInfo = readImage(source.file);
  if (!sourceInfo) {
    fail(`${base}.${source.extension}: could not read image dimensions; the file is not a valid image.`);
    continue;
  }

  for (const candidate of present) {
    const info = readImage(candidate.file);
    const name = `${base}.${candidate.extension}`;
    checked += 1;

    if (!info) {
      fail(`${name}: could not read image dimensions; the file is not a valid image.`);
      continue;
    }

    if (info.width !== sourceInfo.width || info.height !== sourceInfo.height) {
      fail(
        `${name} is ${info.width}x${info.height} but its source ${base}.${source.extension} is ` +
          `${sourceInfo.width}x${sourceInfo.height}; a derivative must show the same capture.`
      );
    }

    // A capture from an opaque source cannot legitimately become see-through.
    if (info.alpha && !sourceInfo.alpha) {
      fail(
        `${name} declares an alpha channel while its source ${base}.${source.extension} is opaque; ` +
          'this is how a blank, fully transparent image gets published as a screenshot.'
      );
    }

    const megapixels = (info.width * info.height) / 1_000_000;
    const bytesPerMegapixel = info.bytes / megapixels;
    if (bytesPerMegapixel < MIN_BYTES_PER_MEGAPIXEL) {
      fail(
        `${name} holds only ${Math.round(bytesPerMegapixel)} bytes per megapixel ` +
          `(${info.bytes} bytes for ${info.width}x${info.height}); that is too empty to be a real screenshot.`
      );
    }
  }
}

if (notes.length) for (const note of notes) console.log(`NOTE: ${note}`);
if (errors.length) {
  console.error('\nGuide asset integrity audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  `Guide asset integrity audit passed: ${checked} image files across ${bases.size} published captures ` +
    'match their source dimensions, carry no unexpected transparency, and are dense enough to be real.'
);
