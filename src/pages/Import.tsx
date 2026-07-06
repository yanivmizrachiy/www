import { useState, useRef } from "react";
import { SafePage } from "@/components/SafePage";
import { ImportEmptyState } from "@/components/ImportEmptyState";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { parseMoodleFile, parsePastedTable, MoodleImportResult } from "@/lib/moodleImport";
import { postImport } from "@/hooks/useImports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Upload, 
  Clipboard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function Import() {
  const [result, setResult] = useState<MoodleImportResult | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await parseMoodleFile(file);
      setResult(res);
      toast.success("הקובץ נקרא בהצלחה");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה בטעינת הקובץ");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = () => {
    try {
      if (!pastedText.trim()) throw new Error("יש להדביק תוכן");
      const res = parsePastedTable(pastedText);
      setResult(res);
      toast.success("התוכן נקרא בהצלחה");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה בניתוח התוכן");
    }
  };

  const handleSubmit = async () => {
    if (!result) return;
    try {
      setIsUploading(true);
      const res = await postImport({
        report_type: result.reportType as any,
        file_name: result.fileName,
        source_kind: result.fileName ? "upload" : "paste",
        detection_confidence: result.confidence,
        payload: result.data
      });

      if (res.ok) {
        toast.success(`הייבוא הושלם: ${res.row_count} שורות נקלטו`);
        setResult(null);
        setPastedText("");
      } else {
        throw new Error(res.error || "שגיאה בשרת");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה בייבוא");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafePage 
      title="ייבוא נתונים" 
      description="מערכת הניתוח קוראת את דוחות ה-Moodle שלך ומציגה אותם במרכז המורה."
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFile}
          accept=".csv,.xlsx,.xls,.ods"
        />

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div 
                className="cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImportEmptyState />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg" className="gap-2 h-14 md:px-10">
                  <Upload className="h-5 w-5" />
                  בחר קובץ Moodle
                </Button>
                
                <div className="flex-1 max-w-md">
                   <Card>
                     <CardContent className="p-2 flex gap-2">
                        <Textarea 
                          placeholder="או הדבק טבלה כאן..." 
                          className="min-h-[46px] h-[46px] py-2 text-xs"
                          value={pastedText}
                          onChange={(e) => setPastedText(e.target.value)}
                        />
                        <Button 
                          onClick={handlePaste} 
                          disabled={!pastedText.trim()}
                          size="icon"
                          className="shrink-0"
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                     </CardContent>
                   </Card>
                </div>
              </div>
              
              <div className="rounded-2xl border bg-muted/30 p-6 flex gap-4 text-sm items-start">
                 <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                 <div>
                    <h4 className="font-bold mb-1">טיפ לייבוא מוצלח</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      מומלץ לייצא ממודל בפורמט Excel. המערכת יודעת לזהות דוחות תלמידים, ציונים, לוגים והשלמת פעילות.
                      אם אתה מדביק טבלה, וודא שאתה מעתיק גם את שורת הכותרות.
                    </p>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className="border-primary/20 bg-primary/5 shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-status-proven-bg p-3 text-status-proven ring-4 ring-status-proven-bg/30">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        זוהה דוח: {result.reportType === 'students' ? 'תלמידים' : result.reportType === 'grades' ? 'ציונים' : result.reportType === 'logs' ? 'לוגים' : 'השלמת פעילות'}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.fileName ? `קובץ: ${result.fileName}` : 'טבלה שהודבקה'} · {result.rowCount} שורות לצריבה
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setResult(null)} disabled={isUploading}>
                      ביטול
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isUploading} className="gap-2 shadow-lg">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      אשר וייבא נתונים
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 border-t bg-background/50">
                  <div className="max-h-[350px] overflow-auto">
                    <Table dir="rtl">
                      <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                          {result.headers.slice(0, 6).map((h) => (
                            <TableHead key={h} className="text-right text-[10px] whitespace-nowrap">{h}</TableHead>
                          ))}
                          {result.headers.length > 6 && <TableHead className="text-right">...</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.data.slice(0, 10).map((row, i) => (
                          <TableRow key={i} className="hover:bg-muted/20">
                            {result.headers.slice(0, 6).map((h) => (
                              <TableCell key={h} className="text-[11px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                {String(row[h] || "")}
                              </TableCell>
                            ))}
                            {result.headers.length > 6 && <TableCell className="text-muted-foreground">...</TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="p-3 text-center border-t bg-muted/10">
                     <div className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <VerifiedBadge status="imported" />
                        מציג 10 שורות ראשונות מתוך {result.rowCount}
                     </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SafePage>
  );
}

