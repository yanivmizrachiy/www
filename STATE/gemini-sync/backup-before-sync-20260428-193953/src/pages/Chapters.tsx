import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useCourseStructure } from "@/hooks/useImports";
export default function Page() { const {data, loading, error} = useCourseStructure(); return <SafePage title="פרקים" description="פרקים מתוך מבנה הקורס או דוחות completion.">{loading ? <p className="text-sm text-muted-foreground">טוען...</p> : error ? <EmptyTruth>{error}</EmptyTruth> : <ul className="space-y-2">{data?.chapters?.map((c)=><li key={c.id} className='rounded border p-3'>{c.chapter_name}</li>)}</ul>}</SafePage>; }
