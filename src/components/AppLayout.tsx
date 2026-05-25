import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLtiSession } from "@/hooks/useLtiSession";
import { StatusBadge } from "@/components/StatusBadge";
import { hebrewRoleLabel } from "@/lib/roleLabel";

export default function AppLayout() {
  const { site, session, loading } = useLtiSession();
  // Status reflects LTI launch context only. Manual import availability
  // is communicated per-screen, not in the global header.
  const overall = session ? "proven" : "missing";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" dir="rtl">
        טוען הקשר מהמרחב שלך...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-surface" dir="rtl">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="ml-1" />
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-semibold">
                  {session?.course_title ?? site?.site_name ?? site?.site_url ?? "ממתין ל-LTI launch"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {session?.moodle_username ?? "—"} · {hebrewRoleLabel(session?.role)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">סטטוס חיבור</span>
              <StatusBadge status={overall} />
            </div>
          </header>

          <main className="flex-1 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
