import { Link } from "react-router-dom";
import { useImportsOverview } from "@/hooks/useImports";
import { useLtiSession } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  ClipboardList, 
  Database, 
  Calendar, 
  Import, 
  ArrowRight, 
  AlertCircle,
  Clock,
  FileSpreadsheet,
  AlertTriangle,
  Settings,
  HelpCircle,
  FileText,
  BarChart3,
  CheckCircle2,
  TrendingDown,
  Activity,
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck,
  Server
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useActionableInsights } from "@/hooks/useImports";
import { useState } from "react";
import { cn } from "@/lib/utils";

function CategoryCard({ 
  title, 
  desc, 
  icon: Icon,
  color, 
  onClick 
}: { 
  title: string, 
  desc: string, 
  icon: any, 
  color: string, 
  onClick: () => void 
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full border-2 border-white/5 bg-slate-900/50 hover:bg-slate-900 transition-colors overflow-hidden relative group">
        <CardContent className="p-6 flex flex-col items-center text-center relative z-10 h-full">
          <div className={cn("p-4 rounded-2xl mb-4 bg-white/5 text-white transition-all group-hover:scale-110", color)}>
            <Icon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tighter text-white">{title}</h2>
          <p className="text-sm text-white/50 font-medium leading-relaxed max-w-xs">{desc}</p>
          <div className="mt-auto pt-4 flex items-center gap-2 text-white/30 font-bold uppercase tracking-widest text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-3 w-3" />
            כניסה
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubMenuButton({ 
  to, 
  title, 
  icon: Icon, 
  color,
  delay = 0 
}: { 
  to: string, 
  title: string, 
  icon: any, 
  color: string,
  delay?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link to={to}>
        <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group text-right">
          <div className={cn("p-2 rounded-lg bg-white/5 transition-all text-white/70", `group-hover:${color} group-hover:text-white`)}>
            <Icon className="h-4 w-4" />
          </div>
          <span className={cn("text-sm font-bold text-white/80 transition-colors", `group-hover:${color.replace('bg-', 'text-')}`)}>{title}</span>
          <ArrowRight className={cn("h-3 w-3 mr-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0", color.replace('bg-', 'text-'))} />
        </Button>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { session } = useLtiSession();
  const { data } = useImportsOverview();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const hasStudents = data?.students_count > 0;
  const hasGrades = data?.grades_count > 0;
  const hasLogs = data?.log_events_count > 0;

  const categories = [
    {
      id: 'grades',
      title: "ציונים",
      desc: "ניהול ציונים, ניתוח הישגים וייצוא.",
      icon: BarChart3,
      color: "bg-blue-500",
      items: [
        { to: "/grades", title: "גיליון ציונים מלא", icon: FileSpreadsheet },
        { to: "/activity", title: "זמני תרגול ולמידה", icon: Clock },
        { to: "/reports", title: "מרכז דוחות פדגוגיים", icon: FileText },
        { to: "/export", title: "ייצוא נתונים לאקסל", icon: Database }
      ]
    },
    {
      id: 'participants',
      title: "משתתפים",
      desc: "ניהול משתתפים, פרופיל למידה וסנכרון.",
      icon: Users,
      color: "bg-rose-500",
      items: [
        { to: "/students", title: "רשימת תלמידים", icon: Users },
        { to: "/reports/gap", title: 'דו"ח פערים וחסרים', icon: AlertTriangle },
        { to: "/status", title: "סטטוס חיבור וסנכרון", icon: Activity },
        { to: "/help", title: "מרכז עזרה ותמיכה", icon: HelpCircle }
      ]
    },
    {
      id: 'activities',
      title: "פעילויות",
      desc: "ארגון חומרים וסביבת הלמידה.",
      icon: ClipboardList,
      color: "bg-emerald-500",
      items: [
        { to: "/tasks", title: "משימות ופרקים", icon: ClipboardList },
        { to: "/import", title: "ייבוא נתונים ידני", icon: Import },
        { to: "/install", title: "התקנת LTI במודל", icon: ShieldCheck }
      ]
    }
  ];

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="p-4 lg:p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 lg:p-10 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 space-y-4">
           <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border border-white/10"
            >
              <div className={`h-2 w-2 rounded-full ${session ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'} shadow-[0_0_15px_rgba(52,211,153,0.5)]`} />
              {session ? "מחובר למודל" : "מצב מערכת: לא מסונכרן"}
            </motion.div>

            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-6xl font-black tracking-tighter leading-none"
              >
                שלום, <span className="text-amber-400">{session?.moodle_username?.split(" ")[0] || "מורה"}</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg lg:text-xl text-white/50 font-bold tracking-tight"
              >
                {session?.course_title ?? "נתוני קורס מודל"}
              </motion.p>
            </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {!activeCategory ? (
          <motion.section 
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {categories.map((cat, i) => (
              <CategoryCard 
                key={cat.id}
                {...cat}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </motion.section>
        ) : (
          <motion.section 
            key="sub-menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setActiveCategory(null)}
                className="h-12 w-12 rounded-full border-white/10 hover:bg-white/10"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white">{currentCategory?.title}</h2>
                <p className="text-white/40 text-sm font-medium">{currentCategory?.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
              {currentCategory?.items.map((item, i) => (
                <SubMenuButton key={item.to} {...item} color={currentCategory.color} delay={i * 0.05} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Actionable Footer */}
      {!activeCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-3 pt-20"
        >
          <div className="px-8 py-5 rounded-full bg-slate-900 border border-white/5 text-white/40 text-sm font-bold flex items-center gap-3">
             <LayoutDashboard className="h-5 w-5" />
             מרכז המורה - ניהול נתונים מאובטח
          </div>
          <p className="text-xs text-white/20 font-medium">
            הכלי נבנה ומנוהל על ידי{' '}
            <a href="https://www.instagram.com/yani__raz" target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary/80 underline">
              יניב רז
            </a>{' '}
            — ניהול, מעקב ושיפור הוראת המתמטיקה באמצעות נתוני Moodle
          </p>
        </motion.div>
      )}
    </div>
  );
}

