import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ImportedStudent = Tables<"imported_students">;
type ImportedGradeItem = Tables<"imported_grade_items">;
type ImportedGrade = Tables<"imported_grades">;

export async function exportGradesCsv(siteId: string, courseId: number): Promise<void> {
  const [{ data: students }, { data: gradeItems }, { data: grades }] = await Promise.all([
    supabase
      .from("imported_students")
      .select("id, full_name, email, external_id")
      .eq("site_id", siteId)
      .eq("course_id", courseId)
      .order("full_name"),
    supabase
      .from("imported_grade_items")
      .select("id, item_name")
      .eq("site_id", siteId)
      .eq("course_id", courseId)
      .order("item_name"),
    supabase
      .from("imported_grades")
      .select("student_id, grade_item_id, numeric_value, raw_value, is_missing")
      .eq("site_id", siteId)
      .eq("course_id", courseId),
  ]);

  if (!students?.length || !gradeItems?.length) {
    throw new Error("אין נתונים לייצוא");
  }

  // Build header row: student fields + grade item names
  const headers = ["שם מלא", "אימייל", "מזהה", ...gradeItems.map((g) => g.item_name)];

  // Build a lookup: student_id -> grade_item_id -> value
  const gradeMap: Record<string, Record<string, string>> = {};
  for (const g of grades || []) {
    if (!gradeMap[g.student_id]) gradeMap[g.student_id] = {};
    gradeMap[g.student_id][g.grade_item_id] = g.is_missing
      ? "חסר"
      : g.numeric_value !== null
      ? String(g.numeric_value)
      : (g.raw_value ?? "—");
  }

  const rows = students.map((s: ImportedStudent) => {
    const row: (string | number | null)[] = [
      s.full_name,
      s.email ?? "",
      s.external_id ?? "",
    ];
    for (const gi of gradeItems) {
      row.push(gradeMap[s.id]?.[gi.id] ?? "—");
    }
    return row;
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ציונים");
  XLSX.writeFile(wb, "grades-export.xlsx");
}

export async function exportStudentsCsv(siteId: string, courseId: number): Promise<void> {
  const { data: students } = await supabase
    .from("imported_students")
    .select("full_name, email, external_id, external_username")
    .eq("site_id", siteId)
    .eq("course_id", courseId)
    .order("full_name");

  if (!students?.length) throw new Error("אין תלמידים לייצוא");

  const headers = ["שם מלא", "אימייל", "מזהה", "שם משתמש"];
  const rows = students.map((s: ImportedStudent) => [
    s.full_name,
    s.email ?? "",
    s.external_id ?? "",
    s.external_username ?? "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "תלמידים");
  XLSX.writeFile(wb, "students-export.xlsx");
}
