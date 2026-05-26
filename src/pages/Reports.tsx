import { Link } from "react-router-dom";
import { SafePage } from "@/components/SafePage";
import { Users, ClipboardList, CalendarDays, AlertTriangle, Download, ChevronLeft } from "lucide-react";

// MTH_REPORTS_EXPORT_HUB_V1
// Premium Hebrew RTL reports hub. Each report is a described card linking to
// the existing real-data report pages. No fake reports, no fake filters.

interface ReportCard {
  to: string;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
}

const REPORTS: ReportCard[] = [
  {
    to: "/reports/students",
    title: "דוח תלמידים",
    desc: "סקירת ביצועים ופעילות בחתך תלמיד — ממוצעים, משימות והשלמה.",
    Icon: Users,
    tone: "from-[#06152f] via-[#0b3d91] to-[#0e7490]",
  },
  {
    to: "/reports/tasks",
    title: "דוח משימות",
    desc: "מצב המשימות והפעילויות בקורס — מי הגיש ומה חסר.",
    Icon: ClipboardList,
    tone: "from-[#0b3d91] via-[#0e7490] to-[#0891b2]",
  },
  {
    to: "/reports/days",
    title: "דוח ימים",
    desc: "פעילות לפי ימים — אירועים וימים פעילים מתוך לוגים אמיתיים.",
    Icon: CalendarDays,
    tone: "from-[#0e7490] via-[#0891b2] to-[#06152f]",
  },
  {
    to: "/reports/gaps",
    title: "דוח פערים",
    desc: "זיהוי חוסרים — ציונים חסרים, משימות לא שהוגשו, פערי פעילות. חסר נשאר חסר.",
    Icon: AlertTriangle,
    tone: "from-[#0891b2] via-[#06152f] to-[#0b3d91]",
  },
];

export default function Reports() {
  return (
    <SafePage
      title="דוחות"
      description="מרכז הדוחות — תלמידים, משימות, ימים ופערים."
    >
      <div className="space-y-6" dir="rtl">
        <section className="grid gap-4 md:grid-cols-2">
          {REPORTS.map((r) => {
            const Icon = r.Icon;
            return (
              <Link
                key={r.to}
                to={r.to}
                className={`group rounded-3xl border border-white/10 bg-gradient-to-br ${r.tone} p-6 text-white shadow-[0_20px_60px_rgba(6,21,47,0.3)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(6,21,47,0.42)]`}
              >
                <div className="flex items-start justify-between">
                  <Icon className="h-11 w-11" />
                  <ChevronLeft className="h-6 w-6 opacity-70 transition group-hover:-translate-x-1" />
                </div>
                <div className="mt-4 text-2xl font-black">{r.title}</div>
                <p className="mt-2 text-sm leading-6 text-white/85">{r.desc}</p>
              </Link>
            );
          })}
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Download className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold">ייצוא נתונים</h2>
                <p className="text-sm text-muted-foreground">
                  ייצוא נתונים לקובץ (Excel/CSV).
                </p>
              </div>
            </div>
            <Link
              to="/export"
              className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
            >
              עבור לייצוא
            </Link>
          </div>
        </section>
      </div>
    </SafePage>
  );
}
