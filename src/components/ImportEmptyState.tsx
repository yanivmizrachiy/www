import { Import, UploadCloud, Copy, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

export function ImportEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8 max-w-2xl mx-auto" dir="rtl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">ברוכים הבאים לממשק הייבוא</h2>
        <p className="text-muted-foreground">העלו דוחות Moodle כדי להתחיל לראות נתוני אמת במרכז המורה.</p>
      </div>

      <div className="grid gap-6 w-full sm:grid-cols-3">
        {[
          { icon: UploadCloud, label: "גרירת קבצים", desc: "XLSX, CSV, ODS" },
          { icon: Copy, label: "הדבקת טבלה", desc: "העתק-הדבק ישירות" },
          { icon: FileSpreadsheet, label: "זיהוי אוטומטי", desc: "אנחנו נזהה את הדוח" }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-muted/30 text-center hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 space-y-3">
                <div className="mx-auto w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border-dashed border-2 p-12 w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 border-muted-foreground/20">
        <Import className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">גרור לכאן קובץ או לחץ לבחירה מהמחשב</p>
        <p className="text-[10px] mt-1">מערכת ה-Truth First תנתח ותציג תצוגה מקדימה לפני האישור.</p>
      </div>
    </div>
  );
}
