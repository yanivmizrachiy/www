import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyTruth({children="עדיין אין נתונים אמיתיים להצגה. יש לפתוח מתוך Moodle או לייבא דוח Moodle אמיתי."}:{children?:string}) {
  return <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{children}</div>;
}
export function SafePage({title, description, children}:{title:string; description:string; children?:React.ReactNode}) {
  return <section className="space-y-5" dir="rtl"><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>תצוגת אמת בלבד — ללא דמו וללא נתונים מומצאים.</CardDescription></CardHeader><CardContent>{children ?? <EmptyTruth />}</CardContent></Card></section>;
}
