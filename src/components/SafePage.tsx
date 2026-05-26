import { Card, CardContent } from "@/components/ui/card";

export function EmptyTruth({children="אין עדיין נתונים להצגה. פתח את הכלי מתוך Moodle או ייבא דוח."}:{children?:string}) {
  return <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{children}</div>;
}
export function SafePage({title, description, children}:{title:string; description:string; children?:React.ReactNode}) {
  return <section className="space-y-5" dir="rtl"><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Card><CardContent className="pt-6">{children ?? <EmptyTruth />}</CardContent></Card></section>;
}
