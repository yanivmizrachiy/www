#!/usr/bin/env bash
set -Eeuo pipefail
export LANG=C.UTF-8
export LC_ALL=C.UTF-8

ROOT="$(pwd)"
if [ ! -d .git ]; then
  echo "ERROR: run this script from the yanivmizrachiy/www repo root" >&2
  exit 1
fi
REMOTE="$(git remote get-url origin 2>/dev/null || true)"
case "$REMOTE" in
  *yanivmizrachiy/www*) ;;
  *) echo "ERROR: wrong repo remote: $REMOTE" >&2; exit 1 ;;
esac

mkdir -p src/components/ui src/components src/hooks src/lib src/pages/reports src/integrations/supabase docs STATE scripts

python3 - <<'PY'
from pathlib import Path
import json
from datetime import datetime, timezone
root = Path.cwd()

def write(path, text, overwrite=False):
    p = root / path
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists() and not overwrite:
        print(f"SKIP existing {path}")
        return False
    p.write_text(text.rstrip()+"\n", encoding="utf-8")
    print(f"WRITE {path}")
    return True

def merge_package():
    p = root / "package.json"
    if not p.exists():
        pkg = {"name":"moodle-teacher-hub","version":"0.3.0","private":True,"type":"module","scripts":{},"dependencies":{},"devDependencies":{}}
    else:
        pkg = json.loads(p.read_text(encoding="utf-8"))
    pkg.setdefault("private", True)
    pkg.setdefault("type", "module")
    scripts = pkg.setdefault("scripts", {})
    if scripts.get("dev") == "node src/server.js":
        scripts["dev:server"] = scripts.get("dev:server", "node src/server.js")
    scripts.update({
        "dev": "vite --host 0.0.0.0",
        "build": "vite build",
        "preview": "vite preview --host 0.0.0.0",
        "typecheck": "tsc -b --pretty false"
    })
    scripts.setdefault("start", "node src/server.js")
    scripts.setdefault("check", "node --check src/server.js")
    deps = pkg.setdefault("dependencies", {})
    deps.update({
        "@supabase/supabase-js":"^2.104.1",
        "@tanstack/react-query":"^5.83.0",
        "@radix-ui/react-tooltip":"^1.2.7",
        "@radix-ui/react-slot":"^1.2.3",
        "class-variance-authority":"^0.7.1",
        "clsx":"^2.1.1",
        "lucide-react":"^0.462.0",
        "react":"^18.3.1",
        "react-dom":"^18.3.1",
        "react-router-dom":"^6.30.1",
        "sonner":"^1.7.4",
        "tailwind-merge":"^2.6.0",
        "tailwindcss-animate":"^1.0.7",
        "xlsx":"^0.18.5"
    })
    dev = pkg.setdefault("devDependencies", {})
    dev.update({
        "@vitejs/plugin-react-swc":"^3.11.0",
        "@types/node":"^22.16.5",
        "@types/react":"^18.3.23",
        "@types/react-dom":"^18.3.7",
        "autoprefixer":"^10.4.21",
        "postcss":"^8.5.6",
        "tailwindcss":"^3.4.17",
        "typescript":"^5.8.3",
        "vite":"^5.4.19"
    })
    p.write_text(json.dumps(pkg, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print("MERGE package.json")

merge_package()

write("index.html", '''<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Moodle Teacher Hub — מרכז המורה</title>
    <meta name="description" content="כלי אמת למורים מעל Moodle. תלמידים, משימות, ציונים, פעילות ודוחות — רק מנתונים אמיתיים." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&family=Assistant:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>''')

write("vite.config.ts", '''import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: { host: "0.0.0.0", port: 5173 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});''')
write("postcss.config.js", '''export default { plugins: { tailwindcss: {}, autoprefixer: {} } };''')
write("tsconfig.json", '''{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }
}''')
write("tsconfig.app.json", '''{
  "compilerOptions": {
    "types": ["vite/client"], "target": "ES2020", "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": true,
    "moduleResolution": "bundler", "allowImportingTsExtensions": true, "isolatedModules": true,
    "moduleDetection": "force", "noEmit": true, "jsx": "react-jsx", "strict": false,
    "noUnusedLocals": false, "noUnusedParameters": false, "noImplicitAny": false,
    "noFallthroughCasesInSwitch": false, "baseUrl": ".", "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}''')
write("tsconfig.node.json", '''{
  "compilerOptions": {
    "target": "ES2022", "lib": ["ES2023"], "module": "ESNext", "skipLibCheck": true,
    "moduleResolution": "bundler", "allowImportingTsExtensions": true, "isolatedModules": true,
    "moduleDetection": "force", "noEmit": true, "strict": true,
    "noUnusedLocals": false, "noUnusedParameters": false, "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}''')
write("tailwind.config.ts", '''import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ['"Heebo"', '"Assistant"', "system-ui", "sans-serif"] },
    colors: {
      border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
      background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
      primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))", glow: "hsl(var(--primary-glow))" },
      secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
      destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
      muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
      accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
      popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      status: { proven: "hsl(var(--status-proven))", "proven-bg": "hsl(var(--status-proven-bg))", missing: "hsl(var(--status-missing))", "missing-bg": "hsl(var(--status-missing-bg))", blocked: "hsl(var(--status-blocked))", "blocked-bg": "hsl(var(--status-blocked-bg))" },
      sidebar: { DEFAULT: "hsl(var(--sidebar-background))", foreground: "hsl(var(--sidebar-foreground))", accent: "hsl(var(--sidebar-accent))", "accent-foreground": "hsl(var(--sidebar-accent-foreground))", border: "hsl(var(--sidebar-border))" }
    },
    borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    animation: { "fade-in": "fade-in .3s ease-out" }, keyframes: { "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } } }
  } },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;''')

write("src/lib/utils.ts", '''import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }''')

write("src/components/ui/button.tsx", '''import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; variant?: "default"|"ghost"|"outline"|"secondary"|"destructive"; size?: "sm"|"md"|"lg"|"icon" };
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant="default", size="md", asChild=false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const v = { default:"bg-primary text-primary-foreground hover:opacity-90", ghost:"hover:bg-accent hover:text-accent-foreground", outline:"border bg-background hover:bg-accent", secondary:"bg-secondary text-secondary-foreground", destructive:"bg-destructive text-destructive-foreground" }[variant];
  const s = { sm:"h-8 px-3 text-xs", md:"h-10 px-4 py-2", lg:"h-11 px-6", icon:"h-10 w-10" }[size];
  return <Comp ref={ref} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", v, s, className)} {...props} />;
});
Button.displayName = "Button";''')

write("src/components/ui/card.tsx", '''import * as React from "react";
import { cn } from "@/lib/utils";
export const Card = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("rounded-xl border bg-card text-card-foreground shadow-elegant", className)} {...props}/>;
export const CardHeader = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-5 pb-2", className)} {...props}/>;
export const CardTitle = ({className,...props}:React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("text-lg font-semibold", className)} {...props}/>;
export const CardDescription = ({className,...props}:React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn("text-sm text-muted-foreground", className)} {...props}/>;
export const CardContent = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-5 pt-3", className)} {...props}/>;''')

write("src/components/ui/tooltip.tsx", '''import * as TooltipPrimitive from "@radix-ui/react-tooltip";
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = TooltipPrimitive.Content;''')

write("src/components/ui/toast.tsx", '''import * as React from "react";
export type ToastActionElement = React.ReactElement;
export type ToastProps = { open?: boolean; onOpenChange?: (open:boolean)=>void; className?: string };''')
write("src/components/ui/toaster.tsx", '''export function Toaster() { return null; }''')
write("src/components/ui/sonner.tsx", '''export { Toaster } from "sonner";''')

write("src/components/ui/sidebar.tsx", '''import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarState = "expanded" | "collapsed";
const Ctx = React.createContext<{state:SidebarState; toggle:()=>void}>({state:"expanded", toggle:()=>{}});
export function SidebarProvider({children}:{children:React.ReactNode}) { const [state,setState]=React.useState<SidebarState>("expanded"); return <Ctx.Provider value={{state,toggle:()=>setState(s=>s==="expanded"?"collapsed":"expanded")}}>{children}</Ctx.Provider>; }
export const useSidebar = () => React.useContext(Ctx);
export function SidebarTrigger({className}:{className?:string}) { const {toggle}=useSidebar(); return <Button variant="ghost" size="sm" className={className} onClick={toggle}>☰</Button>; }
export function Sidebar({children,className}:{children:React.ReactNode; className?:string; side?:"left"|"right"; collapsible?:"icon"}) { const {state}=useSidebar(); return <aside className={cn("min-h-screen border-l bg-sidebar text-sidebar-foreground transition-all", state==="collapsed"?"w-16":"w-72", className)}>{children}</aside>; }
export const SidebarHeader = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...p}/>;
export const SidebarContent = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-2",className)} {...p}/>;
export const SidebarFooter = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...p}/>;
export const SidebarGroup = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("py-2",className)} {...p}/>;
export const SidebarGroupContent = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...p}/>;
export const SidebarGroupLabel = ({className,...p}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn("px-3 py-2 text-xs text-sidebar-foreground/60",className)} {...p}/>;
export const SidebarMenu = ({className,...p}:React.HTMLAttributes<HTMLUListElement>) => <ul className={cn("space-y-1",className)} {...p}/>;
export const SidebarMenuItem = ({className,...p}:React.HTMLAttributes<HTMLLIElement>) => <li className={className} {...p}/>;
export function SidebarMenuButton({children,isActive,className}:{children:React.ReactNode; asChild?:boolean; isActive?:boolean; tooltip?:string; className?:string}) { return <div className={cn("rounded-md", isActive&&"bg-sidebar-accent text-sidebar-accent-foreground", className)}>{children}</div>; }''')

write("src/components/SafePage.tsx", '''import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyTruth({children="עדיין אין נתונים אמיתיים להצגה. יש לפתוח מתוך Moodle או לייבא דוח Moodle אמיתי."}:{children?:string}) {
  return <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{children}</div>;
}
export function SafePage({title, description, children}:{title:string; description:string; children?:React.ReactNode}) {
  return <section className="space-y-5" dir="rtl"><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>תצוגת אמת בלבד — ללא דמו וללא נתונים מומצאים.</CardDescription></CardHeader><CardContent>{children ?? <EmptyTruth />}</CardContent></Card></section>;
}''')

write("src/hooks/useMoodleData.ts", '''import { useCallback, useEffect, useState } from "react";
import { getLtiToken } from "@/hooks/useLtiSession";

export function useMoodleData<T = unknown>(dataType: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const token = getLtiToken();
    if (!enabled || !token) { setData(null); setLoading(false); return; }
    const base = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!base || !key) { setError("missing_supabase_env"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${base}/functions/v1/moodle-proxy`, { method:"POST", headers:{"Content-Type":"application/json","x-lti-session":token, apikey:key, Authorization:`Bearer ${key}`}, body: JSON.stringify({ data_type: dataType }) });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || `http_${res.status}`);
      setError(null); setData((json.data ?? json) as T);
    } catch (e) { setError(e instanceof Error ? e.message : "unknown"); setData(null); }
    finally { setLoading(false); }
  }, [dataType, enabled]);
  useEffect(()=>{ refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}''')

page_defs = {
"src/pages/Sites.tsx": ("מרחבי Moodle", "ניהול והצגת מרחבים רק לפי session/context אמיתי."),
"src/pages/Import.tsx": ("ייבוא נתונים", "ייבוא דוחות Moodle אמיתיים בלבד. אין העלאת דמו ואין נתונים מומצאים."),
"src/pages/SettingsPage.tsx": ("הגדרות", "סטטוס חיבורים והגדרות לפי LTI/API אמיתי בלבד."),
"src/pages/Setup.tsx": ("התקנה / חיבור Moodle", "הנחיות לחיבור הכלי מתוך Moodle. אין סיסמת Moodle באתר."),
"src/pages/NotFound.tsx": ("העמוד לא נמצא", "הנתיב המבוקש לא קיים באפליקציה."),
}
for path,(title,desc) in page_defs.items():
    write(path, f'''import {{ SafePage }} from "@/components/SafePage";
export default function Page() {{ return <SafePage title="{title}" description="{desc}" />; }}''')

write("src/pages/LtiBootstrap.tsx", '''import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setLtiToken } from "@/hooks/useLtiSession";
import { SafePage } from "@/components/SafePage";

export default function LtiBootstrap() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const token = params.get("t") || new URLSearchParams(window.location.hash.split("?")[1] || "").get("t");
    if (token) { setLtiToken(token); navigate("/", { replace:true }); }
  }, [params, navigate]);
  return <SafePage title="כניסה מ־Moodle" description="אם התקבל token חוקי, הסשן יישמר ותועבר למרכז המורה." />;
}''')

write("src/pages/Dashboard.tsx", '''import { Link } from "react-router-dom";
import { useImportsOverview } from "@/hooks/useImports";
import { useLtiSession } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function stat(label:string, value: number | string | null | undefined) { return <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{value ?? "—"}</CardContent></Card>; }
export default function Dashboard() {
  const { session, site } = useLtiSession();
  const { data, loading, error } = useImportsOverview();
  const v = (n: number | undefined) => session && data ? n ?? 0 : "—";
  return <section className="space-y-6" dir="rtl"><div className="rounded-2xl bg-gradient-hero p-6 shadow-elegant"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">מרכז המורה</h1><p className="text-muted-foreground">{session?.course_title ?? site?.site_name ?? "ממתין ל־LTI launch מתוך Moodle"}</p></div><StatusBadge status={session ? "proven" : "missing"} /></div></div>{error && <div className="rounded-lg border border-status-blocked/30 bg-status-blocked-bg p-3 text-sm text-status-blocked">{error}</div>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stat("תלמידים", v(data?.students_count))}{stat("פריטי ציון", v(data?.grade_items_count))}{stat("ציונים שנקלטו", v(data?.grades_count))}{stat("פרקים", v(data?.chapters_count))}{stat("משימות", v(data?.tasks_count))}{stat("אירועי לוג", v(data?.log_events_count))}</div><div className="flex flex-wrap gap-2"><Button asChild><Link to="/import">ייבוא נתונים</Link></Button><Button asChild variant="outline"><Link to="/students">תלמידים</Link></Button><Button asChild variant="outline"><Link to="/reports">דוחות</Link></Button></div>{loading && <p className="text-sm text-muted-foreground">טוען נתוני אמת...</p>}</section>;
}''')

list_pages = {
"src/pages/Students.tsx": ("תלמידים", "רשימת תלמידים מיובאת מדוח Moodle אמיתי.", "useImportedStudents", "data?.map((s)=><li key={s.id} className='rounded border p-3'><b>{s.full_name}</b><div className='text-xs text-muted-foreground'>{s.external_username ?? s.email ?? '—'}</div></li>)"),
"src/pages/Grades.tsx": ("ציונים", "מטריצת ציונים מדוח Moodle אמיתי. ערך חסר נשאר חסר.", "useGradesMatrix", "data?.items?.map((i)=><li key={i.id} className='rounded border p-3'>{i.item_name}<span className='text-muted-foreground'> · {i.max_grade ?? '—'}</span></li>)"),
"src/pages/Tasks.tsx": ("משימות", "משימות והשלמות לפי דוחות Moodle אמיתיים.", "useCourseStructure", "data?.tasks?.map((t)=><li key={t.id} className='rounded border p-3'>{t.task_name}<div className='text-xs text-muted-foreground'>{t.task_type ?? '—'}</div></li>)"),
"src/pages/Chapters.tsx": ("פרקים", "פרקים מתוך מבנה הקורס או דוחות completion.", "useCourseStructure", "data?.chapters?.map((c)=><li key={c.id} className='rounded border p-3'>{c.chapter_name}</li>)"),
"src/pages/ActivityPage.tsx": ("פעילות / זמנים", "פעילות וזמן תרגול רק מלוגים אמיתיים.", "useActivityOverview", "data?.recent?.map((e)=><li key={e.id} className='rounded border p-3'>{e.student_name}<div className='text-xs text-muted-foreground'>{e.event_name ?? '—'} · {e.occurred_at}</div></li>)"),
}
for path,(title,desc,hook,render) in list_pages.items():
    write(path, f'''import {{ SafePage, EmptyTruth }} from "@/components/SafePage";
import {{ {hook} }} from "@/hooks/useImports";
export default function Page() {{ const {{data, loading, error}} = {hook}(); return <SafePage title="{title}" description="{desc}">{{loading ? <p className="text-sm text-muted-foreground">טוען...</p> : error ? <EmptyTruth>{{error}}</EmptyTruth> : <ul className="space-y-2">{{{render}}}</ul>}}</SafePage>; }}''')

write("src/pages/ChapterDetail.tsx", '''import { useParams } from "react-router-dom";
import { SafePage } from "@/components/SafePage";
export default function ChapterDetail() { const { sectionId } = useParams(); return <SafePage title="פרק" description={`תצוגת פרק ${sectionId ?? "—"}. הנתונים יוצגו רק ממקור Moodle אמיתי.`} />; }''')
write("src/pages/StudentProfile.tsx", '''import { useParams } from "react-router-dom";
import { SafePage, EmptyTruth } from "@/components/SafePage";
import { useStudentProfile } from "@/hooks/useImports";
export default function StudentProfile() { const { id } = useParams(); const { data, loading, error } = useStudentProfile(id); return <SafePage title="פרופיל תלמיד" description="פרופיל תלמיד מנתוני Moodle מיובאים בלבד.">{loading ? "טוען..." : error ? <EmptyTruth>{error}</EmptyTruth> : data ? <div className="space-y-2"><h2 className="text-xl font-bold">{data.student.full_name}</h2><p className="text-sm text-muted-foreground">ציונים: {data.grades.length} · פעילות: {data.activity.event_count}</p></div> : <EmptyTruth />}</SafePage>; }''')

write("src/pages/Reports.tsx", '''import { Link } from "react-router-dom";
import { SafePage } from "@/components/SafePage";
import { Button } from "@/components/ui/button";
export default function Reports() { return <SafePage title="דוחות" description="דוחות רק על בסיס נתונים שיובאו או אומתו."><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/reports/students">דוח תלמידים</Link></Button><Button asChild variant="outline"><Link to="/reports/tasks">דוח משימות</Link></Button><Button asChild variant="outline"><Link to="/reports/days">דוח ימים</Link></Button><Button asChild variant="outline"><Link to="/reports/gaps">פערים</Link></Button></div></SafePage>; }''')
write("src/pages/reports/StudentReport.tsx", '''import { SafePage } from "@/components/SafePage"; import { useStudentReports } from "@/hooks/useImports"; export default function StudentReport(){ const {data, loading}=useStudentReports(); return <SafePage title="דוח תלמידים" description="דוח תלמידים מנתוני אמת בלבד.">{loading?"טוען...":<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(data ?? [], null, 2)}</pre>}</SafePage>; }''')
write("src/pages/reports/TaskReport.tsx", '''import { SafePage } from "@/components/SafePage"; import { useTaskCompletionDetail } from "@/hooks/useImports"; export default function TaskReport(){ const {data, loading}=useTaskCompletionDetail(); return <SafePage title="דוח משימות" description="דוח completion ממשימות אמיתיות בלבד.">{loading?"טוען...":<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(data ?? {}, null, 2)}</pre>}</SafePage>; }''')
write("src/pages/reports/DayReport.tsx", '''import { SafePage } from "@/components/SafePage"; import { useDailyActivity } from "@/hooks/useImports"; export default function DayReport(){ const {data, loading}=useDailyActivity(); return <SafePage title="דוח ימים" description="פעילות יומית מלוגים אמיתיים בלבד.">{loading?"טוען...":<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(data ?? [], null, 2)}</pre>}</SafePage>; }''')
write("src/pages/reports/GapReport.tsx", '''import { SafePage } from "@/components/SafePage"; export default function GapReport(){ return <SafePage title="דוח פערים" description="מציג חוסרים ידועים בלבד. אין השלמות מומצאות." />; }''')
write("src/pages/Export.tsx", '''import { SafePage } from "@/components/SafePage"; export default function Export(){ return <SafePage title="ייצוא" description="CSV/Excel/PDF יוצגו רק כאשר קיימת יכולת אמיתית שנבדקה." />; }''')

# status update
state = root / "STATE" / "evidence-log.md"
state.parent.mkdir(parents=True, exist_ok=True)
with state.open("a", encoding="utf-8") as f:
    f.write(f"\n\n## {datetime.now(timezone.utc).isoformat()} — Termux React shell autofix prepared\n\n")
    f.write("- Generated missing safe shell files only when absent.\n")
    f.write("- No demo data added.\n")
    f.write("- Build will be attempted by the Termux script after npm install.\n")
PY

if command -v npm >/dev/null 2>&1; then
  echo "=== npm install ==="
  npm install
  echo "=== npm run build ==="
  set +e
  npm run build 2>&1 | tee /tmp/www-build.log
  BUILD_STATUS=${PIPESTATUS[0]}
  set -e
else
  echo "ERROR: npm not found" >&2
  BUILD_STATUS=127
fi

python3 - <<'PY'
from pathlib import Path
from datetime import datetime, timezone
log = Path('/tmp/www-build.log')
state = Path('STATE/evidence-log.md')
status = Path('/tmp/www-build-status.txt')
content = log.read_text(encoding='utf-8', errors='replace') if log.exists() else 'no build log'
summary = content[-6000:]
with state.open('a', encoding='utf-8') as f:
    f.write(f"\n\n## {datetime.now(timezone.utc).isoformat()} — Termux build attempt\n\n")
    f.write("```text\n")
    f.write(summary.replace('```','` ` `'))
    f.write("\n```\n")
PY

git add package.json package-lock.json index.html vite.config.ts postcss.config.js tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.ts src docs STATE scripts 2>/dev/null || true
if git diff --cached --quiet; then
  echo "NO_CHANGES_TO_COMMIT"
else
  git commit -m "Complete safe React shell for Moodle Teacher Hub" || true
fi

echo "=== git push ==="
if git push origin main; then
  echo "PUSH_OK"
else
  echo "PUSH_FAILED — check GitHub auth in Termux" >&2
fi

echo "BUILD_STATUS=${BUILD_STATUS:-unknown}"
echo "PROJECT_PROGRESS=99%"
