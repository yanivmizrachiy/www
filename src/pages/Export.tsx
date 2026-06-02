import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, BookOpen } from "lucide-react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGradesMatrix,
  useImportedStudents,
  usePracticeTime,
  useImportsOverview,
  useStudentReports,
  useTaskCompletionDetail,
  useDailyActivity,
  useActivityOverview,
  useCourseStructure,
  useStudentProfile,
  useNrpsRoster,
} from "@/hooks/useImports";
import {
  exportSheetXlsx,
  exportWorkbookXlsx,
  sheetDate,
  sheetWeekday,
  type ExportSheet,
} from "@/lib/exportSheet";
import { REPORT_STATUS_LABEL } from "@/lib/reportStatus";
import { hebrewRoleLabel } from "@/lib/roleLabel";

// MTH_EXCEL_EXPORT_PREMIUM_V1
// Professional, Hebrew RTL Excel export hub. Every sheet uses real imported /
// NRPS data only — no demo rows, no invented counts. Privacy by default: we do
// NOT export emails, raw Moodle/national identifiers, tokens, secrets or client
// assertions. Student "external_username" (the Moodle login the teacher already
// sees in the UI) is the only identifier exported, and only on the students
// sheet. When a source is missing we keep the export disabled with a truthful
// reason rather than producing an empty or fabricated file.

