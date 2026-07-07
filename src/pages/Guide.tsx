import React, { useState } from 'react';
import { SafePage } from '@/components/SafePage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Users,
  GraduationCap,
  ListChecks,
  FileSpreadsheet,
  Activity,
  BarChart3,
  Download,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOPICS = [
  {
    id: 'intro',
    title: 'מה זה Teacher Hub?',
    icon: BookOpen,
    color: 'bg-blue-500',
    short: 'הכלי שעוזר לך לנהל נתונים מ-Moodle בקלות',
    content: `
      <p class="mb-4">Teacher Hub הוא כלי ניהול נתונים שפותח במיוחד עבור מורים במערכת Moodle. הכלי מאפשר לך לראות, לנתח ולייצא נתונים מהקורס שלך ב-Moodle — בלי לעבור בין מסכים שונים.</p>
      <p class="mb-4">הכלי פותח מתוך Moodle ומקבל את הזהות וההרשאות שלך באופן אוטומטי. אין צורך בססמה נוספת — הכל מבוסס על LTI.</p>
      <p class="mb-4"><strong>מה אפשר לעשות כאן:</strong></p>
      <ul class="list-disc pr-5 space-y-1 mb-4">
        <li>לראות את כל התלמידים בקורס</li>
        <li>לעקוב אחר הציונים וההישגים</li>
        <li>לראות מי השלים משימות ומי לא</li>
        <li>לנתח זמני פעילות ולמידה</li>
        <li>לייצא דוחות לאקסל</li>
        <li>לקבל התראות על נתונים חסרים</li>
      </ul>
    `,
    screenshot: '<!-- תמונת מסך: מרכז המורה פתוח מתוך Moodle, רואים את ה-sidebar ואת הכותרת שלום [שם המורה] -->',
    steps: null,
    tips: [
      'הכלי עובד רק כשפותחים אותו מתוך Moodle — לא דרך כתובת ישירה',
      'כל הנתונים מסוננים לפי הקורס שלך בלבד',
    ],
  },
  {
    id: 'navigation',
    title: 'ניווט במערכת',
    icon: Activity,
    color: 'bg-emerald-500',
    short: 'איך למצוא את מה שצריך בקלות',
    content: `
      <p class="mb-4">הסרגל הצדדי (מימין) מכיל את כל האפשרויות. הנה ההסבר לכל קטגוריה:</p>
      <div class="space-y-3 mb-4">
        <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <BookOpen class="h-5 w-5 text-emerald-500 mt-0.5" />
          <div>
            <strong>מרכז המורה</strong>
            <p class="text-sm text-muted-foreground">העמוד הראשי — סקירה כללית של הנתונים</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <Users class="h-5 w-5 text-rose-500 mt-0.5" />
          <div>
            <strong>תלמידים</strong>
            <p class="text-sm text-muted-foreground">רשימת כל התלמידים עם פרטים וסטטוס</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <ListChecks class="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <strong>משימות ופרקים</strong>
            <p class="text-sm text-muted-foreground">מעקב אחר השלמת משימות ופרקים</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <GraduationCap class="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <strong>ציונים</strong>
            <p class="text-sm text-muted-foreground">גיליון ציונים מלא עם ניתוח הישגים</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <Activity class="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <strong>פעילות / זמנים</strong>
            <p class="text-sm text-muted-foreground">לוגים וזמני למידה של התלמידים</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <BarChart3 class="h-5 w-5 text-teal-500 mt-0.5" />
          <div>
            <strong>דוחות</strong>
            <p class="text-sm text-muted-foreground">דוחות מפורטים: תלמידים, משימות, ימים, פערים</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <Download class="h-5 w-5 text-indigo-500 mt-0.5" />
          <div>
            <strong>ייצוא</strong>
            <p class="text-sm text-muted-foreground">הורדת נתונים לקבצי Excel ו-CSV</p>
          </div>
        </div>
      </div>
    `,
    screenshot: '<!-- תמונת מסך: הסרגל הצדדי עם כל הקישורים מסומנים -->',
    steps: null,
    tips: [
      'אפשר לכווץ את הסרגל לחיצה על כפתור הכיווץ בחלק העליון',
      'העמוד "דוח פערים" מראה מה חסר בנתונים — כדאי לבדוק קודם',
    ],
  },
  {
    id: 'participants',
    title: 'ייבוא רשימת משתתפים',
    icon: Users,
    color: 'bg-rose-500',
    short: 'איך להעלות קובץ משתתפים מ-Moodle',
    content: `
      <p class="mb-4">כדי לראות את התלמידים שלך, צריך קודם לייבא את רשימת המשתתפים מ-Moodle.</p>
      <p class="mb-4"><strong>איך עושים את זה:</strong></p>
    `,
    screenshot: '<!-- תמונת מסך: עמוד ייבוא נתונים עם האפשרות "משתתפים" מסומנת -->',
    steps: [
      'היכנס לניהול הקורס ב-Moodle',
      'עבור למשתתפים (Participants)',
      'לחץ על "הורד כ-TXT" או "Export as spreadsheet"',
      'פתח את Teacher Hub ועבור לעמוד "ייבוא נתונים"',
      'בחר את הקובץ שהורדת',
      'לחץ "ייבא משתתפים"',
    ],
    tips: [
      'הקובץ צריך להכיל: שם מלא, שם משתמש, דוא"ל (אם יש)',
      'ניתן לייבא מחדש אחרי שמשתנים בקורס — המערכת תעדכן',
      'ללא משתתפים — לא ניתן לראות ציונים ופעילות',
    ],
  },
  {
    id: 'grades',
    title: 'ייבוא גיליון ציונים',
    icon: GraduationCap,
    color: 'bg-amber-500',
    short: 'איך לייבא ציונים מגיליון הציונים של מודל',
    content: `
      <p class="mb-4">גיליון הציונים מכיל את כל המשימות והציונים של כל תלמיד. הייבוא מאפשר לראות ניתוח הישגים.</p>
      <p class="mb-4"><strong>מה צריך לעשות:</strong></p>
    `,
    screenshot: '<!-- תמונת מסך: עמוד ציונים עם טבלת תלמידים וציונים -->',
    steps: [
      'ב-Moodle — עבור לקורס → ציונים (Grades)',
      'לחץ על "ייצוא" → בחר "Excel" או "CSV"',
      'שמור את הקובץ על המחשב',
      'ב-Teacher Hub עבור לעמוד "ייבוא נתונים"',
      'בחר את הקובץ ולחץ "ייבא ציונים"',
    ],
    tips: [
      'הקובץ צריך להיות עם כותרות (headers) — שם תלמיד, שם משימה, ציון',
      'אם יש ציונים חסרים — המערכת תסמן "—" ולא תכלול בממוצע',
      'אפשר לייבא ציונים רק אחרי שייבאת משתתפים',
    ],
  },
  {
    id: 'activities',
    title: 'השלמת פעילויות',
    icon: ListChecks,
    color: 'bg-purple-500',
    short: 'מעקב אחר מי השלים משימות ופרקים',
    content: `
      <p class="mb-4">דוח השלמת הפעילויות מראה בדיוק אילו תלמידים סיימו אילו משימות ופרקים. זה קריטי למעקב אחר התקדמות.</p>
    `,
    screenshot: '<!-- תמונת מסך: עמוד משימות עם טבלת השלמה של כל תלמיד -->',
    steps: [
      'ב-Moodle — ניהול קורס → דוחות → השלמת פעילות',
      'הגדר את הדוח: כל המשתתפים, כל הפעילויות',
      'ייצא את הדוח כקובץ',
      'ב-Teacher Hub עבור לעמוד "ייבוא נתונים"',
      'העלה את הקובץ ובחר "השלמת פעילויות"',
    ],
    tips: [
      'חשוב להפעיל מעקב השלמה במשימות ב-Moodle קודם',
      'אפשר לראות אחוז השלמה כולל בעמוד התלמיד הספציפי',
      'צבעי רקע בטבלה מסמנים: ירוק=הושלם, אדום=לא הושלם',
    ],
  },
  {
    id: 'logs',
    title: 'יומני פעילות',
    icon: Activity,
    color: 'bg-blue-500',
    short: 'זמני למידה ופעילות יומית',
    content: `
      <p class="mb-4">יומני הפעילות (Logs) מכילים מידע על כניסות ויציאות של תלמידים מהקורס. זה מאפשר לחשב זמני תרגול.</p>
    `,
    screenshot: '<!-- תמונת מסך: עמוד פעילות עם גרף פעילות יומית -->',
    steps: [
      'ב-Moodle — ניהול קורס → דוחות → יומני פעילות (Logs)',
      'בחר: כל המשתתפים, כל הימים',
      'ייצא כקובץ CSV',
      'ב-Teacher Hub עבור לעמוד "ייבוא נתונים"',
      'בחר "יומני פעילות" והעלה את הקובץ',
    ],
    tips: [
      'בלי לוגים — לא יהיו נתוני זמן תרגול',
      'המערכת מחשבת זמן משך לפי פער בין כניסה ליציאה',
      'אפשר לראות פעילות לפי תאריך או לפי תלמיד',
    ],
  },
  {
    id: 'reports',
    title: 'דוחות מפורטים',
    icon: BarChart3,
    color: 'bg-teal-500',
    short: 'ניתוח נתונים: תלמידים, משימות, ימים, פערים',
    content: `
      <p class="mb-4">מרכז הדוחות מציע 4 סוגי דוחות שונים. כל אחד מתמקד בהיבט אחר:</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div class="p-4 bg-slate-50 rounded-xl">
          <strong class="block mb-1">דוח תלמידים</strong>
          <p class="text-sm text-muted-foreground">סקירת ביצועים אישית: ממוצע, משימות, אירועים</p>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl">
          <strong class="block mb-1">דוח משימות</strong>
          <p class="text-sm text-muted-foreground">מי השלים מה — בחתך משימה ותלמיד</p>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl">
          <strong class="block mb-1">דוח זמני תרגול</strong>
          <p class="text-sm text-muted-foreground">כמה זמן כל תלמיד השקיע בקורס</p>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl">
          <strong class="block mb-1">דוח פערים</strong>
          <p class="text-sm text-muted-foreground">מה חסר — אילו נתונים צריך להשלים</p>
        </div>
      </div>
    `,
    screenshot: '<!-- תמונת מסך: מרכז הדוחות עם 4 כרטיסיות -->',
    steps: null,
    tips: [
      'דוח פערים חשוב במיוחד לפני סוף סמסטר',
      'אפשר להיכנס לפרופיל אישי של תלמיד מתוך דוח תלמידים',
    ],
  },
  {
    id: 'export',
    title: 'ייצוא לאקסל',
    icon: Download,
    color: 'bg-indigo-500',
    short: 'הורדת נתונים לקבצי Excel ו-CSV',
    content: `
      <p class="mb-4">ניתן להוריד כל נתון לקובץ אקסל לשימוש במקום אחר — גיליונות, הצגה לתלמידים, ארכיון.</p>
    `,
    screenshot: '<!-- תמונת מסך: עמוד ייצוא עם כפתורי הורדה -->',
    steps: [
      'עבור לעמוד "ייצוא" בסרגל הצדדי',
      'בחר את סוג הדוח: ציונים, תלמידים, פעילות, לוגים',
      'לחץ על "הורדה"',
      'הקובץ יורד למחשב בפורמט מתאים',
    ],
    tips: [
      'דוח ציונים מגיע כקובץ Excel עם כל העמודות',
      'דוח פעילות מגיע כ-CSV שאפשר לפתוח באקסל',
      'אפשר לשמור גם גיבוי מקומי של הנתונים',
    ],
  },
  {
    id: 'sync',
    title: 'סנכרון אוטומטי',
    icon: Activity,
    color: 'bg-cyan-500',
    short: 'חיבור ל-API של מודל לעדכון אוטומטי',
    content: `
      <p class="mb-4">במקום להוריד ולהעלות קבצים בручную, אפשר לחבר את Teacher Hub ישירות ל-API של מודל. כך הנתונים מתעדכנים אוטומטית.</p>
      <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
        <p class="text-sm text-amber-700"><strong>שים לב:</strong> סנכרון אוטומטי דורש הגדרה מתקדמת בצד של מודל (Web Services). אם האפשרות לא מופיעה או מופיעה כחסומה — יש לפנות למנהל המערכת.</p>
      </div>
    `,
    screenshot: '<!-- תמונת מסך: עמוד סנכרון עם סטטוס מחובר/לא מחובר -->',
    steps: [
      'עבור לעמוד "סנכרון" בסרגל הצדדי',
      'לחץ "בדוק חיבור" כדי לוודא שהכל עובד',
      'אם מופיע "Web Service מוגדר" — לחץ "סנכרן עכשיו"',
      'הסנכרון ירוץ ויעדכן את כל הנתונים',
    ],
    tips: [
      'ללא הרשאות Web Service — אפשר להמשיך עם ייבוא ידני',
      'סנכרון מתבצע לפי הקורס הנוכחי בלבד',
      'אפשר לראות היסטוריית סנכרונים באותו עמוד',
    ],
  },
  {
    id: 'troubleshooting',
    title: 'פתרון בעיות',
    icon: AlertTriangle,
    color: 'bg-orange-500',
    short: 'מה לעשות כשמשהו לא עובד',
    content: `
      <p class="mb-4">הנה הבעיות הנפוצות ביותר והפתרונות שלהן:</p>
    `,
    screenshot: '<!-- תמונת מסך: עמוד סטטוס חיבור ונתונים -->',
    steps: null,
    tips: [
      'בעיה: "אין נתונים להצגה" — צריך לייבא קודם. עבור ל"ייבוא נתונים"',
      'בעיה: "לא מחובר למודל" — לפתוח את Teacher Hub ישירות מתוך קורס ב-Moodle',
      'בעיה: ציונים לא מתאימים — לוודא שהקובץ מגיע מאותו קורס',
      'בעיה: סנכרון נכשל — לפנות למנהל המודל לבדוק הרשאות Web Service',
      'תמיד אפשר לבדוק את "סטטוס חיבור ונתונים" לראות מה חסר',
    ],
  },
  {
    id: 'support',
    title: 'תמיכה ועזרה',
    icon: Info,
    color: 'bg-slate-500',
    short: 'יצירת קשר ומידע נוסף',
    content: `
      <p class="mb-4">Teacher Hub נמצא בפיתוח מתמשך. אם יש הצעות, בעיות, או בקשות — נשמח לשמוע.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div class="p-6 bg-slate-50 rounded-xl text-center">
          <Info class="h-8 w-8 mx-auto mb-3 text-slate-400" />
          <strong class="block mb-2">מנוהל ע"י יניב רז</strong>
          <a href="https://www.instagram.com/yani__raz" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline text-sm">
            @yani__raz באינסטגרם
          </a>
        </div>
        <div class="p-6 bg-slate-50 rounded-xl text-center">
          <BookOpen class="h-8 w-8 mx-auto mb-3 text-slate-400" />
          <strong class="block mb-2">Teacher Hub</strong>
          <p class="text-sm text-muted-foreground">כלי נתונים למורים ב-Moodle</p>
        </div>
      </div>
      <p class="text-sm text-muted-foreground">המדריך הזה נמצא בנתיב <code class="bg-slate-100 px-1 rounded">/guide</code> — אפשר לשתף קישור ישירות למורים אחרים.</p>
    `,
    screenshot: null,
    steps: null,
    tips: [
      'לשליחת משוב — פניה דרך אינסטגרם או דרך מנהל המודל',
      'כל הנתונים נשמרים ב-Supabase מאובטחת',
      'המדריך הזה חלק מהמערכת — נגיש לכל מי שפותח את Teacher Hub',
    ],
  },
];

