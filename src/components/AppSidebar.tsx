import {
  LayoutDashboard, Users, ListChecks, BookOpen, GraduationCap,
  Activity, FileBarChart2, Download, Settings, LogOut, Wrench, Upload, Zap,
  Shield, AlertCircle, Cpu, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useLtiSession, clearLtiToken } from "@/hooks/useLtiSession";
import { cn } from "@/lib/utils";

// MTH_TEACHER_SIDEBAR_FINAL_WORKFLOW_V1
const navItems = [
  { title: "מרכז המורה",  url: "/",         icon: LayoutDashboard },
  { title: "תלמידים",      url: "/students", icon: Users },
  { title: "ציונים",       url: "/grades",   icon: GraduationCap },
  { title: "פעילויות",    url: "/chapters", icon: Activity },
  { title: "זמנים",        url: "/times",    icon: Clock },
  { title: "דוחות",        url: "/reports",  icon: FileBarChart2 },
];

const toolItems = [
  { title: "פרקים",           url: "/chapters",     icon: BookOpen },
  { title: "משימות",          url: "/tasks",        icon: ListChecks },
  { title: "ייבוא חכם",       url: "/smart-import", icon: Upload },
  { title: "ייצוא",           url: "/export",       icon: Download },
  { title: "אוטומציה ממודל",  url: "/automation",   icon: Zap },
  { title: "אבחון",           url: "/missing-data", icon: AlertCircle },
  { title: "בידוד נתונים",    url: "/isolation",    icon: Shield },
  { title: "בדיקת יכולות",    url: "/capabilities", icon: Cpu },
];

const supportItems = [
  { title: "הגדרות",               url: "/settings", icon: Settings },
  { title: "התקנה / חיבור Moodle", url: "/setup",    icon: Wrench },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { site, session } = useLtiSession();

  const isActive = (url: string) =>
    url === "/" ? location.pathname === "/" : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">
                המודל החכם
              </div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">
                {session?.course_title ?? site?.site_name ?? "—"}
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>ניווט</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive: active }) =>
                        cn(
                          "flex items-center gap-3 rounded-md transition-colors",
                          active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>כלים</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive: active }) =>
                        cn(
                          "flex items-center gap-3 rounded-md transition-colors",
                          active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>תמיכה</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive: active }) =>
                        cn(
                          "flex items-center gap-3 rounded-md transition-colors",
                          active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && (
          <div className="rounded-md bg-sidebar-accent/50 px-3 py-2 text-[11px] leading-relaxed text-sidebar-foreground/70">
            {session ? "כניסה דרך Moodle בלבד. אין סיסמה נוספת." : "ממתין ל-LTI launch מתוך Moodle."}
          </div>
        )}
        {session && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/80"
            onClick={() => { clearLtiToken(); navigate("/setup", { replace: true }); }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>סיים סשן</span>}
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