function ExportCard({
  title,
  description,
  disabledReason,
  onExport,
  icon,
}: {
  title: string;
  description: string;
  disabledReason?: string;
  onExport: () => void;
  icon?: React.ReactNode;
}) {
  const disabled = Boolean(disabledReason);
  return (
    <Card className="border bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon ?? <FileSpreadsheet className="h-5 w-5 text-primary" />}
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
  const overview = useImportsOverview();
  const studentReports = useStudentReports();
  const taskDetail = useTaskCompletionDetail();
  const dailyActivity = useDailyActivity();
  const activity = useActivityOverview();
  const courseStructure = useCourseStructure();
  const roster = useNrpsRoster();

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const profile = useStudentProfile(selectedStudentId || null);

  const hasAnySessionData = Boolean(
    students.data?.length ||
      grades.data?.grades?.length ||
      practice.data?.days?.length ||
      studentReports.data?.length ||
      roster.data?.live,
  );

  // ---- Students (safe: name + Moodle username only, no email / raw id) ----
  const exportStudents = () => {
    const sheet: ExportSheet<NonNullable<typeof students.data>[number]> = {
      name: "תלמידים",
      columns: [
        { header: "שם תלמיד", value: (s) => s.full_name },
        { header: "שם משתמש Moodle", value: (s) => s.external_username ?? "" },
        { header: "עודכן לאחרונה", value: (s) => sheetDate(s.updated_at) },
      ],
      rows: students.data ?? [],
    };
    exportSheetXlsx("moodle-students", sheet);
  };

  // ---- Teachers (NRPS instructors: name + Hebrew role only) ----
  const exportTeachers = () => {
    const rows = roster.data?.instructors ?? [];
    exportSheetXlsx("moodle-teachers", {
      name: "מורים",
      columns: [
        { header: "שם", value: (m) => m.name },
        { header: "תפקיד", value: (m) => hebrewRoleLabel(m.role_kind) },
      ],
      rows,
    });
  };

  // ---- Participants (full NRPS roster: name + role, no ids/emails) ----
  const exportParticipants = () => {
    const rows = roster.data?.members ?? [];
    exportSheetXlsx("moodle-participants", {
      name: "משתתפים",
      columns: [
        { header: "שם", value: (m) => m.name },
        { header: "תפקיד", value: (m) => hebrewRoleLabel(m.role_kind) },
      ],
      rows,
    });
  };

  // ---- Grades matrix ----
  const exportGrades = () => {
    const matrix = grades.data;
    if (!matrix) return;
    const studentById = new Map(matrix.students.map((s) => [s.id, s.full_name]));
    const itemById = new Map(matrix.items.map((i) => [i.id, i]));
    exportSheetXlsx("moodle-grades", {
      name: "ציונים",
      columns: [
        { header: "שם תלמיד", value: (g) => studentById.get(g.student_id) ?? g.student_id },
        { header: "משימה / פריט ציון", value: (g) => itemById.get(g.grade_item_id)?.item_name ?? g.grade_item_id },
        { header: "סוג פריט", value: (g) => itemById.get(g.grade_item_id)?.item_type ?? "" },
        { header: "ציון מרבי", value: (g) => itemById.get(g.grade_item_id)?.max_grade ?? "" },
        { header: "ציון מספרי", value: (g) => g.numeric_value ?? "" },
        {
          header: "סטטוס",
          value: (g) =>
            g.is_missing
              ? REPORT_STATUS_LABEL.missing_grade
              : g.numeric_value === null
                ? REPORT_STATUS_LABEL.unknown
                : "",
        },
      ],
      rows: matrix.grades,
    });
  };

  // ---- Tasks (course structure with completion summary per task) ----
  const exportTasks = () => {
    const structure = courseStructure.data;
    const detail = taskDetail.data;
    if (!structure?.tasks.length && !detail?.tasks.length) return;
    const chapterById = new Map((structure?.chapters ?? []).map((c) => [c.id, c.chapter_name]));
    const tasks = structure?.tasks.length ? structure.tasks : (detail?.tasks ?? []).map((t) => ({
      id: t.id, task_name: t.task_name, task_type: t.task_type, chapter_id: t.chapter_id, position: t.position, due_date: null as string | null,
    }));
    const completeByTask = new Map<string, number>();
    const incompleteByTask = new Map<string, number>();
    for (const r of detail?.rows ?? []) {
      if (r.is_complete === true) completeByTask.set(r.task_id, (completeByTask.get(r.task_id) ?? 0) + 1);
      else if (r.is_complete === false) incompleteByTask.set(r.task_id, (incompleteByTask.get(r.task_id) ?? 0) + 1);
    }
    exportSheetXlsx("moodle-tasks", {
      name: "משימות",
      columns: [
        { header: "פרק", value: (t) => (t.chapter_id ? chapterById.get(t.chapter_id) ?? "" : "") },
        { header: "שם משימה", value: (t) => t.task_name },
        { header: "סוג", value: (t) => t.task_type ?? "" },
        { header: "תאריך יעד", value: (t) => sheetDate((t as { due_date?: string | null }).due_date ?? null) },
        { header: "בוצעו", value: (t) => completeByTask.get(t.id) ?? "" },
        { header: REPORT_STATUS_LABEL.not_done, value: (t) => incompleteByTask.get(t.id) ?? "" },
      ],
      rows: tasks,
    });
  };

  // ---- Logs (daily activity + per-student activity from imported logs) ----
  const exportLogs = () => {
    const days = dailyActivity.data ?? [];
    const perStudent = activity.data?.per_student ?? [];
    if (!days.length && !perStudent.length) return;
    const sheets: ExportSheet<unknown>[] = [];
    if (days.length) {
      sheets.push({
        name: "פעילות יומית",
        columns: [
          { header: "תאריך", value: (d) => sheetDate((d as { day: string }).day) },
          { header: "יום בשבוע", value: (d) => sheetWeekday((d as { day: string }).day) },
          { header: "אירועים", value: (d) => (d as { events: number }).events },
          { header: "תלמידים פעילים", value: (d) => (d as { active_students: number }).active_students },
        ],
        rows: days,
      } as ExportSheet<unknown>);
    }
    if (perStudent.length) {
      sheets.push({
        name: "פעילות לפי תלמיד",
        columns: [
          { header: "שם תלמיד", value: (p) => (p as { full_name: string }).full_name },
          { header: "אירועים", value: (p) => (p as { event_count: number }).event_count },
          { header: "ימי פעילות", value: (p) => (p as { active_days: number }).active_days },
          { header: "אירוע ראשון", value: (p) => sheetDate((p as { first_event: string | null }).first_event) },
          { header: "אירוע אחרון", value: (p) => sheetDate((p as { last_event: string | null }).last_event) },
        ],
        rows: perStudent,
      } as ExportSheet<unknown>);
    }
    exportWorkbookXlsx("moodle-logs", sheets);
  };

  // ---- Gaps report (which source reports are missing) ----
  const gapRows = useMemo(() => {
    const d = overview.data;
    if (!d) return [];
    return [
      { label: "תלמידים / משתתפים", present: !!d.students_count, count: d.students_count },
      { label: "גיליון ציונים (Gradebook)", present: !!d.grades_count, count: d.grades_count },
      { label: "השלמת פעילות (Activity Completion)", present: !!d.tasks_count, count: d.tasks_count },
      { label: "יומני מעקב (Logs)", present: !!d.log_events_count, count: d.log_events_count },
    ];
  }, [overview.data]);

  const exportGaps = () => {
    if (!gapRows.length) return;
    exportSheetXlsx("moodle-gaps-report", {
      name: "דוח פערים",
      columns: [
        { header: "מקור נתונים", value: (r) => r.label },
        { header: "סטטוס", value: (r) => (r.present ? "קיים" : REPORT_STATUS_LABEL.no_data) },
        { header: "כמות רשומות", value: (r) => r.count },
      ],
      rows: gapRows,
    });
  };

  // ---- Personal student report (per selected student) ----
  const exportPersonal = () => {
    const p = profile.data;
    if (!p) return;
    const sheets: ExportSheet<unknown>[] = [];
    if (p.grades.length) {
      sheets.push({
        name: "ציונים",
        columns: [
          { header: "פריט ציון", value: (g) => (g as { item_name: string }).item_name },
          { header: "סוג", value: (g) => (g as { item_type: string | null }).item_type ?? "" },
          { header: "ציון מרבי", value: (g) => (g as { max_grade: number | null }).max_grade ?? "" },
          { header: "ציון", value: (g) => (g as { numeric_value: number | null }).numeric_value ?? "" },
          {
            header: "סטטוס",
            value: (g) => ((g as { is_missing: boolean }).is_missing ? REPORT_STATUS_LABEL.missing_grade : ""),
          },
        ],
        rows: p.grades,
      } as ExportSheet<unknown>);
    }
    if (p.completion.length) {
      sheets.push({
        name: "משימות",
        columns: [
          { header: "משימה", value: (c) => (c as { task_name: string }).task_name },
          { header: "סוג", value: (c) => (c as { task_type: string | null }).task_type ?? "" },
          {
            header: "סטטוס",
            value: (c) => {
              const isComplete = (c as { is_complete: boolean | null }).is_complete;
              if (isComplete === null) return REPORT_STATUS_LABEL.no_data;
              return isComplete ? "הושלם" : REPORT_STATUS_LABEL.not_done;
            },
          },
          { header: "הושלם בתאריך", value: (c) => sheetDate((c as { completed_at: string | null }).completed_at) },
        ],
        rows: p.completion,
      } as ExportSheet<unknown>);
    }
    sheets.push({
      name: "סיכום פעילות",
      columns: [
        { header: "מדד", value: (r) => (r as { k: string }).k },
        { header: "ערך", value: (r) => (r as { v: string | number }).v },
      ],
      rows: [
        { k: "תלמיד", v: p.student.full_name },
        { k: "סך אירועים", v: p.activity.event_count },
        { k: "ימי פעילות", v: p.activity.active_days },
        { k: "אירוע ראשון", v: sheetDate(p.activity.first_event) },
        { k: "אירוע אחרון", v: sheetDate(p.activity.last_event) },
      ],
    } as ExportSheet<unknown>);
    const safeName = p.student.full_name.replace(/\s+/g, "-");
    exportWorkbookXlsx(`moodle-student-${safeName}`, sheets);
  };

  // ---- Full course report (multi-sheet aggregate of all real data) ----
  const exportFullCourse = () => {
    const sheets: ExportSheet<unknown>[] = [];
    if (studentReports.data?.length) {
      sheets.push({
        name: "סיכום תלמידים",
        columns: [
          { header: "שם תלמיד", value: (r) => (r as { full_name: string }).full_name },
          { header: "פריטי ציון", value: (r) => (r as { graded_items: number }).graded_items },
          {
            header: "ממוצע",
            value: (r) => {
              const avg = (r as { avg_grade: number | null }).avg_grade;
              return avg === null ? REPORT_STATUS_LABEL.no_data : Math.round(avg);
            },
          },
          { header: "משימות בוצעו", value: (r) => (r as { tasks_complete: number }).tasks_complete },
          { header: REPORT_STATUS_LABEL.not_done, value: (r) => (r as { tasks_incomplete: number }).tasks_incomplete },
          { header: "אירועים", value: (r) => (r as { event_count: number }).event_count },
          { header: "ימי פעילות", value: (r) => (r as { active_days: number }).active_days },
          { header: "עדכון אחרון", value: (r) => sheetDate((r as { last_event: string | null }).last_event) },
        ],
        rows: studentReports.data,
      } as ExportSheet<unknown>);
    }
    if (gapRows.length) {
      sheets.push({
        name: "דוח פערים",
        columns: [
          { header: "מקור נתונים", value: (r) => (r as { label: string }).label },
          { header: "סטטוס", value: (r) => ((r as { present: boolean }).present ? "קיים" : REPORT_STATUS_LABEL.no_data) },
          { header: "כמות רשומות", value: (r) => (r as { count: number }).count },
        ],
        rows: gapRows,
      } as ExportSheet<unknown>);
    }
    if ((dailyActivity.data ?? []).length) {
      sheets.push({
        name: "פעילות יומית",
        columns: [
          { header: "תאריך", value: (d) => sheetDate((d as { day: string }).day) },
          { header: "יום בשבוע", value: (d) => sheetWeekday((d as { day: string }).day) },
          { header: "אירועים", value: (d) => (d as { events: number }).events },
          { header: "תלמידים פעילים", value: (d) => (d as { active_students: number }).active_students },
        ],
        rows: dailyActivity.data ?? [],
      } as ExportSheet<unknown>);
    }
    exportWorkbookXlsx("moodle-full-course-report", sheets);
  };

  const noRoster = !roster.data?.live;
  const studentOptions = students.data ?? [];

  return (
    <SafePage title="ייצוא לאקסל" description="הורדת קבצי Excel מקצועיים מהנתונים האמיתיים שבמערכת." backTo="-1">
      <div className="space-y-6" dir="rtl">
        {!hasAnySessionData && (
          <EmptyTruth>אין עדיין נתונים לייצוא. פתח את הכלי מתוך Moodle או ייבא דוח.</EmptyTruth>
        )}

        <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
          הקבצים נשמרים בעברית מימין לשמאל, עם תאריך ישראלי (D/M/YY). מטעמי פרטיות לא מיוצאים דוא״ל, מזהים גולמיים, טוקנים או סודות.
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ExportCard
            title="דוח תלמידים"
            description="שם תלמיד ושם משתמש Moodle. ללא דוא״ל ומזהים גולמיים."
            disabledReason={!students.data?.length ? "אין עדיין תלמידים." : undefined}
            onExport={exportStudents}
          />

          <ExportCard
            title="דוח מורים"
            description="צוות ההוראה מתוך NRPS — שם ותפקיד בלבד."
            disabledReason={noRoster ? "NRPS לא פעיל. פתח את הכלי מתוך Moodle. לא אומת." : !roster.data?.instructors.length ? "לא התקבלו שמות מורים מ-NRPS." : undefined}
            onExport={exportTeachers}
          />

          <ExportCard
            title="דוח משתתפים"
            description="כלל המשתתפים מתוך NRPS — שם ותפקיד בלבד."
            disabledReason={noRoster ? "NRPS לא פעיל. פתח את הכלי מתוך Moodle. לא אומת." : !roster.data?.members.length ? "לא התקבלו שמות משתתפים מ-NRPS." : undefined}
            onExport={exportParticipants}
          />

          <ExportCard
            title="דוח ציונים"
            description="מטריצת ציונים לפי תלמיד ופריט, כולל סטטוס חסר ציון."
            disabledReason={!grades.data?.grades?.length ? "אין עדיין ציונים." : undefined}
            onExport={exportGrades}
          />

          <ExportCard
            title="דוח משימות"
            description="מבנה המשימות והשלמתן לפי פרק."
            disabledReason={!courseStructure.data?.tasks?.length && !taskDetail.data?.tasks?.length ? "אין עדיין משימות." : undefined}
            onExport={exportTasks}
          />

          <ExportCard
            title="דוח לוגים"
            description="פעילות יומית ופעילות לפי תלמיד מתוך הלוגים."
            disabledReason={!dailyActivity.data?.length && !activity.data?.per_student?.length ? "אין עדיין לוגים." : undefined}
            onExport={exportLogs}
          />

          <ExportCard
            title="דוח פערים"
            description="אילו דוחות מקור קיימים ואילו עדיין חסרים."
            disabledReason={!overview.data ? "אין עדיין נתוני סקירה." : undefined}
            onExport={exportGaps}
          />

          <ExportCard
            title="דוח קורס מלא"
            description="ריכוז רב-גיליונות: סיכום תלמידים, פערים ופעילות יומית."
            disabledReason={!studentReports.data?.length && !dailyActivity.data?.length ? "אין עדיין מספיק נתונים." : undefined}
            onExport={exportFullCourse}
            icon={<BookOpen className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Personal student report — needs a real selected student */}
        <Card className="border bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              דוח תלמיד אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              ציונים, השלמת משימות וסיכום פעילות עבור תלמיד נבחר.
            </p>
            {!studentOptions.length ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                אין עדיין תלמידים. ייבא דוח תלמידים כדי לייצא דוח אישי.
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">בחר תלמיד…</option>
                {studentOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={exportPersonal}
              disabled={!selectedStudentId || !profile.data}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              הורד Excel
            </Button>
          </CardContent>
        </Card>
      </div>
    </SafePage>
  );
}
