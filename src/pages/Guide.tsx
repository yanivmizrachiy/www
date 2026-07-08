import { useState } from 'react';
import { SafePage } from '@/components/SafePage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  GraduationCap,
  ListChecks,
  BarChart3,
  Activity,
  CheckCircle2,
  Download,
  ExternalLink,
  Wrench,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Home,
  Image as ImageIcon,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Question = {
  id: string;
  title: string;
  short: string;
  steps: string[];
  tip?: string;
};

type Topic = {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  questions: Question[];
};

const TOPICS: Topic[] = [
  {
    id: 'space',
    title: 'פתיחת מרחב',
    icon: BookOpen,
    color: 'bg-blue-500',
    questions: [
      {
        id: 'login',
        title: 'איך נכנסים למרחב הלמידה?',
        short: 'הכניסה למודל של משרד החינוך היא דרך הכתובת moodlemoe.lms.education.gov.il עם שם משתמש וסיסמה מוסדיים. אחרי התחברות רואים בעמוד "מרחבי-הלימוד שלי" את רשימת הקורסים שלך.',
        steps: [
          'פותחים דפדפן אינטרנט',
          'נכנסים לכתובת moodlemoe.lms.education.gov.il',
          'מזינים שם משתמש וסיסמה של משרד החינוך',
          'בעמוד "מרחבי-הלימוד שלי" לוחצים על שם הקורס הרצוי',
        ],
        tip: 'במחשב חדש ייתכן שידרשו אימות דו-שלבי. שמור פרטי חיבור במקום בטוח, אל תרשום סיסמה בקבצים גלויים.',
      },
      {
        id: 'right-course',
        title: 'איך יודעים שנכנסתי לקורס הנכון?',
        short: 'שם הקורס מופיע בכותרת הראשית של העמוד ובסרגל העליון. ההיררכיה מוצגת בפירורי לחם: מחוז/עיר ← בית ספר ← המרחב.',
        steps: [
          'בודקים את הכותרת הראשית בראש העמוד',
          'מוודאים את מחוז/עיר/בית ספר בפירורי הלחם',
          'משווים למידע במערכות המשרד אם יש ספק',
        ],
      },
      {
        id: 'back-home',
        title: 'איך חוזרים לעמוד הראשי של הקורס?',
        short: 'לוחצים על שם הקורס בכותרת העליונה, או בוחרים בלשונית "מרחב־לימוד" בתפריט הקורס.',
        steps: [
          'לוחצים על שם הקורס בסרגל למעלה',
          'או בוחרים לשונית "מרחב־לימוד" בתפריט',
        ],
      },
      {
        id: 'see-units',
        title: 'איך רואים את יחידות הלימוד?',
        short: 'יחידות הלימוד מופיעות בעמוד הבית של הקורס כרשימה. אפשר להחליף בין תצוגת רשימת נושאים לבין סרגל צדדי דרך מתג התצוגה בסרגל.',
        steps: [
          'נכנסים ללשונית "מרחב־לימוד"',
          'מגלגלים בעמוד הבית של הקורס',
          'לוחצים על יחידה כדי להיכנס אליה',
        ],
      },
    ],
  },
  {
    id: 'participants',
    title: 'תלמידים ומשתתפים',
    icon: Users,
    color: 'bg-rose-500',
    questions: [
      {
        id: 'list',
        title: 'איך רואים את רשימת התלמידים?',
        short: 'בתפריט הקורס לוחצים על "משתתפים". תופיע טבלה עם שם פרטי, שם משפחה, שם משתמש (ת"ז), דוא"ל, תפקידים, קבוצות, גישה אחרונה, ומצב.',
        steps: [
          'בתפריט הקורס לוחצים "משתתפים"',
          'הטבלה מציגה את כל המשתמשים הרשומים',
        ],
      },
      {
        id: 'search',
        title: 'איך מחפשים תלמיד מסוים?',
        short: 'בעמוד המשתתפים יש שדה חיפוש בראש הטבלה. אפשר גם לסנן אלפביתית לפי אות פתיחה של שם פרטי או שם משפחה.',
        steps: [
          'פותחים "משתתפים"',
          'מקלידים חלק מהשם בשדה החיפוש',
          'או בוחרים אות בשורת המסננים',
        ],
      },
      {
        id: 'roles',
        title: 'איך רואים תפקידים של משתתפים?',
        short: 'עמודת "תפקידים" בטבלת המשתתפים מציגה את התפקיד של כל אחד: מורה, מורה ללא הרשאות עריכה, תלמיד או אורח. אפשר גם לסנן לפי תפקיד.',
        steps: [
          'פותחים "משתתפים"',
          'מסתכלים על עמודת "תפקידים"',
          'אפשר להשתמש במסנן תפקידים למעלה',
        ],
      },
      {
        id: 'groups',
        title: 'איך רואים קבוצות?',
        short: 'עמודת "קבוצות" בטבלת המשתתפים מציגה לאיזו קבוצה משויך כל תלמיד. אפשר לסנן לפי קבוצה.',
        steps: [
          'פותחים "משתתפים"',
          'מסתכלים על עמודת "קבוצות"',
          'משתמשים במסנן קבוצות אם רוצים לצמצם',
        ],
      },
      {
        id: 'last-access',
        title: 'איך בודקים מתי תלמיד נכנס לאחרונה?',
        short: 'עמודת "גישה אחרונה לקורס" מציגה מתי כל תלמיד נכנס בפעם האחרונה. אפשר למיין את הטבלה לפי עמודה זו.',
        steps: [
          'פותחים "משתתפים"',
          'מסתכלים על עמודת "גישה אחרונה"',
          'לוחצים על כותרת העמודה כדי למיין',
        ],
        tip: 'תלמידים שלא נכנסו זמן רב יופיעו למעלה במיון עולה. גם אפשר לסנן "לא פעילים ליותר מ..." תקופה מסוימת.',
      },
      {
        id: 'download',
        title: 'איך מורידים את רשימת המשתתפים?',
        short: 'מעל טבלת המשתתפים יש כפתור הורדה. אפשר לבחור פורמט: CSV, Excel, ODS, JSON או טבלת HTML.',
        steps: [
          'פותחים "משתתפים"',
          'לוחצים על כפתור ההורדה מעל הטבלה',
          'בוחרים פורמט (Excel מומלץ לניתוח)',
        ],
        tip: 'כדי לייבא רשימה ל-Teacher Hub — מורידים כ-Excel/CSV ומעלים ב"ייבוא נתונים".',
      },
    ],
  },
  {
    id: 'grades',
    title: 'ציונים',
    icon: GraduationCap,
    color: 'bg-amber-500',
    questions: [
      {
        id: 'open-gradebook',
        title: 'איך נכנסים ליומן הציונים?',
        short: 'בתפריט הקורס לוחצים על "ציונים". נפתח יומן הציונים עם טבלת כל התלמידים מול כל פריטי הציון.',
        steps: [
          'בתפריט הקורס לוחצים "ציונים"',
          'נפתח יומן הציונים (Grader report)',
        ],
      },
      {
        id: 'one-task',
        title: 'איך רואים ציונים של תלמיד במשימה מסוימת?',
        short: 'בטבלת יומן הציונים, השורה של התלמיד היא ציוני כל המשימות שלו. חפש את העמודה של המשימה הרצויה כדי לראות את הציון.',
        steps: [
          'פותחים "ציונים"',
          'מוצאים את שורת התלמיד',
          'מוצאים את עמודת המשימה',
          'התא בהצטלבות הוא הציון',
        ],
        tip: 'אם המשימה לא מופיעה כעמודה, ייתכן שהיא מוסתרת בקטגוריה או לא פורסמה עדיין.',
      },
      {
        id: 'all-class',
        title: 'איך רואים את כל הציונים של הכיתה?',
        short: 'יומן הציונים (Grader report) מציג בברירת מחדל את הטבלה המלאה — כל התלמידים מול כל פריטי הציון.',
        steps: [
          'פותחים "ציונים"',
          'מסתכלים על הטבלה המלאה',
          'משתמשים בסינון קבוצות אם רוצים לצמצם לכיתה מסוימת',
        ],
      },
      {
        id: 'missing',
        title: 'איך בודקים מי לא קיבל ציון?',
        short: 'תאים ריקים ביומן הציונים מציגים "—" או ריק. אפשר למיין לפי עמודה של משימה כדי לרכז את הריקים בראש/סוף הטבלה.',
        steps: [
          'פותחים "ציונים"',
          'מוצאים את עמודת המשימה',
          'לוחצים על כותרת העמודה כדי למיין',
          'תאים ריקים = לא קיבלו ציון',
        ],
      },
      {
        id: 'course-total',
        title: 'איך רואים ציון סופי בקורס?',
        short: 'עמודה בשם "Course total" (או "ציון סופי" בעברית) ביומן הציונים מציגה את הציון המצטבר של כל תלמיד בקורס.',
        steps: [
          'פותחים "ציונים"',
          'מגלגלים לימין/שמאל לעמודת "Course total"',
          'הערך הוא הציון הסופי לפי כל פריטי הציון',
        ],
        tip: 'הציון הסופי מחושב לפי הגדרות המשקלים בקורס. אם משהו נראה חסר — יש לבדוק את הגדרות פריטי הציון.',
      },
      {
        id: 'export',
        title: 'איך מייצאים ציונים לאקסל?',
        short: 'בעמוד הציונים בוחרים "יצוא → יצוא לגליון האלקטרוני של Excel". אפשר לבחור אילו פריטים לכלול, וגם אם לצרף משוב.',
        steps: [
          'פותחים "ציונים"',
          'בוחרים בתפריט "יצוא"',
          'לוחצים "יצוא לגליון האלקטרוני של Excel"',
          'בוחרים פריטים, לוחצים "הורדה"',
        ],
        tip: 'אפשר גם ODS, CSV או XML. כדי לייבא ל-Teacher Hub — Excel או CSV מומלצים.',
      },
    ],
  },
  {
    id: 'tasks',
    title: 'משימות והגשות',
    icon: ListChecks,
    color: 'bg-purple-500',
    questions: [
      {
        id: 'see-task',
        title: 'איך רואים משימה במרחב?',
        short: 'משימות מופיעות בעמוד הבית של הקורס בתוך היחידות. לוחצים על שם המשימה כדי להיכנס לעמוד שלה.',
        steps: [
          'נכנסים ל"מרחב־לימוד"',
          'מוצאים את היחידה של המשימה',
          'לוחצים על שם המשימה',
        ],
      },
      {
        id: 'who-submitted',
        title: 'איך בודקים מי הגיש?',
        short: 'בעמוד המשימה לוחצים על "הצג/דרג הגשות". נפתחת טבלה עם כל התלמידים ומצב ההגשה של כל אחד.',
        steps: [
          'נכנסים לעמוד המשימה',
          'לוחצים "הצג/דרג הגשות"',
          'הטבלה מציגה סטטוס הגשה לכל תלמיד',
        ],
      },
      {
        id: 'who-missing',
        title: 'איך רואים מי לא הגיש?',
        short: 'בטבלת ההגשות של המשימה, עמודת "מצב" מציגה "לא הוגש" לתלמידים שעדיין לא שלחו.',
        steps: [
          'פותחים "הצג/דרג הגשות"',
          'מסננים לפי עמודת "מצב"',
          'מבודדים "לא הוגש"',
        ],
      },
      {
        id: 'grade-submission',
        title: 'איך נכנסים לבדיקה של הגשה?',
        short: 'בטבלת ההגשות לוחצים על "דרג" בשורת התלמיד הרצוי. נפתח מסך בדיקה עם הקובץ שהוגש, שדה ציון ושדה משוב.',
        steps: [
          'פותחים "הצג/דרג הגשות"',
          'לוחצים "דרג" ליד התלמיד',
          'ממלאים ציון + משוב',
          'שומרים',
        ],
      },
      {
        id: 'due-date',
        title: 'איך מזהים תאריך הגשה?',
        short: 'בעמוד המשימה מופיע "תאריך יעד" בראש העמוד. גם בטבלת ההגשות רואים אם התלמיד הגיש לפני או אחרי המועד.',
        steps: [
          'פותחים את עמוד המשימה',
          'קוראים את "תאריך יעד"',
          'בטבלת ההגשות: עמודת "זמן הגשה" לעומת "תאריך יעד"',
        ],
      },
    ],
  },
  {
    id: 'reports',
    title: 'דוחות',
    icon: BarChart3,
    color: 'bg-teal-500',
    questions: [
      {
        id: 'where',
        title: 'איפה נמצאים הדוחות?',
        short: 'בתפריט הקורס יש לשונית "דוחות". שם נמצאים כל הדוחות של המרחב.',
        steps: [
          'בתפריט הקורס לוחצים "דוחות"',
          'נפתחת רשימת הדוחות הזמינים',
        ],
      },
      {
        id: 'list',
        title: 'איזה דוחות קיימים במודל?',
        short: 'במודל של משהח יש: יומני מעקב, יומני זמן־אמת, פעילות מרחב־לימוד, השתתפות במרחב־לימוד, השלמות פעילות, ניהול תאריכי פעילויות, ניהול קבוצות בפעילויות, ניהול למידה (משהח), דוח מסכם לבגרות (משהח), ודוח המטלות שלי.',
        steps: [
          'פותחים "דוחות" בתפריט הקורס',
          'קוראים את הרשימה',
          'בוחרים דוח לפי הצורך',
        ],
        tip: 'תוספי משהח ("ניהול למידה", "דוח מסכם לבגרות") מופיעים רק במרחבים שהוגדרו להם.',
      },
      {
        id: 'activity',
        title: 'איך פותחים דוח פעילות?',
        short: 'ב"דוחות" בוחרים "פעילות מרחב־לימוד". הדוח מציג לצד כל פעילות כמה צפיות ופעולות בוצעו בה.',
        steps: [
          'פותחים "דוחות"',
          'בוחרים "פעילות מרחב־לימוד"',
        ],
      },
      {
        id: 'participation',
        title: 'איך פותחים דוח השתתפות?',
        short: 'ב"דוחות" בוחרים "השתתפות במרחב־לימוד". אפשר להגדיר פעילות ספציפית, טווח זמן, תפקיד וקבוצה.',
        steps: [
          'פותחים "דוחות"',
          'בוחרים "השתתפות במרחב־לימוד"',
          'מגדירים פעילות + טווח זמן',
          'לוחצים "הצג"',
        ],
      },
      {
        id: 'completion',
        title: 'איך פותחים דוח השלמות פעילות?',
        short: 'ב"דוחות" בוחרים "דוח השלמות פעילות". הדוח מציג מטריצה של תלמידים מול פעילויות עם סימוני השלמה.',
        steps: [
          'פותחים "דוחות"',
          'בוחרים "דוח השלמות פעילות"',
          'רואים את המטריצה המלאה',
        ],
      },
      {
        id: 'which',
        title: 'איך יודעים איזה דוח מתאים לשאלה שלי?',
        short: 'לשאלה "מי צפה במה" — פעילות מרחב־לימוד. לשאלה "מי סיים מה" — השלמות פעילות. לשאלה "מה קרה מתי" — יומני מעקב. לשאלה "כמה תלמידים ואיזה ממוצע" — ניהול למידה (משהח).',
        steps: [
          'מזהים את סוג השאלה',
          'בוחרים דוח לפי מיפוי השאלות',
          'אם עדיין לא ברור — פותחים את הדוח וממלאים סינון בסיסי',
        ],
      },
    ],
  },
  {
    id: 'logs',
    title: 'יומני פעילות',
    icon: Activity,
    color: 'bg-cyan-500',
    questions: [
      {
        id: 'open',
        title: 'איך פותחים יומני מעקב?',
        short: 'ב"דוחות" בוחרים "יומני מעקב". נפתחת טבלה עם כל אירועי המרחב וסרגל מסננים מעליה.',
        steps: [
          'פותחים "דוחות"',
          'בוחרים "יומני מעקב"',
          'ממלאים מסננים לפי הצורך',
          'לוחצים "הצג"',
        ],
      },
      {
        id: 'by-student',
        title: 'איך מסננים לפי תלמיד?',
        short: 'במסך יומני המעקב יש שדה "משתמש". בוחרים בו את התלמיד הרצוי מהרשימה, ואז לוחצים "הצג".',
        steps: [
          'פותחים "יומני מעקב"',
          'בשדה "משתמש" בוחרים תלמיד',
          'לוחצים "הצג"',
        ],
      },
      {
        id: 'by-date',
        title: 'איך מסננים לפי תאריך?',
        short: 'שדה "תאריך" מאפשר לבחור יום ספציפי או "כל הימים". להצגה מדויקת יותר, בוחרים יום.',
        steps: [
          'פותחים "יומני מעקב"',
          'בשדה "תאריך" בוחרים יום',
          'לוחצים "הצג"',
        ],
      },
      {
        id: 'by-activity',
        title: 'איך מסננים לפי פעילות?',
        short: 'שדה "פעילות/משאב" מאפשר לבחור רכיב ספציפי במרחב (למשל בוחן/מטלה). אפשר גם לסנן לפי סוג פעולה.',
        steps: [
          'פותחים "יומני מעקב"',
          'בשדה "פעילות" בוחרים רכיב',
          'בשדה "פעולה" בוחרים יצירה/תצוגה/עדכון/מחיקה',
          'לוחצים "הצג"',
        ],
      },
      {
        id: 'download',
        title: 'איך מורידים Logs ל־CSV / JSON / Excel?',
        short: 'אחרי שהדוח מוצג, בסוף העמוד יש כפתור הורדה. אפשר לבחור פורמטים: CSV, Excel, ODS, טבלת HTML או JSON.',
        steps: [
          'ממלאים סינון ולוחצים "הצג"',
          'מגלגלים לסוף העמוד',
          'לוחצים על תפריט ההורדה',
          'בוחרים פורמט (Excel/CSV/JSON)',
        ],
        tip: 'CSV/JSON עדיפים על PDF לצורך ייבוא ל-Teacher Hub.',
      },
      {
        id: 'practice-time',
        title: 'איך משתמשים ביומני פעילות כדי להבין זמן תרגול?',
        short: 'זמן תרגול מחושב מהפערים בין אירועי כניסה ויציאה של תלמיד בלוגים. Teacher Hub עושה זאת אוטומטית: כשיש לוגים אמיתיים, הוא מציג זמן תרגול לפי 24 שעות / 7 ימים / 30 ימים / טווח מותאם.',
        steps: [
          'מורידים לוגים ל-CSV/JSON ומעלים ל-Teacher Hub ב"ייבוא נתונים"',
          'או מפעילים סנכרון אוטומטי אם קיים token',
          'עוברים ל"פעילות/זמנים" ב-Teacher Hub',
          'בוחרים פרק זמן ורואים זמני תרגול',
        ],
        tip: 'ללא לוגים אמיתיים אין זמן תרגול. Teacher Hub לא יציג מספרים משוערים או דמו.',
      },
    ],
  },
  {
    id: 'completion',
    title: 'השלמות פעילות',
    icon: CheckCircle2,
    color: 'bg-emerald-500',
    questions: [
      {
        id: 'who-done',
        title: 'איך רואים מי השלים פעילות?',
        short: 'ב"דוחות → דוח השלמות פעילות" רואים מטריצה של תלמידים מול פעילויות. סימון "הושלם" מופיע לתלמידים שסיימו.',
        steps: [
          'פותחים "דוחות"',
          'בוחרים "דוח השלמות פעילות"',
          'מסתכלים על העמודה של הפעילות',
          'מזהים סימוני "הושלם"',
        ],
      },
      {
        id: 'who-not-done',
        title: 'איך רואים מי לא השלים?',
        short: 'באותה מטריצה, תלמידים שלא השלימו יופיעו ב"לא הושלם" או ריק. אפשר לסנן אלפביתית כדי למקד תלמיד.',
        steps: [
          'פותחים "דוח השלמות פעילות"',
          'מסתכלים על עמודת הפעילות',
          'מזהים "לא הושלם" או תא ריק',
        ],
      },
      {
        id: 'open',
        title: 'איך פותחים דוח השלמות פעילות?',
        short: 'בתפריט "דוחות" של הקורס בוחרים "דוח השלמות פעילות". אפשר לסנן לפי סוג רכיב (H5P, דפים, בחנים, כתובות).',
        steps: [
          'פותחים "דוחות"',
          'בוחרים "דוח השלמות פעילות"',
          'בוחרים סוג רכיב אם רוצים',
          'מסתכלים במטריצה',
        ],
      },
      {
        id: 'download-csv',
        title: 'איך מורידים CSV UTF-8?',
        short: 'מעל טבלת השלמות הפעילות יש שני כפתורי הורדה: "הורדה בתסדיר גיליון אלקטרוני CSV UTF-8" ו"הורדה בתסדיר גיליון אלקטרוני אקסל CSV".',
        steps: [
          'פותחים "דוח השלמות פעילות"',
          'לוחצים על כפתור הורדה בראש הטבלה',
          'בוחרים CSV UTF-8',
        ],
        tip: 'CSV UTF-8 שומר תווי עברית נכון. הקובץ מתאים לייבוא ל-Teacher Hub.',
      },
      {
        id: 'vs-grade',
        title: 'מה ההבדל בין השלמה לבין ציון?',
        short: 'השלמה = האם התלמיד סיים את הפעילות (כן/לא). ציון = כמה טוב הוא סיים (מספר/אחוז/אות). ההשלמה מוגדרת בהגדרות מעקב השלמה של כל פעילות.',
        steps: [
          'השלמה נקבעת ב"תנאי השלמה" של הפעילות',
          'ציון נמצא ביומן הציונים',
          'תלמיד יכול להשלים פעילות גם עם ציון נמוך',
        ],
      },
    ],
  },
  {
    id: 'export',
    title: 'הורדת Excel / CSV',
    icon: Download,
    color: 'bg-indigo-500',
    questions: [
      {
        id: 'gradebook',
        title: 'איך מורידים יומן ציונים לאקסל?',
        short: 'בציונים → יצוא → יצוא לגליון האלקטרוני של Excel. בוחרים אילו פריטים לכלול, ולוחצים "הורדה".',
        steps: [
          'פותחים "ציונים"',
          'בוחרים "יצוא"',
          'בוחרים "יצוא לגליון האלקטרוני של Excel"',
          'מסמנים פריטים, לוחצים "הורדה"',
        ],
      },
      {
        id: 'logs',
        title: 'איך מורידים Logs?',
        short: 'ב"דוחות → יומני מעקב", ממלאים סינון ולוחצים "הצג". בסוף העמוד לוחצים על תפריט ההורדה ובוחרים CSV / Excel / JSON.',
        steps: [
          'פותחים "יומני מעקב"',
          'מסננים לפי צורך',
          'לוחצים "הצג"',
          'בסוף העמוד בוחרים פורמט הורדה',
        ],
      },
      {
        id: 'completion',
        title: 'איך מורידים השלמות פעילות?',
        short: 'ב"דוחות → דוח השלמות פעילות" בוחרים הורדה כ-CSV UTF-8 (מומלץ) או CSV Excel.',
        steps: [
          'פותחים "דוח השלמות פעילות"',
          'לוחצים על כפתור הורדה',
          'בוחרים CSV UTF-8',
        ],
      },
      {
        id: 'participants',
        title: 'איך מורידים רשימת משתתפים?',
        short: 'ב"משתתפים", מעל הטבלה יש כפתור הורדה. בוחרים בפורמט: CSV, Excel, ODS, JSON, HTML.',
        steps: [
          'פותחים "משתתפים"',
          'לוחצים כפתור הורדה מעל הטבלה',
          'בוחרים פורמט',
        ],
      },
      {
        id: 'which-for-hub',
        title: 'איזה קובץ מתאים לייבוא ל־Teacher Hub?',
        short: 'Teacher Hub מזהה 4 סוגי דוחות: משתתפים, ציונים, יומני מעקב (Logs), השלמות פעילות. מומלץ Excel או CSV. הקובץ צריך לכלול את שורת הכותרות.',
        steps: [
          'מורידים ממודל את הדוח הרצוי ב-Excel/CSV',
          'נכנסים ל-Teacher Hub → "ייבוא נתונים"',
          'מעלים את הקובץ',
          'המערכת מזהה את סוג הדוח לפי הכותרות',
          'לוחצים "אשר וייבא"',
        ],
        tip: 'ניהול למידה של משהח לא נתמך עדיין בייבוא ישיר — Roadmap.',
      },
      {
        id: 'no-api',
        title: 'מה עושים אם אין token או סנכרון אוטומטי?',
        short: 'משתמשים במסלול הקבצים: מורידים ידנית את הדוחות ממודל ומעלים ל-Teacher Hub דרך "ייבוא נתונים". אין ממציאים נתונים.',
        steps: [
          'מורידים את הדוחות הרצויים ממודל (Excel/CSV)',
          'נכנסים ל-Teacher Hub → "ייבוא נתונים"',
          'מעלים את הקבצים',
          'הסטטוס יסומן "יובא מקובץ Moodle"',
        ],
        tip: 'אם אין API ואין קובץ תקין — Teacher Hub יסמן "חסום / נדרש מקור אמת" ולא יציג מספרים.',
      },
    ],
  },
  {
    id: 'moe-analytics',
    title: 'ניהול למידה',
    icon: BarChart3,
    color: 'bg-fuchsia-500',
    questions: [
      {
        id: 'what',
        title: 'מה זה ניהול למידה?',
        short: '"ניהול למידה" הוא לוח מחוונים אנליטי ייחודי של משרד החינוך, שקיים בתוך מרחב ה-Moodle שלך. הוא מציג בעיצוב גרפי את נתוני הלמידה בכיתה — ממוצע, השלמה, וגרפים אוטומטיים.',
        steps: [
          'תוסף של משהח (לא של Moodle העולמי)',
          'קיים במרחב Moodle עצמו, לא ב-Teacher Hub',
          'מציג KPIs + 9 גרפים אוטומטיים',
        ],
      },
      {
        id: 'where',
        title: 'איפה מוצאים את ניהול למידה?',
        short: 'בתפריט "דוחות" של הקורס, בין הדוחות מופיע פריט בשם "ניהול למידה" (אם המרחב מוגדר לתמוך בו).',
        steps: [
          'בתפריט הקורס לוחצים "דוחות"',
          'בוחרים "ניהול למידה" מהרשימה',
          'הלוח נטען עם כל הכרטיסים והגרפים',
        ],
      },
      {
        id: 'contents',
        title: 'מה רואים בלוח הזה?',
        short: 'בראש הלוח 4 כרטיסי KPI: ממוצע ציונים, אחוז השלמה כולל, מספר תלמידים, מספר תלמידים שלא נכנסו. מתחת 9 גרפים: יחידות/תלמידים עם ממוצע/השלמה הגבוהים והנמוכים, ופעילויות עם ציון מתחת לסף.',
        steps: [
          'קוראים את ה-KPIs למעלה',
          'עוברים על 9 הגרפים',
          'לוחצים על גרף כדי לפתוח אותו במלואו',
        ],
      },
      {
        id: 'download-csv',
        title: 'איך מורידים גרף כ־CSV?',
        short: 'לכל גרף בלוח יש תפריט הורדה עם אפשרות CSV. הקובץ מכיל את הנתונים הגולמיים של הגרף.',
        steps: [
          'מתייצבים על הגרף הרצוי',
          'לוחצים על תפריט ההורדה של הגרף',
          'בוחרים CSV',
        ],
      },
      {
        id: 'download-image',
        title: 'איך מורידים גרף כתמונה?',
        short: 'באותו תפריט הורדה של הגרף יש אפשרות SVG (וקטור) או PNG (תמונה). SVG שומר איכות גם בהגדלה.',
        steps: [
          'לוחצים על תפריט ההורדה של הגרף',
          'בוחרים SVG או PNG',
        ],
        tip: 'להצגה בישיבות צוות — PNG פשוט יותר. להטמעה במסמך רשמי — SVG.',
      },
      {
        id: 'why-not-hub',
        title: 'למה Teacher Hub עדיין לא שולף את זה אוטומטית?',
        short: '"ניהול למידה" הוא תוסף פנימי של משהח, שאין לו endpoint רשמי ב-Moodle Web Services הסטנדרטי. לכן Teacher Hub לא יכול לשלוף אותו אוטומטית עדיין. זו יכולת Roadmap — אם משהח יחשוף API עתידי, Teacher Hub ישקף אותה.',
        steps: [
          'כרגע — משתמשים ב"ניהול למידה" ישירות במודל',
          'אפשר להוריד CSV מגרפים ולנתח במקום אחר',
          'ב-Teacher Hub — נסמן "Roadmap" באזור הזה',
        ],
      },
    ],
  },
  {
    id: 'lti',
    title: 'כלי חיצוני / LTI',
    icon: ExternalLink,
    color: 'bg-slate-500',
    questions: [
      {
        id: 'enter',
        title: 'איך נכנסים לכלי או שירות LTI חיצוני?',
        short: 'בתפריט "אפשרויות נוספות" של הקורס בוחרים "כלי או שירות LTI חיצוני". נפתח מסך ניהול הכלים החיצוניים של הקורס.',
        steps: [
          'בתפריט הקורס לוחצים "אפשרויות נוספות"',
          'בוחרים "כלי או שירות LTI חיצוני"',
        ],
      },
      {
        id: 'add-new',
        title: 'איך מוסיפים כלי חדש?',
        short: 'במסך ניהול הכלים לוחצים על הכפתור "Add tool". ממלאים את פרטי הכלי (Tool URL, שם, תיאור, הגדרות פרטיות) ושומרים.',
        steps: [
          'פותחים "כלי או שירות LTI חיצוני"',
          'לוחצים "Add tool"',
          'ממלאים Tool URL + שם',
          'מגדירים הרשאות פרטיות',
          'שומרים',
        ],
      },
      {
        id: 'add-tool',
        title: 'מה זה Add tool?',
        short: '"Add tool" הוא הכפתור שמפעיל טופס להוספת כלי LTI חדש למרחב. אחרי מילוי הפרטים, הכלי יופיע ברשימת הכלים הזמינים במרחב.',
        steps: [
          'לוחצים "Add tool"',
          'ממלאים פרטים',
          'הכלי נוסף לרשימה',
        ],
      },
      {
        id: 'chooser',
        title: 'מה זה Show in activity chooser?',
        short: 'אפשרות שקובעת אם הכלי יופיע כאפשרות ברשימת "הוסף פעילות או משאב" של הקורס. אם מסומן, מורים יוכלו להוסיף אותו במהירות ליחידות.',
        steps: [
          'הגדרה בעמוד הכלי',
          'מסומן = מופיע ברשימת הוספת פעילות',
          'לא מסומן = מוסתר אך זמין למנהל',
        ],
      },
      {
        id: 'usage',
        title: 'מה זה Usage count?',
        short: 'מונה שמראה כמה פעמים הכלי הוסף כפעילות במרחב. עוזר לזהות כלים פופולריים או כלים שאף אחד לא משתמש בהם.',
        steps: [
          'מסתכלים בעמודת Usage count בטבלת הכלים',
          'מונה גבוה = כלי נמצא בשימוש',
          'מונה 0 = לא נמצא בשימוש',
        ],
      },
      {
        id: 'pending',
        title: 'מה אומר מצב בהמתנה?',
        short: 'כלי חדש שנוסף עשוי להישאר במצב "בהמתנה" עד שמנהל האתר של משהח יאשר אותו. במצב זה הכלי מופיע ברשימה אבל אינו זמין למורים לשימוש בפועל.',
        steps: [
          'מוודאים במסך ניהול הכלים את מצב הכלי',
          'אם מסומן "בהמתנה" — פונים למנהל הבית ספרי',
          'רק אחרי אישור — הכלי הופך פעיל',
        ],
      },
      {
        id: 'really-connected',
        title: 'איך יודעים שהכלי באמת מחובר ולא רק מופיע ברשימה?',
        short: 'כלי שמופיע ברשימת LTI לא בהכרח מחובר בהצלחה. חיבור אמיתי דורש: LTI launch תקין, session תקף, site_id/course_id תקפים, ואם משתמשים ב-Web Services — הרשאות מאומתות.',
        steps: [
          'לוחצים על הכלי במרחב ומנסים לפתוח פעילות שמשתמשת בו',
          'מוודאים שהכלי נטען עם הזהות שלך (שם, קורס)',
          'ב-Teacher Hub — בודקים את "סטטוס חיבור" בכניסה',
        ],
        tip: 'אם הכלי נפתח למסך שגיאה או ל-login חיצוני — הוא לא באמת מחובר.',
      },
    ],
  },
  {
    id: 'hub',
    title: 'שימוש ב־Moodle Teacher Hub',
    icon: Wrench,
    color: 'bg-primary',
    questions: [
      {
        id: 'what',
        title: 'מה הכלי עושה?',
        short: 'Teacher Hub הוא כלי נתונים חיצוני שמורה פותח מתוך Moodle. הוא מזהה את המורה, הקורס והמרחב, ומרכז למקום אחד: תלמידים, ציונים, לוגים, השלמות פעילות, זמני תרגול ודוחות — אך ורק של המרחב הספציפי שלך.',
        steps: [
          'זוהה דרך LTI launch',
          'מציג רק נתונים של הקורס שממנו נפתח',
          'לא מחליף את Moodle — מוסיף שכבת ניתוח',
        ],
      },
      {
        id: 'how-open',
        title: 'איך נכנסים לכלי מתוך Moodle?',
        short: 'צריך שהכלי יותקן במרחב כ-External Tool (LTI). המורה לוחץ עליו מתוך יחידה בקורס, ו-Moodle שולח אליו בקשה חתומה עם הזהות שלך.',
        steps: [
          'מנהל הבית ספרי מוסיף את הכלי דרך "כלי או שירות LTI חיצוני"',
          'בקורס — מוסיפים פעילות "כלי חיצוני"',
          'לוחצים על הפעילות מתוך היחידה',
          'Teacher Hub נפתח עם הזהות שלך',
        ],
      },
      {
        id: 'auto-data',
        title: 'אילו נתונים הכלי שולף אוטומטית?',
        short: 'אם יש token של Web Services והרשאות: משתתפים (core_enrol_get_enrolled_users), ציונים (gradereport_user_get_grade_items), משימות (mod_assign_get_assignments), לוגים (core_report_get_log_data), והשלמות פעילות (core_completion_get_activities_completion_status).',
        steps: [
          'הסנכרון האוטומטי דורש token אמיתי',
          'הנתונים נשמרים ב-Supabase לפי site+course',
          'אם token לא מוגדר — משתמשים במסלול הקבצים',
        ],
      },
      {
        id: 'no-token',
        title: 'מה עושים כשאין API/token?',
        short: 'עוברים למסלול הקבצים: מורידים דוחות ידנית ממודל (ציונים, לוגים, השלמות, משתתפים) ומעלים ל-Teacher Hub דרך "ייבוא נתונים". הסטטוס יסומן "יובא מקובץ Moodle".',
        steps: [
          'ממודל — מורידים את הדוח הרלוונטי',
          'ב-Teacher Hub — נכנסים ל"ייבוא נתונים"',
          'מעלים את הקובץ',
          'המערכת מזהה סוג ואומתת עמודות',
        ],
      },
      {
        id: 'import',
        title: 'איך מייבאים קובץ Moodle אמיתי?',
        short: 'ב-Teacher Hub נכנסים לעמוד "ייבוא נתונים", בוחרים קובץ Excel/CSV שהורדת ממודל, המערכת מזהה את סוג הדוח לפי הכותרות ומציגה preview. אחרי אישור — הקובץ נשמר במסד.',
        steps: [
          'ב-Teacher Hub → "ייבוא נתונים"',
          'לוחצים "בחר קובץ Moodle"',
          'המערכת מזהה סוג דוח (משתתפים/ציונים/לוגים/השלמות)',
          'רואים preview של 10 שורות ראשונות',
          'לוחצים "אשר וייבא נתונים"',
        ],
        tip: 'אפשר גם להדביק טבלה (Copy-Paste) במקום להעלות קובץ.',
      },
      {
        id: 'see-reports',
        title: 'איך רואים דוחות?',
        short: 'ב-Teacher Hub נכנסים ל"דוחות". יש שם 6 כרטיסי דוח: תלמידים, ציונים, משימות, פעילות, זמני תרגול, פערים. הם מבוססים על הנתונים האמיתיים שנשלפו/יובאו.',
        steps: [
          'לוחצים "דוחות" בסרגל הצדדי',
          'בוחרים דוח לפי מה שרוצים לדעת',
          'הדוח מציג רק נתונים אמיתיים של הקורס שלך',
        ],
      },
      {
        id: 'blocked',
        title: 'איך מבינים אם משהו חסום?',
        short: 'Teacher Hub מציג שלושה סטטוסים ברורים: "מסונכרן אוטומטית" = API עובד. "יובא מקובץ Moodle" = הועלה קובץ. "חסום / נדרש מקור אמת" = אין API ואין קובץ תקין — לא יוצגו מספרים.',
        steps: [
          'בכל מסך נתונים בודקים את פס הסטטוס למעלה',
          'ירוק = מסונכרן; כחול = יובא מקובץ; אדום/כתום = חסום',
          'אם חסום — עוברים ל"ייבוא נתונים" עם קובץ אמיתי',
        ],
      },
    ],
  },
  {
    id: 'troubleshoot',
    title: 'פתרון תקלות',
    icon: AlertTriangle,
    color: 'bg-orange-500',
    questions: [
      {
        id: 'no-open',
        title: 'מה עושים אם הכלי לא נפתח?',
        short: 'ראשית, מוודאים שאתה נכנס דרך פעילות במרחב Moodle (לא ישירות דרך URL). אם הכלי נפתח כדף שגיאה — פונים למנהל הבית ספרי כדי לוודא שההתקנה הושלמה ואושרה.',
        steps: [
          'סוגרים את החלון וחוזרים למרחב Moodle',
          'לוחצים שוב על הפעילות שמפעילה את הכלי',
          'אם עדיין לא נפתח — פונים למנהל הבית ספרי',
        ],
      },
      {
        id: 'in-list-not-connected',
        title: 'מה עושים אם הכלי מופיע ב־LTI אבל לא מחובר?',
        short: 'הכלי עשוי להיות במצב "בהמתנה" עד אישור. גם אם מאושר, ייתכן שהגדרות ה-Tool URL שגויות. פונים למנהל הבית ספרי כדי לבדוק את מצב הכלי ואת פרטי ההתקנה.',
        steps: [
          'בודקים את מצב הכלי במסך ניהול LTI',
          'אם "בהמתנה" — פונים למנהל לאישור',
          'אם מאושר אך לא עובד — בודקים Tool URL בהגדרות',
        ],
      },
      {
        id: 'no-perms',
        title: 'מה עושים אם אין הרשאות?',
        short: 'הרשאות LTI ו-Web Services נקבעות ברמת מנהל האתר של משהח. אם חסרות הרשאות, פונים למנהל המערכת עם פירוט מה חסום.',
        steps: [
          'מזהים בדיוק איזו פעולה חסומה',
          'צילום מסך של הודעת השגיאה',
          'פונים למנהל האתר של משהח',
        ],
      },
      {
        id: 'no-token',
        title: 'מה עושים אם אין token?',
        short: 'ללא token של Web Services, אין סנכרון אוטומטי. עוברים למסלול הקבצים: מורידים דוחות ידנית ממודל ומעלים ל-Teacher Hub. כל הפונקציונליות זמינה, רק ידנית.',
        steps: [
          'מורידים את הדוחות ממודל (Excel/CSV)',
          'מעלים ל-Teacher Hub → "ייבוא נתונים"',
          'עובדים עם הנתונים כרגיל',
        ],
      },
      {
        id: 'file-not-recognized',
        title: 'מה עושים אם הקובץ לא מזוהה?',
        short: 'Teacher Hub מזהה קבצים לפי כותרות העמודות. אם הקובץ לא מזוהה, ייתכן שחסרות כותרות או שהפורמט אינו CSV/Excel/ODS. יש להוריד שוב ממודל בפורמט Excel או CSV.',
        steps: [
          'מוודאים שהקובץ הוא CSV/Excel/ODS',
          'מוודאים שהשורה הראשונה היא כותרות',
          'מורידים שוב ממודל בפורמט Excel',
          'מעלים שוב ל-Teacher Hub',
        ],
      },
      {
        id: 'no-image',
        title: 'מה עושים אם אין תמונה במדריך?',
        short: 'עד שיוזנו תמונות אמיתיות ומאושרות, המדריך מציג placeholder: "כאן ייכנס צילום אמיתי מתוך Moodle". זה מכוון — לא מציגים תמונות מזויפות או stock.',
        steps: [
          'רואים את ה-placeholder ומבינים שזה מכוון',
          'התמונה תיתוסף אחרי טשטוש פרטים אישיים ואישור יניב',
          'אין להעלות תמונה זמנית שאינה ממודל אמיתי',
        ],
      },
      {
        id: 'personal-info',
        title: 'מה עושים אם רואים מידע אישי בצילום?',
        short: 'אין לפרסם צילום עם שמות תלמידים, ת"ז, דוא"ל או ציונים אישיים גלויים. פונים ליניב עם פרטי הצילום כדי שיטשטש או יסיר, ומסמנים את התמונה כ"דורש טשטוש".',
        steps: [
          'מזהים את המידע האישי בצילום',
          'פונים ליניב עם קישור/מזהה של הצילום',
          'הצילום יסומן "דורש טשטוש" עד לתיקון',
          'לא משתפים את המדריך בגרסה הזו עד לפתרון',
        ],
      },
    ],
  },
];

