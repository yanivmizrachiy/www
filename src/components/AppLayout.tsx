import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLtiSession, SESSION_EXPIRED_OR_SERVER_RESTARTED } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { hebrewRoleLabel } from "@/lib/roleLabel";
import { BookOpen, UserCircle, AlertTriangle } from "lucide-react";

export default function AppLayout() {
  const { site, session, loading, error } = useLtiSession();
  const overall = session ? "proven" : "missing";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" dir="rtl">
        טוען הקשר מהמרחב שלך...
      </div>
    );
  }

  if (error === SESSION_EXPIRED_OR_SERVER_RESTARTED || (error === "NETWORK_ERROR" && !session)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
        <div className="max-w-md w-full mx-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-amber-900 mb-2">הסשן פג או שהשרת הופעל מחדש</h2>
          <p className="text-sm text-amber-800 mb-4">
            הסשן של Moodle פג או שהשרת הופעל מחדש.<br />כדי להמשיך, פתח מחדש את הכלי מתוך Moodle.
          </p>
          <p className="text-xs text-amber-700 bg-amber-100 rounded-lg p-3">חזור למרחב Moodle ולחץ שוב על המודל החכם.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-surface" dir="rtl">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-14 min-w-0 items-center justify-between gap-3 overflow-hidden border-b bg-background/95 backdrop-blur-sm px-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
              <SidebarTrigger className="ml-1" />
              <div className="flex flex-col leading-tight sm:flex-row sm:items-center sm:gap-4">
                <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  {session?.course_title ?? site?.site_name ?? site?.site_url ?? "ממתין ל-LTI launch"}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <UserCircle className="h-4 w-4 shrink-0 text-primary/70" />
                  {session?.moodle_username ?? "—"} · {hebrewRoleLabel(session?.role)}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={overall} label="סטטוס חיבור" />
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}