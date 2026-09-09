const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
}

function replaceExact(text, before, after, label) {
  if (!text.includes(before)) {
    throw new Error(`Missing expected fragment for ${label}`);
  }
  return text.replace(before, after);
}

// 1) SOURCE OF TRUTH FIRST.
let memory = read('PROJECT_MEMORY.md');

memory = replaceExact(
  memory,
  '- לפני כתיבה יש לקרוא את הגרסה העדכנית של הקובץ מחדש כדי לא לדרוס שינוי מקביל.',
  '- לפני כתיבה יש לקרוא את הגרסה העדכנית של הקובץ מחדש כדי לא לדרוס שינוי מקביל.\n- כל שינוי דרישה שיניב מוסר במהלך שיחה נרשם באותו שינוי ב-`PROJECT_MEMORY.md` לפני שינוי הקוד; אין להסתפק בזיכרון השיחה או בתיעוד צדדי.',
  'source-truth update rule'
);

memory = replaceExact(
  memory,
  '- אין שקף שער כללי לפניו. מיתוג, לוגו ופרטי ההדרכה יכולים להופיע בתוך השקף הראשון בלי להחליף או להסתיר את השאלה.',
  '- אין שקף שער כללי לפניו. מיתוג, לוגו ופרטי ההדרכה מופיעים באזור עליון קומפקטי בתוך השקף הראשון, מעל/בסמוך לכותרת, ולא בפוטר או בתחתית; הם אינם מחליפים או מסתירים את השאלה.',
  'first-slide branding placement'
);

memory = replaceExact(
  memory,
  'כל שקף חייב לכלול, לפי הצורך ובמינימום מלל:\n\n- שאלה קצרה וברורה ככותרת הראשית.',
  'כל שקף חייב לכלול, לפי הצורך ובמינימום מלל:\n\n- **ברצף פתיחת המרחב: לכל שקף יש לכל היותר פעולה/לחיצה אחת.** אין רשימת כמה לחיצות באותו שקף. אם נדרשות שתי לחיצות או שתי בחירות משמעותיות — מפצלים לשני שקפים.\n- לכל שקף ברצף הפתיחה יש לכל היותר צילום Moodle אמיתי אחד המתאים לפעולה הנוכחית. שקף תוצאה יכול להציג צילום ללא פעולה נוספת.\n- אם חסר צילום לאחת הפעולות, השקף נשמר כ-`needs-capture` ואינו מוצג כאילו הושלם; ה-AI מודיע ליניב בדיוק איזה מסך/כפתור צריך לצלם ובאיזה שלב. אין placeholder ואין צילום חלופי מומצא.\n- שאלה קצרה וברורה ככותרת הראשית.',
  'one-click-per-slide contract'
);

memory = replaceExact(
  memory,
  '- המיתוג הקבוע נשמר בנוסח:\n  - `הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין`\n  - `האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים`',
  '- המיתוג הקבוע נשמר בנוסח ומופיע **למעלה בשקף הראשון** באזור מיתוג קומפקטי; אין להשאיר את אחד משני המשפטים ככיתוב תחתון/פוטר:\n  - `הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין`\n  - `האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים`',
  'branding top rule'
);

memory = replaceExact(
  memory,
  '- זהו הנושא הראשון והשקף הראשון במצגת.\n- מציגים את כל המסכים לפי הסדר האמיתי, בלי לדלג על אף שלב משמעותי.',
  '- זהו הנושא הראשון והשקף הראשון במצגת.\n- כל לחיצה או בחירה משמעותית ברצף פתיחת המרחב מקבלת שקף נפרד; לכל שקף לכל היותר פעולה אחת וצילום אמיתי אחד של אותו שלב.\n- מציגים את כל המסכים לפי הסדר האמיתי, בלי לדלג על אף שלב משמעותי.',
  'opening sequence rule'
);

memory = replaceExact(
  memory,
  '19. בכל שינוי משמעותי ב-Guide נבדקת התאמת הארכיטקטורה והטכנולוגיה לדרישה החדשה, וסתירה מבנית מדווחת ומתוקנת במקום להסתיר אותה בתיקון חלקי.',
  '19. בכל שינוי משמעותי ב-Guide נבדקת התאמת הארכיטקטורה והטכנולוגיה לדרישה החדשה, וסתירה מבנית מדווחת ומתוקנת במקום להסתיר אותה בתיקון חלקי.\n20. בשקף הראשון שני משפטי המיתוג הקבועים נמצאים למעלה, ולא בתחתית/פוטר.\n21. בכל שקף ברצף פתיחת המרחב יש לכל היותר פעולה/לחיצה אחת ולכל היותר צילום אמיתי אחד; רצף עם שתי פעולות מפוצל לשני שקפים.\n22. צילום שחסר לשלב ברצף אינו מוחלף בתחליף; הוא מסומן `needs-capture` וה-AI מוסר ליניב בקשת צילום מדויקת.',
  'acceptance criteria'
);

