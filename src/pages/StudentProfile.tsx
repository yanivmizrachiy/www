import { useParams } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useStudentProfile } from "@/hooks/useImports";
export default function StudentProfile() { const { id } = useParams(); const { data, loading, error } = useStudentProfile(id); return <SafePage title="פרופיל תלמיד" description="פרופיל תלמיד מנתוני Moodle מיובאים בלבד.">{loading ? "טוען..." : error ? <EmptyTruth>{error}</EmptyTruth> : data ? <div className="space-y-2"><h2 className="text-xl font-bold">{data.student.full_name}</h2><p className="text-sm text-muted-foreground">ציונים: {data.grades.length} · פעילות: {data.activity.event_count}</p></div> : <EmptyTruth />}</SafePage>; }
