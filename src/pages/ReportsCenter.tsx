import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, Users, Clock, AlertTriangle, ListChecks } from 'lucide-react';
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
        <p className="text-muted-foreground mt-2">דוחות המבוססים על נתוני מודל.</p>
      </div>

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
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