export default function Guide() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const topic = TOPICS[currentIndex];
  const progress = ((currentIndex + 1) / TOPICS.length) * 100;

  function goNext() {
    if (currentIndex < TOPICS.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }

  function goToTopic(index: number) {
    setCurrentIndex(index);
    setShowAll(false);
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === TOPICS.length - 1;

  return (
    <SafePage
      title="מדריך למורה"
      description="מדריך שימוש במערכת Teacher Hub — כל השלבים בעברית"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>נושא {currentIndex + 1} מתוך {TOPICS.length}</span>
            <span>{topic.title}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Topic Navigation Pills */}
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => goToTopic(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                i === currentIndex
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-white text-muted-foreground border-slate-200 hover:border-primary/30 hover:text-primary"
              )}
            >
              <t.icon className="h-3 w-3" />
              {t.title}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <Card className="border-none shadow-luxury overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-4 rounded-2xl text-white shadow-lg", topic.color)}>
                <topic.icon className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">{topic.title}</CardTitle>
                <p className="text-muted-foreground font-medium mt-1">{topic.short}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Content */}
            <div
              className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: topic.content }}
            />

            {/* Screenshot Placeholder */}
            {topic.screenshot && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50">
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className={cn("p-4 rounded-2xl text-white", topic.color)}>
                      <topic.icon className="h-8 w-8" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-400">
                    {/* eslint-disable-next-line react/no-danger */}
                    {topic.screenshot.replace(/^<!--|-->$/g, '').trim()}
                  </p>
                  <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 bg-amber-50">
                    תמונת מסך אמיתית נדרשת
                  </Badge>
                </div>
              </div>
            )}

            {/* Steps */}
            {topic.steps && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-black text-sm uppercase tracking-wider text-slate-500 mb-4">שלבי ביצוע</h4>
                <ol className="space-y-3">
                  {topic.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={cn(
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5",
                        topic.color
                      )}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-600 leading-relaxed pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tips */}
            {topic.tips && topic.tips.length > 0 && (
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  טיפים חשובים
                </h4>
                <ul className="space-y-2">
                  {topic.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                      <span className="text-primary font-black mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={isFirst}
            className="gap-2 font-bold"
          >
            <ChevronRight className="h-4 w-4" />
            הקודם
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
            <span>נושא {currentIndex + 1}</span>
            <span>·</span>
            <span>{topic.title}</span>
          </div>

          <Button
            variant="default"
            onClick={goNext}
            disabled={isLast}
            className="gap-2 font-bold"
          >
            הבא
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* All Topics Grid (for reference) */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground">כל הנושאים במדריך</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(s => !s)}
              className="text-xs gap-1"
            >
              {showAll ? 'הסתר' : 'הצג הכל'}
            </Button>
          </div>

          {showAll && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {TOPICS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => goToTopic(i)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border text-right transition-all hover:shadow-md",
                    i === currentIndex
                      ? "border-primary bg-primary/5"
                      : "border-slate-100 bg-white hover:border-primary/30"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg text-white shrink-0", t.color)}>
                    <t.icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </SafePage>
  );
}
