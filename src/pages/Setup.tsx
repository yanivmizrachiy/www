import { SafePage } from "@/components/SafePage";
import { useLtiSession } from "@/hooks/useLtiSession";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink, BookOpen, MousePointerClick, Zap, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";

const LTI_URL = "https://www-tijc.onrender.com/api/lti/launch";
const LTI_KEY = "yaniv-lti-tool";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={() => { void navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50">
      {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "הועתק!" : "העתק"}
    </button>
  );
}

function Step({ n, icon, title, children }: { n: number; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 font-black text-white shadow">{n}</div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 font-bold text-gray-900">{icon}{title}</div>
        <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </li>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
      <div>
        <div className="text-xs font-bold text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-mono text-sm font-bold text-gray-900 break-all">{value}</div>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export default function Setup() {
  const { session, site } = useLtiSession();
  const isConnected = !!(session as any)?.course_id;
  const courseName = (session as any)?.course_name ?? (session as any)?.context_title ?? null;
  const teacherName = (session as any)?.teacher_name ?? (session as any)?.name ?? null;
  return (
    <SafePage title="חיבור Moodle" description="הגדרת Moodle Teacher Hub במרחב לימוד." backTo="/" backLabel="חזרה">
      <div className="space-y-6 max-w-2xl">
        {isConnected ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <div className="font-black text-emerald-900">מחובר ופעיל</div>
              <div className="text-sm text-emerald-700">{courseName && <span>{courseName}</span>}{teacherName && <span> · {teacherName}</span>}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <div className="font-black text-amber-900">לא מחובר למרחב Moodle</div>
              <div className="text-sm text-amber-700">פתח כלי זה מתוך מרחב Moodle כדי לקבל נתונים אמיתיים.</div>
            </div>
          </div>
        )}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><h2 className="text-lg font-black">שימוש יומיומי — 3 שלבים</h2></div>
            <ol className="space-y-5">
              <Step n={1} icon={<BookOpen className="h-4 w-4 text-primary" />} title="היכנס למרחב הלימוד שלך ב-Moodle">המרחב שבו אתה מלמד, באתר משרד החינוך.</Step>
              <Step n={2} icon={<MousePointerClick className="h-4 w-4 text-primary" />} title='לחץ על הכלי "Moodle Teacher Hub"'>הכלי מופיע כפעילות מסוג כלי חיצוני (LTI) בתוך המרחב.</Step>
              <Step n={3} icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} title="זהו — הנתונים נטענים אוטומטית">שם המרחב, המורים והתלמידים מגיעים ישירות מ-Moodle. אין צורך בהתחברות נפרדת.</Step>
            </ol>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-blue-100">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-black text-blue-900">התקנה במרחב חדש — 5 שלבים</h2></div>
            <ol className="space-y-5">
              <Step n={1} icon={<BookOpen className="h-4 w-4 text-blue-600" />} title="היכנס למרחב החדש ב-Moodle והפעל מצב עריכה">לחץ על "הפעל עריכה" בפינה הימנית העליונה של המרחב.</Step>
              <Step n={2} icon={<MousePointerClick className="h-4 w-4 text-blue-600" />} title='לחץ "הוסף פעילות" ← לשונית "פעילויות"'>בחר <strong>כלי או שירות LTI חיצוני</strong>.</Step>
              <Step n={3} icon={<Copy className="h-4 w-4 text-blue-600" />} title="הגדר את פרטי הכלי">
                <div className="mt-3 space-y-2">
                  <FieldRow label="כתובת הכלי (Tool URL)" value={LTI_URL} />
                  <FieldRow label="Consumer Key" value={LTI_KEY} />
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"><strong>Shared Secret</strong> — קבל מהמנהל בלבד. אל תשתף בצ'אט, מייל או צילום מסך.</div>
                </div>
              </Step>
              <Step n={4} icon={<CheckCircle2 className="h-4 w-4 text-blue-600" />} title="שמור והצג">לחץ "שמור וחזור למרחב" — הכלי יופיע כפעילות חדשה.</Step>
              <Step n={5} icon={<Zap className="h-4 w-4 text-emerald-600" />} title="לחץ על הכלי — הוא נפתח אוטומטית">הנתונים של המרחב החדש ייטענו אוטומטית. אין התחברות נוספת.</Step>
            </ol>
            <div className="mt-5">
              <Button asChild variant="outline" size="sm">
                <a href="https://www-tijc.onrender.com/health" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2"><ExternalLink className="h-4 w-4" />בדוק שהשרת פעיל</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        {(site?.site_name || site?.site_url) && (
          <Card className="shadow-sm"><CardContent className="pt-4 pb-4">
            <div className="text-xs font-bold text-muted-foreground">שרת Moodle מזוהה</div>
            <div className="mt-0.5 font-semibold">{site.site_name ?? site.site_url}</div>
          </CardContent></Card>
        )}
      </div>
    </SafePage>
  );
}
