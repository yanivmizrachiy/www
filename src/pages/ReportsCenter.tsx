import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Users, Clock, AlertTriangle, ListChecks, Activity, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportsCenter() {
  const reports = [
    { title: "דוח תלמידים", path: "/reports/students", icon: Users, desc: "פרטי קשר וסטטוס כללי" },
    { title: "דוח ציונים", path: "/grades", icon: BarChart3, desc: "ריכוז הישגים מכל המשימות" },
    { title: "דוח משימות", path: "/reports/tasks", icon: ListChecks, desc: "ניתוח הצלחה לפי משימה" },
    { title: "דוח פעילות", path: "/activity", icon: Activity, desc: "לוגים ואירועי למידה" },
    { title: "דוח זמני תרגול", path: "/reports/days", icon: Clock, desc: "חישוב משך עבודה יומי" },
    { title: "דוח פערים", path: "/reports/gap", icon: AlertTriangle, desc: "מה חסר במערכת" },
  ];

  return (
    <div className="p-8 space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">מרכז דוחות</h1>
        <p className="text-muted-foreground mt-2">דוחות המבוססים על נתוני מודל אמיתיים בלבד.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">ייבוא דוחות שהמורה הוריד ממודל</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                אין עדיין חיבור אוטומטי? העלה קובץ Excel/CSV שהורדת ממודל — ציונים, לוגים, השלמות פעילות או משתתפים. המערכת מזהה את סוג הדוח ומייבאת בבטחה. אין ייבוא דמו.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2 font-bold">
            <Link to="/import">
              <Upload className="h-4 w-4" />
              לייבוא נתונים
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.path} to={report.path}>
            <Card className="hover:border-primary transition-all group h-full">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform">
                  {React.createElement(report.icon, { className: "h-5 w-5" })}
                </div>
                <CardTitle className="text-xl mt-4">{report.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{report.desc}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-slate-700 space-y-2">
            <p className="font-bold">שקיפות סטטוס נתונים</p>
            <ul className="space-y-1 text-xs leading-relaxed">
              <li>• <strong>מסונכרן אוטומטית</strong> — API/Web Services פעיל ומחזיר נתונים.</li>
              <li>• <strong>יובא מקובץ Moodle</strong> — המורה העלה קובץ export דרך "ייבוא נתונים".</li>
              <li>• <strong>חסום / נדרש מקור אמת</strong> — אין API ואין קובץ תקין. הדוח לא יציג נתונים.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              דוחות ייחודיים של משהח (ניהול למידה, סמל שאלון לבגרות) עדיין לא זמינים ל-Teacher Hub — Roadmap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
