const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, text) {
  fs.writeFileSync(path.join(root, rel), text, 'utf8');
}

function replaceExact(rel, from, to, expected = 1) {
  const before = read(rel);
  const count = before.split(from).length - 1;
  if (count !== expected) {
    throw new Error(`${rel}: expected ${expected} occurrence(s), found ${count}: ${from}`);
  }
  write(rel, before.split(from).join(to));
}

// 1) The cover's only CTA is Start, therefore it must enter the full presentation,
// not silently switch the teacher into the reduced Quick sequence.
replaceExact('src/pages/Guide.tsx', 'onQuickStart', 'onStart', 4);
replaceExact(
  'src/pages/Guide.tsx',
  "onStart={() => jumpToSlide(QUICK_START_SLIDE_IDS[0], 'quick')}",
  "onStart={() => jumpToSlide(FIRST_TRAINING_SLIDE_ID, 'all')}",
  1
);

// 2) M29 is withheld pending a real capture. Keep its authored copy neutral so an
// eventual status change cannot publish unsupported claims about email + Moodle channels.
replaceExact(
  'src/data/guideDeck.ts',
  "summary: 'בסיום התהליך מתקבל מייל אישור על יצירת המרחב וגם עדכון בתפריט ההודעות.',",
  "summary: 'בסיום התהליך בודקים את ההודעה שמתקבלת על יצירת המרחב. אופן קבלת ההודעה יאומת מול המסך האמיתי לפני פרסום השקף.',",
  1
);
replaceExact(
  'src/data/guideDeck.ts',
  "keywords: ['מייל אישור', 'הודעות', 'יצירת מרחב'],",
  "keywords: ['הודעה', 'יצירת מרחב', 'סיום יצירה'],",
  1
);

// 3) Lock the Start behavior in the canonical Guide truth and its deployed mirror.
const oldTruth = '- כפתור `התחל` בשער פותח תמיד את שקף ההדרכה `איך פותחים מרחב למידה במודל?`; ניווט נוסף נשאר בכרום הקבוע של המצגת ולא על גבי השער.';
const newTruth = '- כפתור `התחל` בשער פותח תמיד את שקף ההדרכה `איך פותחים מרחב למידה במודל?` במצב המצגת המלא (`all`), כך שכפתורי הקודם/הבא עוברים על כל השקפים המפורסמים; המסלול המהיר נשאר אפשרות נפרדת בכרום הקבוע ואינו ברירת המחדל של השער.';
replaceExact('PROJECT_MEMORY.md', oldTruth, newTruth, 1);
replaceExact('public/PROJECT_MEMORY.md', oldTruth, newTruth, 1);

// 4) Add regression gates. This audit is already part of npm run audit:guide.
let audit = read('scripts/checks/guide-truth-consistency-audit.cjs');
const anchor = "if (failures.length) {\n";
if (!audit.includes(anchor)) throw new Error('guide truth audit anchor missing');
const block = `// Cover Start must enter the complete published presentation, never Quick mode.\nrequireText('PROJECT_MEMORY.md', memory, 'במצב המצגת המלא (\\`all\\`)');\nrequireText('src/pages/Guide.tsx', guideSource, 'onClick={onStart}');\nrequireText('src/pages/Guide.tsx', guideSource, \"onStart={() => jumpToSlide(FIRST_TRAINING_SLIDE_ID, 'all')}\");\nforbidText('src/pages/Guide.tsx', guideSource, 'onQuickStart');\nforbidText('src/pages/Guide.tsx', guideSource, \"onStart={() => jumpToSlide(QUICK_START_SLIDE_IDS[0], 'quick')}\");\nconst deckSourceText = read('src/data/guideDeck.ts');\nforbidText('src/data/guideDeck.ts', deckSourceText, 'מייל אישור על יצירת המרחב וגם עדכון בתפריט ההודעות');\n\n`;
if (!audit.includes("onStart={() => jumpToSlide(FIRST_TRAINING_SLIDE_ID, 'all')}")) {
  audit = audit.replace(anchor, block + anchor);
  write('scripts/checks/guide-truth-consistency-audit.cjs', audit);
}

console.log('GUIDE_FIX_305_APPLIED');
