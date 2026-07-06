import React, { useState } from 'react';
import { useStudents } from '@/hooks/useImports';
import { useLtiSession } from '@/hooks/useLtiSession';
import { exportStudentsCsv } from '@/lib/exportGrades';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Mail, Search, FileDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { motion } from "motion/react";
import { toast } from "sonner";

import { SafePage } from "@/components/SafePage";

export default function StudentsList() {
  const { session } = useLtiSession();
  const { students, loading, error } = useStudents();
  const [search, setSearch] = useState("");

  async function handleExport() {
    if (!session) {
      toast.error("יש לפתוח את המערכת מתוך Moodle כדי לייצא");
      return;
    }
    try {
      await exportStudentsCsv(session.site_id, session.course_id);
      toast.success("הקובץ הורד בהצלחה");
    } catch (err: any) {
      toast.error(err.message || "שגיאה בייצוא");
    }
  }
  
  const filtered = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafePage 
      title="תלמידים" 
      description={`ניהול ומעקב אחרי ${students.length} משתתפים רשומים.`}
    >
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {students.length > 0 && (
              <Button className="font-bold bg-primary text-white hover:bg-primary/90" onClick={handleExport}>
                <FileDown className="h-4 w-4 ml-2" />
                ייצוא רשימה
              </Button>
            )}
          </div>
        </div>

        {loading ? (
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
             <div className="h-32 bg-muted animate-pulse rounded-xl" />
             <div className="h-32 bg-muted animate-pulse rounded-xl" />
             <div className="h-32 bg-muted animate-pulse rounded-xl" />
           </div>
        ) : students.length === 0 ? (
        <Card className="bg-muted/30 border-none shadow-elegant">
          <CardContent className="p-16 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-2xl">עדיין לא יובאו נתוני תלמידים</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">כדי לראות את רשימת התלמידים, עליך לייבא קובץ רשימת משתתפים או דוח ציונים ממודל.</p>
            </div>
            <Button asChild size="lg" className="font-black px-10">
              <Link to="/import">עבור לייבוא נתונים</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
           <div className="relative">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input 
               placeholder="חיפוש לפי שם, דואיל או מזהה..." 
               className="pr-12 h-14 text-lg border-2 focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {filtered.map((student, idx) => (
               <motion.div
                 key={student.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.03 }}
               >
               <Link to={`/student/${student.id}`} className="block">
                 <Card className="group hover:ring-2 hover:ring-primary/20 transition-all border-none shadow-elegant bg-background/50 backdrop-blur-sm overflow-hidden h-full cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                          {student.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black truncate text-lg">{student.full_name}</h4>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <div className="px-2 py-1 bg-muted rounded-md text-[10px] font-bold text-muted-foreground">
                          ID: {student.external_id || "—"}
                        </div>
                      </div>
                    </CardContent>
                 </Card>
               </Link>
               </motion.div>
             ))}
           </div>
           
           {filtered.length === 0 && (
             <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed">
               <p className="font-bold">לא נמצאו תלמידים התואמים את החיפוש "{search}"</p>
             </div>
           )}
        </div>
      )}
    </div>
    </SafePage>
  );
}
