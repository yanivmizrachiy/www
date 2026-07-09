// OnboardingBanner — מציג כפתורי ייבוא כשמרחב חדש וריק
import { Link } from "react-router-dom";
import { FileUp, Users, GraduationCap, Activity } from "lucide-react";

interface Props {
  hasSession: boolean;
  studentsCount: number;
  gradesCount: number;
  logsCount: number;
}

export function OnboardingBanner({ hasSession, studentsCount, gradesCount, logsCount }: Props) {
  if (!hasSession) return null;
  const steps = [
    { done: studentsCount > 0, icon: <Users className="h-5 w-5" />, title: "ייבא משתתפים", desc: "רשימת תלמידים מ-Moodle", to: "/smart-import", color: "from-blue-600 to-blue-800" },
    { done: gradesCount > 0, icon: <GraduationCap className="h-5 w-5" />, title: "ייבא ציונים", desc: "גיליון ציונים מ-Moodle", to: "/smart-import", color: "from-emerald-600 to-emerald-800" },
    { done: logsCount > 0, icon: <Activity className="h-5 w-5" />, title: "ייבא יומני פעילות", desc: "פעילות תלמידים מ-Moodle", to: "/smart-import", color: "from-purple-600 to-purple-800" },
  ];
  const allDone = steps.every(s => s.done);
  if (allDone) return null;
  const doneCount = steps.filter(s => s.done).length;
  return (
    <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-blue-900 text-lg">הגדרה ראשונית — {doneCount}/3 שלבים הושלמו</h2>
          <p className="text-sm text-blue-700">ייבא את הדוחות פעם אחת — הנתונים יישמרו לתמיד</p>
        </div>
        <div className="text-3xl font-black text-blue-300">{doneCount}/3</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          step.done ? (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-lg">✓</div>
              <div><div className="font-black text-emerald-800 text-sm">{step.title}</div><div className="text-xs text-emerald-600">הושלם</div></div>
            </div>
          ) : (
            <Link key={i} to={step.to} className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${step.color} p-4 text-white shadow-lg hover:-translate-y-0.5 transition`}>
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">{step.icon}</div>
              <div><div className="font-black text-sm flex items-center gap-1"><FileUp className="h-3 w-3" />{step.title}</div><div className="text-xs opacity-80">{step.desc}</div></div>
            </Link>
          )
        ))}
      </div>
    </section>
  );
}
