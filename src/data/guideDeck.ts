import {
  GUIDE_SECTIONS as SOURCE_GUIDE_SECTIONS,
  GUIDE_SLIDES as SOURCE_GUIDE_SLIDES,
} from './guideDeckSource';
import type { GuideSection, GuideSlide } from './guideDeckSource';

export type {
  GuideLink,
  GuideScreenshot,
  GuideSection,
  GuideSlide,
  GuideSlideStatus,
} from './guideDeckSource';

const MOODLE_HOME = 'https://moodlemoe.lms.education.gov.il/';
const MOODLE_MY = 'https://moodlemoe.lms.education.gov.il/my/';
const MOODLE_WIZARD = 'https://moodlemoe.lms.education.gov.il/local/auto_course_create/wizard.php';

export const FIRST_GUIDE_SLIDE_ID = 'open-space-start';

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'opening',
    title: 'פתיחת מרחב למידה',
    description: 'מהכניסה למודל ועד מרחב מוכן, שלב אחרי שלב.',
  },
  ...SOURCE_GUIDE_SECTIONS,
];

function toModernScreenshotFilename(src: string) {
  return src.replace(/\.[^.]+$/, '.avif');
}

function normalizeSlide(slide: GuideSlide): GuideSlide {
  return {
    ...slide,
    status:
      slide.missingCaptureId && slide.status === 'ready'
        ? ('needs-capture' as const)
        : slide.status,
    screenshots: slide.screenshots?.map((screenshot) => ({
      ...screenshot,
      src: toModernScreenshotFilename(screenshot.src),
    })),
  };
}

const OPENING_GUIDE_SLIDES: GuideSlide[] = [
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
];

const ASSET_COVERAGE_SLIDES: GuideSlide[] = [
  {
    id: 'home-edit-controls',
    section: 'content',
    eyebrow: 'עריכה',
    title: 'איפה רואים את פעולות העריכה בעמוד הבית?',
    summary: 'במצב עריכה מופיעות פעולות הוספה ועריכה ישירות בעמוד.',
    screenshots: [{ src: '05-home-edit-on.jpg', caption: 'עמוד הבית במצב עריכה עם פעולות ההוספה והעריכה.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['עמוד הבית', 'מצב עריכה', 'הוספת משבצת'],
    status: 'ready',
  },
  {
    id: 'unit-menu',
    section: 'content',
    eyebrow: 'עריכה',
    title: 'איפה פותחים את תפריט יחידת ההוראה?',
    summary: 'פותחים את תפריט שלוש הנקודות של היחידה כדי להגיע לפעולות היחידה.',
    screenshots: [{ src: '07-unit-menu.jpg', caption: 'תפריט יחידת הוראה במצב עריכה.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['יחידת הוראה', 'שלוש נקודות', 'תפריט'],
    status: 'ready',
  },
  {
    id: 'section-menu-actions',
    section: 'content',
    eyebrow: 'עריכה',
    title: 'אילו פעולות מופיעות בתפריט יחידת הוראה?',
    summary: 'בתפריט מופיעות פעולות עריכה, הסתרה, הזזה ומחיקה לפי ההרשאות.',
    screenshots: [{ src: '13-section-menu-full.jpg', caption: 'תפריט יחידת הוראה מלא עם פעולות העריכה.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['תפריט יחידה', 'הסתרה', 'הזזה', 'מחיקה'],
    status: 'ready',
  },
  {
    id: 'hidden-items-appearance',
    section: 'content',
    eyebrow: 'עריכה',
    title: 'איך נראים פריטים שמוסתרים מהתלמידים?',
    summary: 'Moodle מסמן פריטים מוסתרים כדי שהמורה יזהה מיד מה התלמידים אינם רואים.',
    screenshots: [{ src: '14-hidden-items.jpg', caption: 'דוגמאות לסימוני הסתרה וזמינות במרחב.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['מוסתר בפני תלמידים', 'זמין', 'הסתרה'],
    status: 'ready',
  },
  {
    id: 'activity-chooser-more',
    section: 'content',
    eyebrow: 'תוכן',
    title: 'אילו פעילויות נוספות אפשר להוסיף?',
    summary: 'בורר הפעילויות כולל גם כלים נוספים כמו H5P, משחקים, Meet ו-SCORM כאשר הם זמינים.',
    screenshots: [{ src: '17-activity-chooser-more.jpg', caption: 'החלק הנוסף של בורר הפעילויות והמשאבים.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['H5P', 'SCORM', 'Meet', 'פעילויות נוספות'],
    status: 'ready',
  },
];

const REPLACED_SOURCE_IDS = new Set([
  'cover',
  'login',
  'my-courses',
  'create-space',
  'self-enrol',
  'task-link-first-enrol',
]);

const REMAINING_SOURCE_SLIDES = SOURCE_GUIDE_SLIDES.filter(
  (slide) => !REPLACED_SOURCE_IDS.has(slide.id)
);

export const GUIDE_SLIDES = [
  ...OPENING_GUIDE_SLIDES,
  ...REMAINING_SOURCE_SLIDES,
  ...ASSET_COVERAGE_SLIDES,
].map(normalizeSlide);

// Publication invariant: a slide is public only when the normalized source
// explicitly marks it ready AND there is no unresolved real-screenshot requirement.
export const PUBLISHED_GUIDE_SLIDES = GUIDE_SLIDES.filter(
  (slide) => slide.status === 'ready' && !slide.missingCaptureId
);

const PUBLISHED_SLIDE_IDS = new Set(PUBLISHED_GUIDE_SLIDES.map((slide) => slide.id));

const QUICK_START_CANDIDATES = [
  FIRST_GUIDE_SLIDE_ID,
  'open-space-my-courses',
  'open-space-wizard',
  'open-space-group-choice',
  'open-space-details-empty',
  'open-space-details-check',
  'open-space-type',
  'open-space-confirm',
  'open-space-result',
  'open-space-self-enrol-method',
  'open-space-self-enrol-settings',
  'open-space-self-enrol-student',
  'open-space-self-enrol-success',
  'edit-mode',
  'add-content',
  'student-view',
  'quiz-settings',
  'assignment-submissions',
  'gradebook',
  'report-chooser',
  'final-checklist',
];

// Quick Start must never point at a slide that publication policy withheld.
export const QUICK_START_SLIDE_IDS = QUICK_START_CANDIDATES.filter((slideId) =>
  PUBLISHED_SLIDE_IDS.has(slideId)
);
