import { Import, UploadCloud, Copy, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

export function ImportEmptyState() {
  const steps = [
    { icon: UploadCloud, label: "גרירת קובץ", desc: "XLSX / CSV / ODS" },
    { icon: Copy, label: "הדבקת טבלה", desc: "כולל שורת כותרות" },
    { icon: FileSpreadsheet, label: "זיהוי דוח", desc: "תלמידים / ציונים / לוגים" },
  ];

  return (
    <div className="w-full space-y-4" dir="rtl">
      <div className="space-y-1 text-center md:text-right">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/70">ייבוא נתוני Moodle</p>
        <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          נתונים אמיתיים לממשק הייבוא
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground md:mx-0">
          העלו דוח Moodle אמיתי או הדביקו טבלה. המערכת תזהה את סוג הדוח ותציג תצוגה מקדימה לפני שמירת הנתונים.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="h-full border-primary/10 bg-background/70 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-background">
              <CardContent className="flex items-center gap-3 p-4 text-right sm:flex-col sm:items-center sm:text-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-foreground">{item.label}</div>
                  <div className="text-xs leading-5 text-muted-foreground">{item.desc}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 p-5 text-center text-muted-foreground shadow-inner md:p-7">
        <Import className="mx-auto mb-3 h-10 w-10 text-primary/35" />
        <p className="text-sm font-bold text-foreground">לחצו לבחירת קובץ או גררו קובץ לאזור הייבוא</p>
        <p className="mt-1 text-xs leading-6">לא נשמר דבר לפני אישור. קודם מוצגת בדיקה ותצוגה מקדימה.</p>
      </div>
    </div>
  );
}
