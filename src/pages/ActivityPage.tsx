import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useActivityOverview } from "@/hooks/useImports";
import { PracticeTimeSection } from "@/components/PracticeTimeSection";

export default function Page() { 
  const {data, loading, error} = useActivityOverview(); 
  
  return (
    <SafePage 
      title="פעילות / זמנים" 
      description="פעילות וזמן תרגול רק מלוגים אמיתיים."
    >
      <div className="space-y-8">
        <PracticeTimeSection />
        
        <div>
          <h2 className="mb-4 text-lg font-bold">אירועים אחרונים</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">טוען...</p>
          ) : error ? (
            <EmptyTruth>{error}</EmptyTruth>
          ) : (
            <ul className="space-y-2">
              {data?.recent?.map((e) => (
                <li key={e.id} className="rounded border p-3">
                  {e.student_name}
                  <div className="text-xs text-muted-foreground">
                    {e.event_name ?? "—"} · {e.occurred_at}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SafePage>
  ); 
}

