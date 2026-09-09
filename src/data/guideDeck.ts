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
  {
    id: 'wizard-new',
    title: 'האשף החדש',
    description: 'תוכן מוכן, שכפול תוכן, חיפוש, מיון והשלמת יצירת המרחב.',
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
    summary: 'אחרי ההתחברות מגיעים ל„מרחבי הלמידה שלי”. הכפתור העדכני לפתיחת התהליך הוא „+ מרחב חדש”.',
    steps: ['לחצו „+ מרחב חדש”.'],
    screenshots: [{ src: '02-my-courses-home.jpg', caption: 'המסך העדכני „מרחבי הלמידה שלי” עם הכפתור „+ מרחב חדש”.' }],
    link: { href: MOODLE_MY, label: 'פתיחת מרחבי הלמידה שלי' },
    keywords: ['מרחבי הלמידה שלי', 'מרחב חדש'],
    status: 'ready',
  },
  {
    id: 'open-space-wizard',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 3',
    title: 'איך מתחילים באשף?',
    summary: 'בוחרים את קבוצת הלימוד הרצויה, או ממשיכים במסלול שבו ממלאים את מאפייני הכיתה.',
    steps: ['בחרו את מסלול הפתיחה המתאים.'],
    screenshots: [{ src: '19-wizard-step1.jpg', caption: 'תחילת אשף פתיחת המרחב עם מסלולי הבחירה.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['אשף', 'פתיחת מרחב', 'קבוצת לימוד'],
    status: 'ready',
  },
  {
    id: 'open-space-group-choice',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 4',
    title: 'איך פותחים מרחב בלי קבוצת לימוד?',
    summary: 'אם בוחרים „ללא קבוצת לימוד”, המרחב ייפתח לרישום עצמאי של תלמידים באופן אוטומטי. לאחר יצירתו שולחים לתלמידים את קישור המרחב.',
    steps: ['לחצו „ללא קבוצת לימוד”.'],
    screenshots: [{ src: '20-wizard-step1-selected.jpg', caption: '„ללא קבוצת לימוד” מסומן באשף.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['קבוצת לימוד', 'ללא קבוצת לימוד', 'רישום עצמי', 'בלי תלמידים'],
    status: 'ready',
  },
  {
    id: 'open-space-details-empty',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 5',
    title: 'איפה ממלאים את מאפייני הכיתה?',
    summary: 'במסלול ללא קבוצת לימוד ממלאים את הפרטים שמופיעים בפועל: בית ספר, מקצוע, שכבת גיל וכיתה.',
    steps: ['מלאו את פרטי הכיתה במסך הזה.'],
    screenshots: [{ src: '21-wizard-step1-form.jpg', caption: 'טופס „מרחב למידה חדש” לפני מילוי.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בית ספר', 'מקצוע', 'שכבה', 'כיתה'],
    status: 'ready',
  },
  {
    id: 'open-space-details-check',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 6',
    title: 'מה עושים אחרי שמילאנו את מאפייני הכיתה?',
    summary: 'בודקים שהפרטים נכונים וממשיכים לשלב בחירת סוג מרחב הלמידה.',
    steps: ['לחצו על כפתור ההמשך באשף.'],
    screenshots: [{ src: '25-wizard-step1-filled.jpg', caption: 'טופס שלב 1 לאחר מילוי הפרטים.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בדיקה', 'פרטי מרחב', 'המשך'],
    status: 'ready',
  },
  {
    id: 'open-space-type',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 7',
    title: 'איזה סוג מרחב בוחרים?',
    summary: 'האשף מציג אפשרויות כמו מרחב ריק, „שכפול תוכן שלי” ו„תוכן מוכן”. כל אפשרות ממשיכה למסלול המתאים לה.',
    steps: ['לחצו על סוג המרחב הרצוי.'],
    screenshots: [{ src: '22-wizard-step2.jpg', caption: 'שלב „סוג מרחב הלמידה”.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['סוג מרחב', 'מרחב ריק', 'שכפול תוכן שלי', 'תוכן מוכן'],
    status: 'ready',
  },
  {
    id: 'open-space-content',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 8',
    title: 'איך בוחרים תוכן מוכן למרחב?',
    summary: 'לאחר בחירת „תוכן מוכן” מוצגים מקצועות ופרויקטים זמינים. בוחרים את התוכן שמתאים למרחב.',
    steps: ['בחרו את התוכן הרצוי.'],
    screenshots: [{ src: '23-wizard-content-ready.jpg', caption: 'המסך שמוביל לבחירת תוכן מוכן מתוך האשף החדש.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['בחירת תוכן', 'תוכן מוכן', 'מקצועות', 'פרויקטים'],
    status: 'ready',
  },
  {
    id: 'open-space-confirm',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 9',
    title: 'מה לוחצים כדי ליצור את המרחב?',
    summary: 'במסך „אישור וסיום” בודקים את הפרטים ומבצעים את פעולת היצירה.',
    steps: ['לחצו „אישור”.'],
    screenshots: [{ src: '24-wizard-step4.jpg', caption: 'שלב „אישור וסיום” עם כפתור „אישור”.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['אישור', 'סיום', 'יצירת מרחב'],
    status: 'ready',
  },
  {
    id: 'open-space-background-create',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 10',
    title: 'צריך להמתין מול המסך בזמן יצירת המרחב?',
    summary: 'לא. באשף החדש יצירת המרחב יכולה להמשיך ברקע, ואין צורך להישאר מול המסך עד לסיום.',
    screenshots: [{ src: '38-wizard-background-create.jpg', caption: 'הודעת האשף לאחר שליחת בקשת יצירת המרחב.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['יצירה ברקע', 'אין צורך להמתין', 'מרחב חדש'],
    status: 'ready',
  },
  {
    id: 'open-space-created-notification',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 11',
    title: 'איך יודעים שהמרחב נוצר?',
    summary: 'בסיום התהליך מתקבל מייל אישור על יצירת המרחב וגם עדכון בתפריט ההודעות.',
    screenshots: [{ src: '40-wizard-notification-update.jpg', caption: 'עדכון מתוך רצף האשף החדש לאחר שליחת הבקשה.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['מייל אישור', 'הודעות', 'יצירת מרחב'],
    status: 'ready',
  },
  {
    id: 'open-space-result',
    section: 'opening',
    eyebrow: 'פתיחת מרחב למידה · שלב 12',
    title: 'מה רואים אחרי שהמרחב נפתח?',
    summary: 'לאחר שהיצירה הסתיימה נכנסים למרחב שנוצר ומוודאים שזה המרחב הנכון.',
    screenshots: [{ src: '10-course-page.jpg', caption: 'עמוד מרחב Moodle לאחר פתיחת המרחב.' }],
    link: { href: MOODLE_MY, label: 'פתיחת מרחבי הלמידה שלי' },
    keywords: ['עמוד מרחב', 'מרחב שנפתח'],
    status: 'ready',
  },
];

const WIZARD_NEW_FEATURE_SLIDES: GuideSlide[] = [
  {
    id: 'wizard-ready-content-catalog',
    section: 'wizard-new',
    eyebrow: 'האשף החדש · תוכן מוכן',
    title: 'איזה תוכן מוכן אפשר להוסיף?',
    summary: '„תוכן מוכן” מאפשר ליצור מרחב עם תכנים מוכנים במקצועות ופרויקטים הזמינים במערכת, ובהם תכנים בעברית, אנגלית, מתמטיקה לחטיבה, מדע וטכנולוגיה ומשימות אוריינות מתוקשבות.',
    screenshots: [{ src: '33-wizard-ready-content-search.jpg', caption: 'קטלוג תוכן מוכן באשף החדש.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['תוכן מוכן', 'מתמטיקה לחטיבה', 'עברית', 'אנגלית', 'מדע וטכנולוגיה'],
    status: 'ready',
  },
  {
    id: 'wizard-ready-content-search',
    section: 'wizard-new',
    eyebrow: 'האשף החדש · חיפוש',
    title: 'איך מוצאים תוכן מוכן במהירות?',
    summary: 'משתמשים בשורת החיפוש החכמה כדי למצוא את התוכן המוכן הרלוונטי.',
    steps: ['הקלידו מילת חיפוש בשורת החיפוש.'],
    screenshots: [{ src: '33-wizard-ready-content-search.jpg', caption: 'שורת החיפוש ופריטי התוכן המוכן.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['חיפוש חכם', 'תוכן מוכן', 'חיפוש'],
    status: 'ready',
  },
  {
    id: 'wizard-ready-content-list-toggle',
    section: 'wizard-new',
    eyebrow: 'האשף החדש · תצוגה',
    title: 'איך משנים מתצוגת תמונות לרשימה?',
    summary: 'אפשר לשנות את תצוגת התוכן מתמונות לרשימה פשוטה כדי לסרוק את האפשרויות בדרך שנוחה לכם.',
    steps: ['לחצו על כפתור שינוי התצוגה.'],
    screenshots: [{ src: '34-wizard-ready-content-list-toggle.jpg', caption: 'תוכן מוכן בתצוגת רשימה.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['תצוגת רשימה', 'תמונות', 'שינוי תצוגה'],
    status: 'ready',
  },
  {
    id: 'wizard-clone-my-content',
    section: 'wizard-new',
    eyebrow: 'האשף החדש · שכפול',
    title: 'איך משכפלים מרחב שכבר יש לי?',
    summary: 'בוחרים „שכפול תוכן שלי” ואז מחפשים את מרחב הלמידה שרוצים לשכפל.',
    steps: ['בחרו „שכפול תוכן שלי”.'],
    screenshots: [{ src: '35-wizard-clone-my-content.jpg', caption: 'מסלול „שכפול תוכן שלי” באשף החדש.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['שכפול תוכן שלי', 'שכפול מרחב'],
    status: 'ready',
  },
  {
    id: 'wizard-clone-search-sort',
    section: 'wizard-new',
    eyebrow: 'האשף החדש · שכפול',
    title: 'איך מוצאים את המרחב שרוצים לשכפל?',
    summary: 'אפשר לחפש לפי מילת חיפוש ולמיין מרחבים לפי שם, בית ספר או שנת לימודים.',
    steps: ['חפשו או בחרו את המיון המתאים.'],
    screenshots: [{ src: '36-wizard-clone-sort.jpg', caption: 'רשימת מרחבים לשכפול עם אפשרויות חיפוש ומיון.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['מיון', 'בית ספר', 'שנת לימודים', 'חיפוש מרחב'],
    status: 'ready',
  },
  {
    id: 'wizard-clone-previous-year',
    section: 'wizard-new',
    eyebrow: 'האשף החדש · שכפול',
    title: 'אפשר לשכפל מרחב משנה קודמת לבד?',
    summary: 'כן. באשף החדש ניתן לשכפל באופן עצמאי מרחב למידה משנה קודמת, ללא צורך בהגשת טופס בקשה למשרד החינוך.',
    screenshots: [{ src: '37-wizard-clone-previous-year.jpg', caption: 'מסך האשף במהלך בחירת מרחב לשכפול משנה קודמת.' }],
    link: { href: MOODLE_WIZARD, label: 'פתיחת אשף יצירת מרחב' },
    keywords: ['שנה קודמת', 'שכפול עצמאי', 'ללא טופס'],
    status: 'ready',
  },
];

const STUDENT_ENROLMENT_SLIDES: GuideSlide[] = [
  {
    id: 'self-enrol-auto',
    section: 'students',
    eyebrow: 'הצטרפות תלמידים',
    title: 'מה קורה כשפותחים מרחב ללא קבוצת לימוד?',
    summary: 'לפי האשף החדש, מרחב שנוצר ללא קבוצת לימוד פתוח לרישום עצמאי של תלמידים באופן אוטומטי. הפעולה העיקרית של המורה לאחר יצירת המרחב היא לשלוח לתלמידים את קישור המרחב.',
    screenshots: [{ src: '20-wizard-step1-selected.jpg', caption: 'בחירת „ללא קבוצת לימוד” באשף.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['רישום עצמי אוטומטי', 'ללא קבוצת לימוד', 'קישור למרחב'],
    status: 'ready',
  },
  {
    id: 'self-enrol-troubleshoot-method',
    section: 'students',
    eyebrow: 'פתרון תקלה · שיוך עצמי',
    title: 'מה בודקים אם תלמיד לא מצליח להירשם?',
    summary: 'במרחב שנפתח ללא קבוצת לימוד הרישום העצמי אמור להיות פעיל אוטומטית. אם תלמיד אינו מצליח להצטרף, בודקים ששיטת „שיוך עצמי (תלמיד)” פעילה.',
    steps: ['בדקו שסמל העין של „שיוך עצמי (תלמיד)” פתוח.'],
    screenshots: [{ src: '26-selfenrol-methods-list.jpg', caption: '„שיוך עצמי (תלמיד)” ברשימת שיטות השיוך.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['שיוך עצמי', 'פתרון תקלה', 'עין פתוחה'],
    status: 'ready',
  },
  {
    id: 'self-enrol-troubleshoot-settings',
    section: 'students',
    eyebrow: 'פתרון תקלה · שיוך עצמי',
    title: 'איזו הגדרה בודקים אם הרישום העצמי לא עובד?',
    summary: 'אם יש תקלה ברישום העצמי, בודקים בהגדרות השיוך שהאפשרות לרישום משתמשים חדשים פעילה.',
    steps: ['בדקו את „האם לאפשר רישום למשתמשים חדשים?”.'],
    screenshots: [{ src: '27-selfenrol-settings.jpg', caption: 'הגדרות „שיוך עצמי” עם אפשרות הרישום למשתמשים חדשים.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['שיוך עצמי', 'רישום משתמשים חדשים', 'פתרון תקלה'],
    status: 'ready',
  },
  {
    id: 'self-enrol-student',
    section: 'students',
    eyebrow: 'הצטרפות תלמיד',
    title: 'מה התלמיד לוחץ בפעם הראשונה?',
    summary: 'אחרי שהתלמיד מקבל את קישור המרחב ומגיע למסך ההצטרפות, הוא משלים את הרישום למרחב.',
    steps: ['לחצו „רשום אותי”.'],
    screenshots: [{ src: '28-selfenrol-student-view.jpg', caption: 'מסך התלמיד עם הכפתור „רשום אותי”.' }],
    link: { href: MOODLE_HOME, label: 'פתיחת Moodle' },
    keywords: ['רשום אותי', 'קישור למרחב', 'תלמיד'],
    status: 'ready',
  },
  {
    id: 'self-enrol-success',
    section: 'students',
    eyebrow: 'הצטרפות תלמיד',
    title: 'איך יודעים שההרשמה הצליחה?',
    summary: 'אחרי ההרשמה התלמיד רואה הודעת הצלחה ונכנס למרחב.',
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
  ...WIZARD_NEW_FEATURE_SLIDES,
  ...STUDENT_ENROLMENT_SLIDES,
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
  'open-space-content',
  'open-space-confirm',
  'open-space-background-create',
  'open-space-created-notification',
  'open-space-result',
  'wizard-ready-content-search',
  'wizard-clone-my-content',
  'self-enrol-auto',
  'self-enrol-student',
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
