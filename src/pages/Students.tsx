import { Link } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useImportedStudents } from "@/hooks/useImports";

export default function Page() {
  const { data, loading, error } = useImportedStudents();

  return (
    <SafePage
      title="תלמידים"
      description="רשימת תלמידים אמיתית בלבד, מתוך NRPS מאומת בעתיד או מתוך דוח Participants אמיתי שיובא ממודל."
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">טוען רשימת תלמידים...</p>
      ) : error ? (
        <EmptyTruth>{error}</EmptyTruth>
      ) : !data?.length ? (
        <EmptyTruth>
          עדיין לא התקבלה רשימת תלמידים. יש לייבא דוח Participants אמיתי ממודל או להפעיל NRPS מאומת. לא מוצגים תלמידים לדוגמה.
        </EmptyTruth>
      ) : (
        <ul className="space-y-2">
          {data.map((student) => (
            <li key={student.id} className="rounded border p-3">
              <Link to={`/students/${student.id}`} className="font-bold text-primary hover:underline">
                {student.full_name}
              </Link>
              <div className="text-xs text-muted-foreground">
                {student.external_username ?? student.email ?? "מקור: דוח Participants שיובא"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SafePage>
  );
}
