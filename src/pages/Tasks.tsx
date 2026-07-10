import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useCourseStructure } from "@/hooks/useImports";
import { TruthBadge } from "@/components/TruthBadge";
import { EmptyDomain } from "@/components/EmptyDomain";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Layout } from "lucide-react";
import { classifyTaskVisual } from "@/lib/taskTypeVisuals";

// MTH_TASK_TYPE_VISUAL_SYSTEM_V1 — render each real task with its classified
// icon + Hebrew label + color, based only on real task_type/task_name fields.
function TaskRow({
  taskName,
  taskType,
}: {
  taskName: string;
  taskType: string | null;
}) {
  const visual = classifyTaskVisual({ taskType, taskName });
  const Icon = visual.Icon;
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 ${visual.iconClass}`} />
        <span className="text-sm font-medium">{taskName}</span>
      </div>
      <span
        className={`text-[10px] px-2 py-1 rounded border font-bold ${visual.badgeClass}`}
      >
        {visual.labelHe}
      </span>
    </div>
  );
}

export default function Page() {
  const { data, loading, error } = useCourseStructure();
  const hasCourseStructureEvidence = Boolean(data && (data.chapters.length > 0 || data.tasks.length > 0));

  const getChapterTasks = (chapterId: string | null) => {
    return data?.tasks.filter(t => t.chapter_id === chapterId) ?? [];
  };

  const uncategorizedTasks = getChapterTasks(null);

  if (!loading && !data?.chapters.length && !uncategorizedTasks.length && !error) {
    return (
      <SafePage title="משימות ופרקים" description="מבנה הקורס והשלמות משימות." backTo="/" backLabel="חזרה למרכז המורה">
        <EmptyDomain
          domain="completion"
          title="אין נתוני משימות"
          description="ייבא דוח 'השלמת פעילות' ממודל."
        />
      </SafePage>
    );
  }

  return (
    <SafePage 
      title="משימות ופרקים" 
      description="מבנה הקורס והשלמות משימות כפי שנקלטו מדוחות Moodle."
    >
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
          </div>
        ) : error ? (
          <EmptyTruth>{error}</EmptyTruth>
        ) : !data?.chapters.length && !uncategorizedTasks.length ? (
          <Card className="border-dashed py-12 text-center text-muted-foreground">
             <Layout className="mx-auto mb-2 h-10 w-10 opacity-20" />
             <p>אין נתוני מבנה קורס. ייבא דוח "השלמת פעילות" מהמרחב במודל.</p>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4" dir="rtl">
            {data?.chapters.map((chapter) => {
              const tasks = getChapterTasks(chapter.id);
              const completion = data.completion_summary[chapter.id] || { complete: 0, total: 0 };
              
              return (
                <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-xl bg-card overflow-hidden px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-right">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold">{chapter.chapter_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tasks.length} משימות · השלמה: {completion.complete}/{completion.total}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4 space-y-2">
                      {tasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-2">אין משימות בפרק זה</p>
                      ) : (
                        tasks.map((task) => (
                          <TaskRow key={task.id} taskName={task.task_name} taskType={task.task_type} />
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}

            {uncategorizedTasks.length > 0 && (
              <AccordionItem value="uncategorized" className="border rounded-xl bg-card overflow-hidden px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-right">
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                      <Layout className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold">ללא פרק</div>
                      <div className="text-xs text-muted-foreground">{uncategorizedTasks.length} משימות</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4 space-y-2">
                    {uncategorizedTasks.map((task) => (
                      <TaskRow key={task.id} taskName={task.task_name} taskType={task.task_type} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
        <div className="flex justify-end">
          <TruthBadge status={hasCourseStructureEvidence ? "proven" : "missing"} />
        </div>
      </div>
    </SafePage>
  );
}