memory = replaceExact(
  memory,
  'במצגת: מתחילים ב„איך פותחים מרחב למידה במודל?”, ממשיכים ברצף מלא של פתיחת המרחב, וכל שקף כולל שאלה קצרה, הסבר קצר, צילום אמיתי, קישור אמיתי וניווט של מצגת.',
  'במצגת: מתחילים ב„איך פותחים מרחב למידה במודל?”, כאשר שני משפטי המיתוג הקבועים נמצאים למעלה בשקף הראשון; ממשיכים ברצף מלא של פתיחת המרחב, ובכל שקף של רצף זה יש לכל היותר פעולה/לחיצה אחת וצילום אמיתי אחד של אותו שלב, לצד שאלה קצרה, הסבר קצר, קישור אמיתי וניווט של מצגת.',
  'final guide rule'
);

write('PROJECT_MEMORY.md', memory);
write('public/PROJECT_MEMORY.md', memory);

// 2) PRESENTATION DATA: one meaningful action and one real screenshot per opening slide.
let deck = read('src/data/guideDeck.ts');
const openingStart = deck.indexOf('const OPENING_GUIDE_SLIDES: GuideSlide[] = [');
const assetStart = deck.indexOf('const ASSET_COVERAGE_SLIDES: GuideSlide[] = [');
if (openingStart < 0 || assetStart < 0 || assetStart <= openingStart) {
  throw new Error('Could not locate premium opening slide block');
}

