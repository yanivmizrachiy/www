import * as XLSX from "xlsx";
import { Download, FileSpreadsheet } from "lucide-react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGradesMatrix, useImportedStudents, usePracticeTime } from "@/hooks/useImports";

function downloadWorkbook(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return false;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
  return true;
}

function ExportCard({
  title,
  description,
  disabledReason,
  onExport,
}: {
  title: string;
  description: string;
  disabledReason?: string;
  onExport: () => void;
}) {
  const disabled = Boolean(disabledReason);
  return (
    <Card className="border bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        {disabledReason && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            {disabledReason}
          </div>
        )}
        <Button onClick={onExport} disabled={disabled} className="w-full gap-2">
          <Download className="h-4 w-4" />
          הורד Excel
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Export() {
  const students = useImportedStudents();
  const grades = useGradesMatrix();
  const practice = usePracticeTime();

  const hasAnySessionData = Boolean(students.data || grades.data || practice.data);

  const exportStudents = () => {
    const rows = (students.data ?? []).map((student) => ({
      "שם תלמיד": student.full_name,
      "דואל": student.email ?? "",
      "שם משתמש Moodle": student.external_username ?? "",
      "מזהה Moodle": student.external_id ?? "",
      "עודכן לאחרונה": student.updated_at,
    }));
    downloadWorkbook("moodle-students.xlsx", "תלמידים", rows);
  };

  const exportGrades = () => {
    const matrix = grades.data;
    if (!matrix) return;
    const studentById = new Map(matrix.students.map((student) => [student.id, student.full_name]));
    const itemById = new Map(matrix.items.map((item) => [item.id, item]));
    const rows = matrix.grades.map((grade) => {
      const item = itemById.get(grade.grade_item_id);
      return {
        "שם תלמיד": studentById.get(grade.student_id) ?? grade.student_id,
        "משימה / פריט ציון": item?.item_name ?? grade.grade_item_id,
        "סוג פריט": item?.item_type ?? "",
        "ציון מרבי": item?.max_grade ?? "",
        "ציון מספרי": grade.numeric_value ?? "",
        "ערך מקורי": grade.raw_value ?? "",
        "חסר ציון": grade.is_missing ? "כן" : "לא",
      };
    });
    downloadWorkbook("moodle-grades.xlsx", "ציונים", rows);
  };

  const exportPractice = () => {
    const rows = (practice.data?.days ?? []).map((day) => ({
      "תאריך": day.day,
      "שם תלמיד": day.student_name ?? day.student_id,
      "סך שניות": day.total_seconds,
      "סך דקות": Math.round(day.total_seconds / 60),
      "מספר אירועים": day.event_count,
      "מספר חלונות פעילות": day.session_count,
      "פעילות ראשונה": day.first_at ?? "",
      "פעילות אחרונה": day.last_at ?? "",
    }));
    downloadWorkbook("moodle-practice-time.xlsx", "זמן תרגול", rows);
  };

  return (
    <SafePage
      title="ייצוא לאקסל"
      description="הורדת קבצי Excel מהנתונים שבמערכת."
    >
      <div className="space-y-6" dir="rtl">
        {!hasAnySessionData && (
          <EmptyTruth>אין עדיין נתונים לייצוא. פתח את הכלי מתוך Moodle או ייבא דוח.</EmptyTruth>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <ExportCard
            title="דוח תלמידים"
            description="שם, דוא״ל ומזהה לכל תלמיד."
            disabledReason={!students.data?.length ? "אין עדיין תלמידים." : undefined}
            onExport={exportStudents}
          />

          <ExportCard
            title="דוח ציונים"
            description="מטריצת ציונים לפי תלמיד ופריט."
            disabledReason={!grades.data?.grades?.length ? "אין עדיין ציונים." : undefined}
            onExport={exportGrades}
          />

          <ExportCard
            title="זמן תרגול יומי"
            description="זמן תרגול יומי לפי תלמיד."
            disabledReason={!practice.data?.days?.length ? "אין עדיין לוגים." : undefined}
            onExport={exportPractice}
          />
        </div>
      </div>
    </SafePage>
  );
}
