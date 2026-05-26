import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useCourseStructure } from "@/hooks/useImports";
import { classifyTaskVisual } from "@/lib/taskTypeVisuals";
import { ArrowRight } from "lucide-react";

// MTH_CHAPTERS_TASKS_PREMIUM_FLOW_V1
// Chapter detail: shows the REAL tasks that belong to this chapter, each with
// the classified visual (icon + Hebrew label + color) from the task visual
// system. Real data only — honest empty state when the chapter has no tasks
// or no structure was imported.

function TaskRow({
  taskName,
  taskType,
  dueDate,
}: {
  taskName: string;
  taskType: string | null;
  dueDate: string | null;
}) {
  const visual = classifyTaskVisual({ taskType, taskName });
  const Icon = visual.Icon;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${visual.iconClass}`} />
        <div>
          <div className="text-sm font-bold text-slate-900">{taskName}</div>
          {dueDate && (
            <div className="text-xs text-muted-foreground">להגשה: {dueDate}</div>
          )}
        </div>
      </div>
      <span
        className={`shrink-0 rounded border px-2 py-1 text-[10px] font-bold ${visual.badgeClass}`}
      >
        {visual.labelHe}
      </span>
    </div>
  );
}

export default function ChapterDetail() {
  const { sectionId } = useParams();
  const { data, loading, error } = useCourseStructure();

  const chapter = useMemo(
    () => data?.chapters?.find((c) => c.id === sectionId) ?? null,
    [data, sectionId]
  );

  const chapterTasks = useMemo(
    () =>
      (data?.tasks ?? [])
        .filter((t) => t.chapter_id === sectionId)
        .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999)),
    [data, sectionId]
  );

  const title = chapter?.chapter_name ?? "פרק";

  return (
    <SafePage
      title={title}
      description="המשימות בפרק זה לפי מבנה הקורס."
    >
      <div className="space-y-4" dir="rtl">
        <Link
          to="/chapters"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לכל הפרקים
        </Link>

        {loading ? (
          <p className="text-sm text-muted-foreground">טוען משימות הפרק...</p>
        ) : error ? (
          <EmptyTruth>{error}</EmptyTruth>
        ) : !chapter ? (
          <EmptyTruth>
            הפרק לא נמצא במבנה הקורס. ייתכן שהמבנה טרם יובא, או שהקישור אינו תקף.
          </EmptyTruth>
        ) : !chapterTasks.length ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
            <h3 className="mb-1 font-extrabold">אין משימות בפרק זה</h3>
            <p>אם חסרות משימות, ייבא דוח Activity Completion עדכני.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {chapterTasks.map((t) => (
              <li key={t.id}>
                <TaskRow
                  taskName={t.task_name}
                  taskType={t.task_type}
                  dueDate={t.due_date}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SafePage>
  );
}