const openingBlock = `const OPENING_GUIDE_SLIDES: GuideSlide[] = [
  {
    id: FIRST_GUIDE_SLIDE_ID,
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 1',
    title: 'איך פותחים מרחב למידה במודל?',
    summary: 'מתחילים במסך הכניסה של Moodle משרד החינוך. בכל שקף במקטע הזה מבצעים פעולה אחת בלבד.',
    steps: ['לאחר ההזדהות לחצו על כפתור הכניסה למערכת.'],
    screenshots: [{ src: '01-login.jpg', caption: 'מסך הכניסה האמיתי ל-Moodle של משרד החינוך.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['פתיחת מרחב', 'כניסה', 'Moodle', 'מודל'],
    status: 'ready',
  },
  {
    id: 'open-space-my-courses',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 2',
    title: 'איפה לוחצים כדי לפתוח מרחב חדש?',
    summary: 'בעמוד „מרחבי־הלימוד שלי” מופיע הכפתור שמתחיל את פתיחת המרחב.',
    steps: ['לחצו „פתיחת מרחב כיתתי”.'],
    screenshots: [{ src: '02-my-courses-home.jpg', caption: '„מרחבי־הלימוד שלי” עם הכפתור „פתיחת מרחב כיתתי”.' }],
    link: { href: MOODLE_MY, label: 'פתיחת מרחבי־הלימוד שלי' },
    keywords: ['מרחבי הלימוד שלי', 'פתיחת מרחב כיתתי'],
    status: 'ready',
  },
  {
    id: 'open-space-wizard',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 3',
    title: 'איזה מסלול בוחרים לפתיחת המרחב?',
    summary: 'האשף מציג את מסלולי הפתיחה. בוחרים רק את המסלול שמתאים למרחב שרוצים ליצור.',
    steps: ['לחצו על מסלול הפתיחה המתאים.'],
    screenshots: [{ src: '19-wizard-step1.jpg', caption: 'תחילת אשף פתיחת המרחב עם שני מסלולי הבחירה.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['אשף', 'פתיחת מרחב', 'מסלול'],
    status: 'ready',
  },
  {
    id: 'open-space-group-choice',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 4',
    title: 'איך פותחים מרחב בלי תלמידים?',
    summary: 'אם רוצים לצרף תלמידים אחר כך באמצעות קישור, בוחרים במסלול ללא קבוצת לימוד.',
    steps: ['לחצו „ללא קבוצת לימוד”.'],
    screenshots: [{ src: '20-wizard-step1-selected.jpg', caption: '„ללא קבוצת לימוד” מסומן במסגרת כחולה.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['קבוצת לימוד', 'ללא קבוצת לימוד', 'בלי תלמידים'],
    status: 'ready',
  },
  {
    id: 'open-space-details-empty',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 5',
    title: 'איפה ממלאים את פרטי המרחב?',
    summary: 'כאן מופיעים שדות בית הספר, המקצוע, השכבה והכיתה.',
    steps: ['מלאו את פרטי המרחב במסך הזה.'],
    screenshots: [{ src: '21-wizard-step1-form.jpg', caption: 'טופס „מרחב למידה חדש” לפני מילוי.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בית ספר', 'מקצוע', 'שכבה', 'כיתה'],
    status: 'ready',
  },
  {
    id: 'open-space-details-check',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 6',
    title: 'מה לוחצים אחרי שכל הפרטים נכונים?',
    summary: 'בודקים את הפרטים המלאים ורק אז ממשיכים לשלב הבא באשף.',
    steps: ['לחצו על כפתור ההמשך באשף.'],
    screenshots: [{ src: '25-wizard-step1-filled.jpg', caption: 'טופס שלב 1 לאחר מילוי הפרטים בערכים בדויים.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בדיקה', 'פרטי מרחב', 'המשך'],
    status: 'ready',
  },
  {
    id: 'open-space-type',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 7',
    title: 'איזה סוג מרחב בוחרים?',
    summary: 'בשלב 2 בוחרים סוג אחד: מרחב ריק, שכפול תוכן או תוכן מוכן.',
    steps: ['לחצו על סוג המרחב הרצוי.'],
    screenshots: [{ src: '22-wizard-step2.jpg', caption: 'שלב 2 — „סוג מרחב הלמידה”.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['סוג מרחב', 'מרחב ריק', 'שכפול תוכן', 'תוכן מוכן'],
    status: 'ready',
  },
  {
    id: 'open-space-content',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 8',
    title: 'איך בוחרים את התוכן למרחב?',
    summary: 'חסר כרגע צילום אמיתי של מסך בחירת התוכן. אין מציגים תחליף עד שיתקבל צילום אמיתי.',
    steps: ['בחרו את מקור התוכן והמשיכו לשלב האישור.'],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בחירת תוכן', 'מקור תוכן'],
    status: 'needs-capture',
    missingCaptureId: 'M01',
  },
  {
    id: 'open-space-confirm',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 9',
    title: 'מה לוחצים כדי ליצור את המרחב?',
    summary: 'במסך „אישור וסיום” בודקים את הפרטים ומבצעים את פעולת היצירה.',
    steps: ['לחצו „אישור”.'],
    screenshots: [{ src: '24-wizard-step4.jpg', caption: 'שלב 4 — „אישור וסיום” עם כפתור „אישור”.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['אישור', 'סיום', 'יצירת מרחב'],
    status: 'ready',
  },
  {
    id: 'open-space-result',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 10',
    title: 'מה רואים אחרי שהמרחב נפתח?',
    summary: 'זהו עמוד המרחב שנוצר. בשקף הזה רק בודקים שהמרחב הנכון נפתח.',
    screenshots: [{ src: '10-course-page.jpg', caption: 'עמוד מרחב Moodle לאחר פתיחת המרחב.' }],
    link: { href: MOODLE_MY, label: 'פתיחת מרחבי־הלימוד שלי' },
    keywords: ['עמוד מרחב', 'מרחב שנפתח'],
    status: 'ready',
  },
  {
    id: 'open-space-self-enrol-method',
    section: 'opening',
    eyebrow: 'פתיחת מרחב בלי תלמידים · שלב 11',
    title: 'מה מפעילים כדי שתלמידים יוכלו להצטרף?',
    summary: 'בשיטות השיוך מאתרים את „שיוך עצמי (תלמיד)” ומוודאים שהוא פעיל.',
    steps: ['לחצו על סמל העין של „שיוך עצמי (תלמיד)” עד שהוא פתוח.'],
    screenshots: [{ src: '26-selfenrol-methods-list.jpg', caption: '„שיוך עצמי (תלמיד)” וסמל העין ברשימת שיטות השיוך.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['שיוך עצמי', 'עין פתוחה', 'תלמידים'],
    status: 'ready',
  },
  {
    id: 'open-space-self-enrol-settings',
    section: 'opening',
    eyebrow: 'פתיחת מרחב בלי תלמידים · שלב 12',
    title: 'איזו הגדרה מאפשרת רישום של תלמיד חדש?',
    summary: 'בהגדרות השיוך העצמי מפעילים את האפשרות שמאפשרת רישום למשתמשים חדשים.',
    steps: ['הפעילו „האם לאפשר רישום למשתמשים חדשים?”.'],
    screenshots: [{ src: '27-selfenrol-settings.jpg', caption: 'הגדרות „שיוך עצמי” עם אפשרות הרישום למשתמשים חדשים.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['שיוך עצמי', 'רישום משתמשים חדשים'],
    status: 'ready',
  },
  {
    id: 'open-space-self-enrol-student',
    section: 'opening',
    eyebrow: 'פתיחת מרחב בלי תלמידים · שלב 13',
    title: 'מה התלמיד לוחץ בפעם הראשונה?',
    summary: 'אחרי שהתלמיד מקבל את קישור המרחב, מופיע לו מסך ההצטרפות.',
    steps: ['לחצו „רשום אותי”.'],
    screenshots: [{ src: '28-selfenrol-student-view.jpg', caption: 'מסך התלמיד עם הכפתור „רשום אותי”.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['רשום אותי', 'קישור למרחב', 'תלמיד'],
    status: 'ready',
  },
  {
    id: 'open-space-self-enrol-success',
    section: 'opening',
    eyebrow: 'פתיחת מרחב בלי תלמידים · שלב 14',
    title: 'איך יודעים שההרשמה הצליחה?',
    summary: 'אחרי הלחיצה התלמיד רואה הודעת הצלחה ונכנס למרחב. אין פעולה נוספת בשקף הזה.',
    screenshots: [{ src: '29-selfenrol-success-studentview.jpg', caption: '„נרשמתם לקורס בהצלחה” — תצוגת תלמיד לאחר הרשמה עצמית.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['הרשמה הצליחה', 'תלמיד', 'שיוך עצמי'],
    status: 'ready',
  },
];`;