type View = 'cover' | 'topics' | 'questions' | 'answer';

const HEADER_LINE = 'הדרכה במחוז ירושלים והעיר ירושלים, מנח״י, בהובלת איילת קריספין';
const YANIV_LINE = 'האתר מנוהל ע״י יניב רז';
const BIG_TITLE = 'המדריך המלא למורים — מרחב הלמידה במערכת המודל של משרד החינוך';

export default function Guide() {
  const [view, setView] = useState<View>('cover');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);

  const topic = topicId ? TOPICS.find(t => t.id === topicId) ?? null : null;
  const question =
    topic && questionId ? topic.questions.find(q => q.id === questionId) ?? null : null;

  function openTopics() {
    setTopicId(null);
    setQuestionId(null);
    setView('topics');
  }

  function openTopic(id: string) {
    setTopicId(id);
    setQuestionId(null);
    setView('questions');
  }

  function openQuestion(id: string) {
    setQuestionId(id);
    setView('answer');
  }

  function backToTopics() {
    setTopicId(null);
    setQuestionId(null);
    setView('topics');
  }

  function backToQuestions() {
    setQuestionId(null);
    setView('questions');
  }

  function backToCover() {
    setTopicId(null);
    setQuestionId(null);
    setView('cover');
  }

  // Cover
  if (view === 'cover') {
    return (
      <SafePage title="מדריך למורה" description="מדריך הדרכה חיה למרחב הלמידה במודל של משרד החינוך.">
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-10 py-12">
          <div className="space-y-2 max-w-3xl">
            <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed">
              {HEADER_LINE}
            </p>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              {YANIV_LINE}
            </p>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight max-w-4xl">
            {BIG_TITLE}
          </h1>

          <Button
            size="lg"
            onClick={openTopics}
            className="h-16 px-16 text-2xl font-black gap-3 shadow-luxury"
          >
            כניסה
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <p className="text-xs text-slate-400 font-medium mt-6">
            {TOPICS.length} נושאים · עברית · RTL · תמונות אמיתיות ממודל (בהכנה)
          </p>
        </div>
      </SafePage>
    );
  }

  // Topics
  if (view === 'topics') {
    return (
      <SafePage title="בחירת נושא" description="בחרו נושא מהמדריך כדי לראות את השאלות והתשובות.">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900">בחירת נושא</h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                כל נושא כולל שאלות נפוצות עם הסבר פשוט ומה ללחוץ.
              </p>
            </div>
            <Button variant="outline" onClick={backToCover} className="gap-2">
              <Home className="h-4 w-4" />
              חזרה לעמוד הראשי
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => openTopic(t.id)}
                  className="group text-right rounded-2xl border-2 border-slate-100 bg-white hover:border-primary/60 hover:shadow-luxury transition-all p-6 flex items-center gap-5"
                >
                  <div
                    className={cn(
                      'p-4 rounded-2xl text-white shadow-md shrink-0 group-hover:scale-110 transition-transform',
                      t.color
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-black text-slate-900 leading-tight">
                      {t.title}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-1">
                      {t.questions.length} שאלות
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </SafePage>
    );
  }

  // Questions for a topic
  if (view === 'questions' && topic) {
    const Icon = topic.icon;
    return (
      <SafePage title={topic.title} description={`שאלות נפוצות בנושא ${topic.title}.`}>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-2xl text-white shadow-md shrink-0', topic.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{topic.title}</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  {topic.questions.length} שאלות · בחרו שאלה כדי לראות תשובה מלאה.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={backToTopics} className="gap-2">
                <Layers className="h-4 w-4" />
                חזרה לנושאים
              </Button>
              <Button variant="ghost" onClick={backToCover} className="gap-2">
                <Home className="h-4 w-4" />
                עמוד ראשי
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topic.questions.map(q => (
              <button
                key={q.id}
                onClick={() => openQuestion(q.id)}
                className="group text-right rounded-xl border-2 border-slate-100 bg-white hover:border-primary/60 hover:shadow-md transition-all p-5 flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="text-base font-bold text-slate-900 leading-relaxed">
                    {q.title}
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </SafePage>
    );
  }

  // Answer
  if (view === 'answer' && topic && question) {
    const Icon = topic.icon;
    const idx = topic.questions.findIndex(q => q.id === question.id);
    const prevQ = idx > 0 ? topic.questions[idx - 1] : null;
    const nextQ = idx < topic.questions.length - 1 ? topic.questions[idx + 1] : null;

    return (
      <SafePage title={question.title} description={`תשובה בנושא ${topic.title}.`}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <button onClick={backToCover} className="hover:text-primary transition-colors">
                עמוד ראשי
              </button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={backToTopics} className="hover:text-primary transition-colors">
                נושאים
              </button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={backToQuestions} className="hover:text-primary transition-colors">
                {topic.title}
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={backToQuestions} className="gap-2">
                <Layers className="h-4 w-4" />
                חזרה לשאלות
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-luxury overflow-hidden">
            <div className={cn('h-2 w-full', topic.color)} />
            <CardContent className="p-8 space-y-8">
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-xl text-white shrink-0', topic.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {topic.title}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 leading-tight">
                    {question.title}
                  </h1>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  תשובה קצרה
                </h3>
                <p className="text-slate-700 leading-relaxed text-base font-medium">
                  {question.short}
                </p>
              </section>

              <section className="space-y-3 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  מה ללחוץ
                </h3>
                <ol className="space-y-3">
                  {question.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={cn(
                          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5 shadow-sm',
                          topic.color
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700 leading-relaxed pt-1">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  צילום
                </h3>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-slate-50 flex flex-col items-center gap-3">
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-black text-slate-500">
                    כאן ייכנס צילום אמיתי מתוך Moodle
                  </p>
                  <p className="text-xs text-slate-400 font-medium max-w-md leading-relaxed">
                    צילום אמיתי יתווסף לאחר טשטוש פרטים אישיים ואישור יניב.
                  </p>
                </div>
              </section>

              {question.tip && (
                <section className="space-y-2 bg-primary/5 rounded-2xl p-5 border border-primary/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary">
                    טיפ
                  </h3>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {question.tip}
                  </p>
                </section>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => prevQ && openQuestion(prevQ.id)}
              disabled={!prevQ}
              className="gap-2 font-bold"
            >
              <ChevronRight className="h-4 w-4" />
              שאלה קודמת
            </Button>

            <div className="text-xs font-bold text-muted-foreground">
              שאלה {idx + 1} מתוך {topic.questions.length}
            </div>

            <Button
              variant="default"
              onClick={() => nextQ && openQuestion(nextQ.id)}
              disabled={!nextQ}
              className="gap-2 font-bold"
            >
              שאלה הבאה
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SafePage>
    );
  }

  // Fallback — shouldn't reach here
  return (
    <SafePage title="מדריך למורה" description="">
      <div className="text-center py-20">
        <Button onClick={backToCover}>חזרה לעמוד הראשי</Button>
      </div>
    </SafePage>
  );
}
