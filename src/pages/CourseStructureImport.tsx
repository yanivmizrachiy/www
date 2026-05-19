import { useRef, useState } from "react";
import { parseMoodleFile, parsePastedTable } from "@/lib/moodleImport";
import { parseCourseStructureRows, type CourseStructureImportResult } from "@/lib/courseStructureImport";
import { SafePage } from "@/components/SafePage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

type PreviewState = {
  fileName?: string;
  rowCount: number;
  result: CourseStructureImportResult;
};

export default function CourseStructureImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pastedText, setPastedText] = useState("");
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      setError("");
      const parsed = await parseMoodleFile(file);
      setPreview({ fileName: parsed.fileName, rowCount: parsed.rowCount, result: parseCourseStructureRows(parsed.data) });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handlePaste() {
    try {
      setError("");
      const parsed = parsePastedTable(pastedText);
      setPreview({ rowCount: parsed.rowCount, result: parseCourseStructureRows(parsed.data) });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const sections = preview?.result.sections ?? [];
  const tasks = preview?.result.tasks ?? [];

  return (
    <SafePage title="ייבוא פרקים ופעילויות" description="תצוגה מקדימה מנתוני Moodle אמיתיים לפני שמירה.">
      <div className="space-y-6" dir="rtl">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.ods"
          className="hidden"
          onClick={(event) => { event.currentTarget.value = ""; }}
          onChange={handleFile}
        />

        <Card className="border-primary/10 bg-primary/5 shadow-elegant">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-primary">Activity Completion / Course Structure</h2>
                <p className="mt-1 text-sm font-bold text-muted-foreground">
                  העלה קובץ או הדבק טבלה ממודל. בשלב הזה מתבצעת תצוגה מקדימה בלבד, בלי שמירה למסד.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => fileInputRef.current?.click()} disabled={busy} className="font-black">
                  {busy ? "בודק..." : "בחר קובץ"}
                </Button>
                <Button asChild variant="outline" className="font-black"><Link to="/tasks">פתח פרקים ופעילויות</Link></Button>
              </div>
            </div>

            <textarea
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              placeholder="אפשר להדביק כאן טבלת Activity Completion / Course Structure כולל שורת כותרות"
              className="min-h-32 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm outline-none focus:border-primary"
            />
            <Button onClick={handlePaste} disabled={!pastedText.trim() || busy} variant="outline" className="font-black">בדוק טבלה מודבקת</Button>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">{error}</div>
        )}

        {preview && (
          <div className="space-y-4">
            <Card className="shadow-elegant">
              <CardContent className="grid gap-3 p-5 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-bold text-muted-foreground">מקור</div><div className="text-lg font-black">{preview.result.source_kind}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-bold text-muted-foreground">שורות</div><div className="text-lg font-black">{preview.rowCount}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-bold text-muted-foreground">פרקים</div><div className="text-lg font-black">{sections.length}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-bold text-muted-foreground">פעילויות</div><div className="text-lg font-black">{tasks.length}</div></div>
              </CardContent>
            </Card>

            {preview.result.warnings.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                {preview.result.warnings.map((warning) => <div key={warning}>{warning}</div>)}
              </div>
            )}

            <Card className="shadow-elegant">
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-2xl border">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border-b p-3 text-right">פעילות</th>
                        <th className="border-b p-3 text-right">פרק</th>
                        <th className="border-b p-3 text-right">סוג</th>
                        <th className="border-b p-3 text-right">מקור</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.slice(0, 80).map((task) => {
                        const section = sections.find((item) => item.id === task.section_id);
                        return (
                          <tr key={task.id}>
                            <td className="border-b p-3 font-bold">{task.name}</td>
                            <td className="border-b p-3">{section?.name || "ללא פרק"}</td>
                            <td className="border-b p-3">{task.type || "—"}</td>
                            <td className="border-b p-3">{task.source}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {tasks.length > 80 && <p className="p-3 text-center text-xs font-bold text-muted-foreground">מוצגות 80 פעילויות ראשונות מתוך {tasks.length}</p>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SafePage>
  );
}