deck = deck.slice(0, openingStart) + openingBlock + '\n\n' + deck.slice(assetStart);
write('src/data/guideDeck.ts', deck);

// 3) FIRST SLIDE BRANDING: both required lines at the top, none at the bottom.
let guide = read('src/pages/Guide.tsx');
guide = replaceExact(
  guide,
  `                <p className="mt-0.5 text-xs font-bold leading-relaxed text-slate-600">\n                  הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין\n                </p>`,
  `                <p className="mt-0.5 text-xs font-bold leading-relaxed text-slate-600">\n                  הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין\n                </p>\n                <p className="mt-0.5 text-xs font-bold leading-relaxed text-slate-600">\n                  האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים\n                </p>`,
  'top branding lines'
);

guide = replaceExact(
  guide,
  `\n      {isFirst && (\n        <p className="relative z-10 mx-auto mt-5 max-w-5xl text-center text-[11px] font-bold text-slate-500 sm:text-xs">\n          האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים\n        </p>\n      )}`,
  '',
  'remove bottom Yaniv branding'
);
write('src/pages/Guide.tsx', guide);

// 4) QUALITY AUDIT: enforce the new structure in code so it cannot regress silently.
let audit = read('scripts/checks/guide-presentation-quality-audit.cjs');
const auditAnchor = `if (errors.length) {`;
const auditInsert = `// 6) Opening-space teaching contract: one action and one screenshot at most per slide.\nconst openingStartIndex = deck.indexOf('const OPENING_GUIDE_SLIDES: GuideSlide[] = [');\nconst openingEndIndex = deck.indexOf('const ASSET_COVERAGE_SLIDES: GuideSlide[] = [');\nif (openingStartIndex < 0 || openingEndIndex <= openingStartIndex) {\n  fail('Opening Guide slide block could not be located.');\n} else {\n  const opening = deck.slice(openingStartIndex, openingEndIndex);\n  const slideChunks = opening.split(/\\n  \\{\\n(?=    id:)/).slice(1);\n  for (const chunk of slideChunks) {\n    const id = chunk.match(/id:\\s*'([^']+)'/)?.[1] ?? 'unknown';\n    const stepBody = chunk.match(/steps:\\s*\\[([\\s\\S]*?)\\]/)?.[1] ?? '';\n    const stepCount = [...stepBody.matchAll(/'[^']*'/g)].length;\n    const screenshotBody = chunk.match(/screenshots:\\s*\\[([\\s\\S]*?)\\]/)?.[1] ?? '';\n    const screenshotCount = [...screenshotBody.matchAll(/src:\\s*'/g)].length;\n    if (stepCount > 1) fail(\`Opening slide \\${id} contains \\${stepCount} actions; maximum is one.\`);\n    if (screenshotCount > 1) fail(\`Opening slide \\${id} contains \\${screenshotCount} screenshots; maximum is one.\`);\n  }\n}\n\nfor (const fragment of [\n  'הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין',\n  'האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים',\n]) {\n  if (!guide.includes(fragment)) fail(\`First-slide branding contract is missing: \\${fragment}\`);\n}\n\n`;
if (!audit.includes('Opening-space teaching contract: one action and one screenshot at most per slide.')) {
  audit = replaceExact(audit, auditAnchor, auditInsert + auditAnchor, 'quality audit extension');
}
write('scripts/checks/guide-presentation-quality-audit.cjs', audit);

console.log('Applied source-truth-first Guide migration: exact first slide, top branding, one action/screenshot per opening slide, M01 preserved as needs-capture.');
