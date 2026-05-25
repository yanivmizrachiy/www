import { Link } from "react-router-dom";
import { useMemo } from "react";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useCourseStructure } from "@/hooks/useImports";
import { Layers, ChevronLeft } from "lucide-react";

// MTH_CHAPTERS_TASKS_PREMIUM_FLOW_V1
// Premium Hebrew RTL chapters list: each chapter is clickable, shows a real
// task count, and links to its detail page. Real data only — clear empty
// state when no course structure has been imported/extracted.

export default function Page() {
  const { data, loading, error } = useCourseStructure();

  const chapters = data?.chapters ?? [];
  const tasks = data?.tasks ?? [];

  // Count real tasks per chapter (only tasks that carry a chapter_id).
  const tasksPerChapter = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) {
      if (t.chapter_id) map[t.chapter_id] = (map[t.chapter_id] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  const sortedChapters = useMemo(
    () =>
      [...chapters].sort(
        (a, b) => (a.position ?? 9999) - (b.position ?? 9999)
      ),
    [chapters]
  );

  return (
    <SafePage
      title="פרקים ופעילויות"
      description="פרקי הקורס. לחיצה על פרק מציגה את המשימות שבו."
    >
      <div className="space-y-4" dir="rtl">
        {loading ? (
          <p className="text-sm text-muted-foreground">טוען מבנה קורס...</p>
        ) : error ? (
          <EmptyTruth>{error}</EmptyTruth>
        ) : !sortedChapters.length ? (
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 text-sm leading-7 text-orange-950">
            <h3 className="mb-2 text-base font-extrabold">עדיין אין מבנה קורס</h3>
            <p>
              לא נמצאו פרקים. כדי לראות פרקים ומשימות אמיתיים, פתח את הכלי מתוך
              Moodle עם מבנה קורס פעיל, או ייבא דוח Course Structure / Activity
              Completion אמיתי. לא מוצגים פרקים מומצאים.
            </p>
            <div className="mt-4">
              <Link
                to="/import"
                className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
              >
                עבור לייבוא מבנה קורס
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedChapters.map((c) => {
              const count = tasksPerChapter[c.id] ?? 0;
              return (
                <li key={c.id}>
                  <Link
                    to={`/chapters/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Layers className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-base font-extrabold text-slate-900">
                          {c.chapter_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {count > 0
                            ? `${count} משימות בפרק`
                            : "אין משימות מקושרות לפרק זה"}
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SafePage>
  );
}
