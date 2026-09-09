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
    summary: 'מתחילים בכניסה ל-Moodle של משרד החינוך.',
    steps: ['פותחים את Moodle.', 'מזדהים בפרטי משרד החינוך.', 'נכנסים למרחבי־הלימוד שלי.'],
    screenshots: [{ src: '01-login.jpg', caption: 'מסך הכניסה ל-Moodle של משרד החינוך.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['פתיחת מרחב', 'כניסה', 'Moodle', 'מודל'],
    status: 'ready',
  },
  {
    id: 'open-space-my-courses',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 2',
    title: 'איפה מתחילים לפתוח מרחב חדש?',
    summary: 'נכנסים ל„מרחבי־הלימוד שלי” ומאתרים את הפעולה לפתיחת מרחב כיתתי.',
    screenshots: [{ src: '02-my-courses-home.jpg', caption: '„מרחבי־הלימוד שלי” והכניסה לפתיחת מרחב כיתתי.' }],
    link: { href: MOODLE_MY, label: 'פתיחת מרחבי־הלימוד שלי' },
    keywords: ['מרחבי הלימוד שלי', 'פתיחת מרחב כיתתי'],
    status: 'ready',
  },
  {
    id: 'open-space-wizard',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 3',
    title: 'איך מתחילים את אשף פתיחת המרחב?',
    summary: 'פותחים את האשף ובוחרים את מסלול פתיחת המרחב.',
    screenshots: [{ src: '19-wizard-step1.jpg', caption: 'תחילת אשף פתיחת המרחב והמסלולים האפשריים.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['אשף', 'פתיחת מרחב', 'מסלול'],
    status: 'ready',
  },
  {
    id: 'open-space-group-choice',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 4',
    title: 'פותחים את המרחב עם תלמידים או בלי תלמידים?',
    summary: 'אפשר לבחור קבוצת לימוד קיימת, ואפשר לפתוח בלי תלמידים ולצרף אותם אחר כך בקישור.',
    points: ['עם תלמידים — בוחרים קבוצה/כיתה קיימת.', 'בלי תלמידים — בוחרים „ללא קבוצת לימוד”.'],
    screenshots: [{ src: '20-wizard-step1-selected.jpg', caption: 'האפשרות „ללא קבוצת לימוד” מסומנת באשף.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['קבוצת לימוד', 'ללא קבוצת לימוד', 'עם תלמידים', 'בלי תלמידים'],
    status: 'ready',
  },
  {
    id: 'open-space-details-empty',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 5',
    title: 'אילו פרטים בוחרים למרחב?',
    summary: 'ממלאים בית ספר, מקצוע, שכבת גיל וכיתה לפי המרחב שרוצים לפתוח.',
    screenshots: [{ src: '21-wizard-step1-form.jpg', caption: 'טופס פרטי המרחב לפני מילוי.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בית ספר', 'מקצוע', 'שכבה', 'כיתה'],
    status: 'ready',
  },
  {
    id: 'open-space-details-check',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 6',
    title: 'מה בודקים לפני שממשיכים?',
    summary: 'בודקים שהפרטים שבחרנו נכונים ורק אז ממשיכים.',
    screenshots: [{ src: '25-wizard-step1-filled.jpg', caption: 'טופס פרטי המרחב אחרי מילוי, עם פרטים בדויים.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בדיקה', 'פרטי מרחב'],
    status: 'ready',
  },
  {
    id: 'open-space-type',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 7',
    title: 'איזה סוג מרחב בוחרים?',
    summary: 'בוחרים את סוג המרחב שמתאים למטרה: מרחב ריק, שכפול תוכן או תוכן מוכן.',
    screenshots: [{ src: '22-wizard-step2.jpg', caption: 'שלב בחירת סוג מרחב הלמידה.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['סוג מרחב', 'מרחב ריק', 'שכפול תוכן', 'תוכן מוכן'],
    status: 'ready',
  },
  {
    id: 'open-space-content',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 8',
    title: 'איך בוחרים את התוכן למרחב?',
    summary: 'בוחרים את מקור התוכן וממשיכים לאישור.',
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בחירת תוכן', 'מקור תוכן'],
    status: 'needs-capture',
    missingCaptureId: 'M01',
  },
  {
    id: 'open-space-confirm',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 9',
    title: 'איך מאשרים את פתיחת המרחב?',
    summary: 'בודקים את הפרטים ומאשרים את יצירת המרחב.',
    screenshots: [{ src: '24-wizard-step4.jpg', caption: 'שלב האישור והסיום באשף.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['אישור', 'סיום', 'יצירת מרחב'],
    status: 'ready',
  },
  {
    id: 'open-space-result',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 10',
    title: 'איך נראה המרחב אחרי שנפתח?',
    summary: 'אחרי האישור נכנסים לעמוד המרחב ובודקים שהמרחב הנכון נפתח.',
    screenshots: [{ src: '10-course-page.jpg', caption: 'עמוד מרחב Moodle לאחר הכניסה למרחב.' }],
    link: { href: MOODLE_MY, label: 'פתיחת מרחבי־הלימוד שלי' },
    keywords: ['עמוד מרחב', 'מרחב שנפתח'],
    status: 'ready',
  },
  {
    id: 'open-space-self-enrol-method',
    section: 'opening',
    eyebrow: 'פתיחת מרחב בלי תלמידים · שלב 11',
    title: 'איך מאפשרים לתלמידים להצטרף בעצמם?',
    summary: 'מפעילים „שיוך עצמי (תלמיד)” ומוודאים שהעין פתוחה.',
    screenshots: [{ src: '26-selfenrol-methods-list.jpg', caption: '„שיוך עצמי (תלמיד)” וסמל העין ברשימת שיטות השיוך.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['שיוך עצמי', 'עין פתוחה', 'תלמידים'],
    status: 'ready',
  },
  {
    id: 'open-space-self-enrol-settings',
    section: 'opening',
    eyebrow: 'פתיחת מרחב בלי תלמידים · שלב 12',
    title: 'אילו הגדרות פותחים לשיוך עצמי?',
    summary: 'פותחים את הגדרות השיוך העצמי ומאפשרים רישום למשתמשים חדשים.',
    screenshots: [{ src: '27-selfenrol-settings.jpg', caption: 'הגדרות „שיוך עצמי” לתלמידים.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['שיוך עצמי', 'רישום משתמשים חדשים'],
    status: 'ready',
  },
  {
    id: 'open-space-self-enrol-student',
    section: 'opening',
    eyebrow: 'פתיחת מרחב בלי תלמידים · שלב 13',
    title: 'מה התלמיד לוחץ בפעם הראשונה?',
    summary: 'שולחים לתלמיד את קישור המרחב, והוא לוחץ „רשום אותי”.',
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
    summary: 'אחרי ההרשמה התלמיד רואה הודעת הצלחה ונכנס למרחב.',
    screenshots: [{ src: '29-selfenrol-success-studentview.jpg', caption: 'הודעת ההצלחה לאחר הרשמה עצמית למרחב.' }],
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
