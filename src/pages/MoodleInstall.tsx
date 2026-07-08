import { Link } from "react-router-dom";
import { SafePage } from '@/components/SafePage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalLink, Copy, HelpCircle, Settings, ShieldCheck, Terminal, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MoodleInstall() {
  const toolUrl = `${window.location.origin}/api/lti/launch`;
  
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("הועתק ללוח");
  };

  return (
    <SafePage 
      title="התקנת הכלי במודל" 
      description="הנחיות לחיבור האפליקציה ככלי חיצוני (LTI) בתוך סביבת המודל האישית שלך."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-luxury bg-white/95 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">פרטי קונפיגורציה</CardTitle>
                  <CardDescription className="font-medium">העתק את הפרטים הבאים להגדרות הכלי החיצוני במודל</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tool URL (כתובת הכלי)</label>
                <div className="flex gap-3">
                  <code className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono overflow-auto scrollbar-hide text-slate-700">
                    {toolUrl}
                  </code>
                  <Button variant="secondary" size="icon" onClick={() => copy(toolUrl)} className="h-14 w-14 shrink-0 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">LTI Version</label>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-black text-slate-700">1.1 / 2.0 (Legacy Support)</div>
                 </div>
                 <div className="space-y-3">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Consumer Key / Secret</label>
                   <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200 text-sm font-medium text-slate-400 italic">מיוצר באופן אוטומטי במודל</div>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-luxury overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent rounded-xl text-white shadow-lg shadow-accent/20">
                  <Settings className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black text-slate-900">מדריך התקנה מהיר</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {[
                  "כנס לקורס במודל ולחץ על 'הוספת פעילות או משאב'.",
                  "בחר ב-'כלי חיצוני' (External Tool) מהרשימה.",
                  "ב-'כתובת כלי' (Tool URL) הדבק את הכתובת המופיעה למעלה.",
                  "תן לכלי שם ברור כמו 'לוח בקרה חכם למורה'.",
                  "בהגדרות הפרטיות, וודא ש-'שתף שם המשתמש' ו-'שתף דוא\"ל' מסומנים כפעילים."
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 items-start group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      {i + 1}
                    </div>
                    <p className="text-[15px] text-slate-600 font-medium leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="bg-primary text-white shadow-luxury">
              <CardContent className="p-8 space-y-6 text-center">
                 <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8 text-white" />
                 </div>
                 <h3 className="text-xl font-black leading-tight">אבטחת נתונים בראש סדר העדיפויות</h3>
                 <p className="text-white/70 text-sm font-medium leading-relaxed">
                    הצפנת LTI מבטיחה שהמידע עובר ממודל למערכת הניתוח בצורה מאובטחת ופרטית לחלוטין.
                 </p>
                 <Button asChild variant="secondary" className="w-full font-black text-primary">
                    <Link to="/guide">למידע נוסף</Link>
                 </Button>
              </CardContent>
           </Card>

           <div className="p-8 bg-accent/5 rounded-[2.5rem] border border-accent/10 space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <HelpCircle className="h-5 w-5" />
                <span className="font-black text-sm uppercase tracking-wider">צריך עזרה?</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed opacity-80">
                אם נתקלת בבעיה בתהליך ההגדרה, פנה למנהל המודל של המוסד וודא שהרשאות LTI מאופשרות עבור האתר.
              </p>
           </div>

           <div className="p-8 bg-accent/5 rounded-[2.5rem] border border-accent/10 space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <Download className="h-5 w-5" />
                <span className="font-black text-sm uppercase tracking-wider">אם אין חיבור API מלא</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                גם ללא token או Web Services מלא — יש מסלול נתונים אמיתי דרך הורדת דוחות ממודל והעלאתם ל-Teacher Hub. פשוט הורד את הדוח הרלוונטי במודל והעלה אותו בעמוד <Link to="/import" className="text-primary font-black hover:underline">ייבוא נתונים</Link>.
              </p>
              <ul className="text-xs text-slate-500 font-medium leading-relaxed space-y-1.5">
                <li>• <strong>ציונים:</strong> ציונים → יצוא → Excel/CSV</li>
                <li>• <strong>לוגים:</strong> דוחות → יומני מעקב → הורדה CSV/JSON/Excel</li>
                <li>• <strong>השלמות:</strong> דוחות → דוח השלמות פעילות → CSV UTF-8</li>
                <li>• <strong>משתתפים:</strong> משתתפים → הורדת הטבלה</li>
                <li>• <strong>ניהול למידה:</strong> הורדת CSV מכל גרף בלוח</li>
              </ul>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                המערכת מזהה את סוג הדוח לפי הכותרות ומעלה רק אחרי אימות עמודות. אין ייבוא דמו.
              </p>
           </div>

           <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-black text-sm uppercase tracking-wider">פרטיות והפרדה</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                כל מורה מתקין את הכלי במרחב ה-Moodle האישי שלו, נכנס מתוך הקורס, ורואה במקום אחד את נתוני התלמידים, המשימות, הציונים והפעילות של <strong>אותו מרחב בלבד</strong>. אין ערבוב נתונים בין מורים, קורסים או אתרי Moodle.
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                הכלי נבנה ומנוהל על ידי יניב רז —{' '}
                <a
                  href="https://www.instagram.com/yani__raz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @yani__raz באינסטגרם
                </a>
                .
              </p>
           </div>
        </div>
      </div>
    </SafePage>
  );
}
