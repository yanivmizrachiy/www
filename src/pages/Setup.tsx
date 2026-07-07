import React from 'react';
import { SafePage } from '@/components/SafePage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Setup() {
  return (
    <SafePage
      title="התקנה / חיבור Moodle"
      description="הנחיות לחיבור הכלי מתוך Moodle. אין סיסמה נוספת."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-6">
              <CardTitle className="text-xl font-black">לפני שמתחילים</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { done: true, text: "יש לך חשבון מורה באתר Moodle" },
                  { done: false, text: "נרשמת באתר הזה (WWW) ופתחת מרחב קורס" },
                  { done: false, text: "הגדרת את פרטי ה-LTI ב-Moodle ובמערכת" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <span className={item.done ? "text-slate-600" : "text-slate-400"}>{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <CardTitle className="text-xl font-black">שלב 1 — הגדרת LTI במודל</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm text-slate-600 font-medium leading-relaxed">
                <p>בתוך הקורס במודל:</p>
                <ol className="list-decimal pr-6 space-y-2">
                  <li>הפעל עריכת הקורס (Edit mode)</li>
                  <li>הוסף פעילות או משאב → בחר <strong>"כלי חיצוני" (External Tool)</strong></li>
                  <li>בשדה <strong>"כתובת כלי" (Tool URL)</strong> — הזן את הכתובת שמופיעה בדף ההגדרות</li>
                  <li>שמור את הכלי</li>
                </ol>
                <p className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700">
                  <strong>שים לב:</strong> אם אתה מנהל המערכת, עליך לאשר LTI ברמת האתר קודם. פנה לתמיכה של מודל.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <CardTitle className="text-xl font-black">שלב 2 — רישום האתר כאן</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                לאחר שיצרת LTI במודל, יש לרשום את האתר ואת פרטי ה-LTI כאן במערכת:
              </p>
              <Button asChild className="gap-2 font-black">
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                  עבור להגדרות
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                בדף ההגדרות תוכל להזין את כתובת האתר, את Consumer Key ואת Consumer Secret שיוצרו במודל.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <CardTitle className="text-xl font-black">שלב 3 — הפעלה</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
                <p>לאחר שמירת הפרטים:</p>
                <ol className="list-decimal pr-6 space-y-2">
                  <li>חזור לקורס במודל</li>
                  <li>לחץ על הכלי החיצוני שהוספת</li>
                  <li>Moodle ישלח בקשת LTI עם הזהות שלך</li>
                  <li>תועבר אוטומטית למרכז המורה עם גישה מלאה לנתוני הקורס</li>
                </ol>
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
                  <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>המערכת מאובטחת — הססמה שלך במודל מעולם לא נשמרת כאן. האימות מתבצע באמצעות LTI.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-primary text-white shadow-luxury sticky top-6">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-black leading-tight">מה זה LTI?</h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                LTI (Learning Tools Interoperability) הוא תקן בינלאומי לחיבור כלים חיצוניים
                למערכות LMS כמו Moodle. הוא מאפשר העברת זהות והרשאות באופן מאובטח, ללא צורך בססמה נוספת.
              </p>
              <Button variant="secondary" className="w-full font-black text-primary" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                  הגדרות
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SafePage>
  );
}
