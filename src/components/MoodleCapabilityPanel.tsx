import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, FileUp, Lock, PlugZap } from "lucide-react";

const rows = [
  {
    key: "lti",
    title: "כניסה מתוך Moodle",
    state: "אוטומטי חלקי",
    status: "working_partial",
    icon: PlugZap,
    text: "המערכת נפתחת מתוך Moodle ומקבלת הקשר מורה/מרחב, אבל זה לא מוכיח שכל הנתונים נשאבים אוטומטית.",
    next: "להציג בדיוק מה הגיע מה־LTI ומה עדיין חסר."
  },
  {
    key: "participants",
    title: "משתתפים",
    state: "ייבוא דוח אמיתי",
    status: "working",
    icon: CheckCircle2,
    text: "משתתפים קיימים מנתוני Moodle אמיתיים שיובאו ונשמרו.",
    next: "לבדוק אם NRPS או Moodle Web Services יכולים להפוך זאת לאוטומטי מלא."
  },
  {
    key: "gradebook",
    title: "ציונים / Gradebook",
    state: "ייבוא דוח אמיתי",
    status: "working",
    icon: FileUp,
    text: "ציונים קיימים מייבוא Gradebook אמיתי. תאים חסרים אינם נשמרים כ־0.",
    next: "לבדוק AGS או Moodle Web Services לציונים אוטומטיים."
  },
  {
    key: "logs",
    title: "יומני מעקב",
    state: "ייבוא דוח אמיתי",
    status: "working",
    icon: FileUp,
    text: "יומני מעקב קיימים מייבוא דוח Moodle אמיתי.",
    next: "לבדוק אם קיימת הרשאה לקריאת Logs דרך Moodle Web Services."
  },
  {
    key: "practice_time",
    title: "זמן תרגול",
    state: "חסום",
    status: "blocked",
    icon: Lock,
    text: "זמן תרגול רשמי חסום כי בדוח הנוכחי אין שדה משך זמן רשמי.",
    next: "לא לחשב זמן תרגול עד שמתקבל מקור Moodle רשמי."
  }
];

function statusClass(status: string) {
  if (status === "working") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "working_partial") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-amber-200 bg-amber-50 text-amber-950";
}

export default function MoodleCapabilityPanel() {
  return (
    <section
      className="MTH_MOODLE_CAPABILITY_PANEL_V1 rounded-[2rem] border border-primary/10 bg-white/90 p-6 shadow-elegant"
      dir="rtl"
      aria-label="מצב חיבור ויכולות Moodle"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary">מצב חיבור ויכולות Moodle</h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-muted-foreground">
            כאן רואים את האמת: מה נשאב אוטומטית, מה עובד דרך ייבוא דוח Moodle אמיתי, מה חסום, ומה הצעד הבא.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-black text-primary">
          אין דמו · אין נתונים מומצאים
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {rows.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className={`border ${statusClass(item.status)} shadow-sm`}>
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <Icon className="h-6 w-6" />
                  <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-black">
                    {item.state}
                  </span>
                </div>
                <CardTitle className="text-lg font-black">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm font-semibold leading-relaxed">
                <p>{item.text}</p>
                <p className="text-xs font-black opacity-80">השלב הבא: {item.next}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild className="font-black">
          <Link to="/import">ייבוא דוחות Moodle אמיתיים</Link>
        </Button>
        <Button asChild variant="outline" className="font-black">
          <Link to="/settings">הגדרות ובדיקת חיבור</Link>
        </Button>
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-black text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          Teacher Release עדיין NO עד בדיקת בידוד מורה/מרחב.
        </div>
      </div>
    </section>
  );
}
