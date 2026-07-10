import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useCourseStructure } from "@/hooks/useImports";
import { classifyTaskVisual } from "@/lib/taskTypeVisuals";
import { formatTeacherDateDmyShort } from "@/lib/teacherDateFormat";
import { CheckCircle2, XCircle, HelpCircle, ExternalLink, Link2Off } from "lucide-react";

// MTH_CHAPTERS_TASKS_PREMIUM_FLOW_V1 + MTH_ACTIVITY_REAL_FLOW_V1
// Chapter detail: shows the REAL activities/tasks that belong to this chapter.
// Each row surfaces, truthfully:
//   • Activity TYPE — classified visual (icon + Hebrew label + color) from the
//     task visual system. When the source carries no usable type signal it
//     reads "סוג לא ידוע" (handled inside the classifier) — never invented.
//   • STATUS — derived ONLY from the real completion summary for this task
//     (complete / incomplete / unknown counts). When the source has no
//     completion data for the task it reads "אין נתון" — never invented.
//   • Real Moodle LINK — opened ONLY when the source actually provides a URL.
//     When absent it reads "אין קישור Moodle" — we never guess/generate a URL.
// Real data only — honest empty state when the chapter has no tasks or no
// structure was imported.

type CompletionSummary = { complete: number; incomplete: number; unknown: number; total: number };

// Derive a short, honest Hebrew status label from REAL completion data only.
// Returns null when there is no completion data to report on (caller shows
// the explicit "אין נתון" fallback).
function statusFromCompletion(c?: CompletionSummary | null): { label: string; tone: "green" | "amber" | "slate" } | null {
  if (!c || c.total <= 0) return null;
  if (c.complete === c.total) return { label: "הושלם", tone: "green" };
  if (c.complete === 0) return { label: "טרם הושלם", tone: "slate" };
  return { label: `הושלם חלקית (${c.complete}/${c.total})`, tone: "amber" };
}

// Accept only real, absolute http(s) URLs. Anything else (relative, empty,
// javascript:, mailto:, guessed) is rejected so we never open a fake link.
function safeMoodleUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

function TaskRow({
  taskName,
  taskType,
  dueDate,
  moodleUrl,
  completion,
}: {
  taskName: string;
  taskType: string | null;
  dueDate: string | null;
  moodleUrl?: string | null;
  completion?: CompletionSummary | null;
}) {
  const visual = classifyTaskVisual({ taskType, taskName });
  const Icon = visual.Icon;
  const status = statusFromCompletion(completion);
  const url = safeMoodleUrl(moodleUrl);

  const statusToneClass =
    status?.tone === "green"
      ? "border-green-200 bg-green-50 text-green-800"
      : status?.tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${visual.iconClass}`} />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900">{taskName}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {/* STATUS — real completion data only, else explicit "no data". */}
            {status ? (
              <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${statusToneClass}`}>
                {status.label}
              </span>
            ) : (
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                אין נתון
              </span>
            )}

            {dueDate && (
              <span className="text-xs text-muted-foreground">להגשה: {formatTeacherDateDmyShort(dueDate)}</span>
            )}

            {completion && completion.total > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {completion.complete}
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
                {completion.incomplete}
                {completion.unknown > 0 && (
                  <><HelpCircle className="h-3 w-3 text-slate-400 mr-1" />{completion.unknown}</>
                )}
              </span>
            )}

            {/* Real Moodle link only — never a guessed URL. */}
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                פתח ב-Moodle
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Link2Off className="h-3 w-3" />
                אין קישור Moodle
              </span>
            )}
          </div>
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
      backTo="/chapters"
      backLabel="חזרה לכל הפרקים"
    >
      <div className="space-y-4" dir="rtl">

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
            <p>אם חסרות משימות, ייבא דוח "השלמת פעילות" עדכני.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {chapterTasks.map((t) => (
              <li key={t.id}>
                <TaskRow
                  taskName={t.task_name}
                  taskType={t.task_type}
                  dueDate={t.due_date}
                  moodleUrl={t.moodle_url ?? null}
                  completion={data?.completion_summary?.[t.id] ?? null}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SafePage>
  );
}
