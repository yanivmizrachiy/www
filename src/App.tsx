import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useKeepAlive } from "@/hooks/useKeepAlive";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import MissingData from "./pages/MissingData";
import CapabilityProbe from "./pages/CapabilityProbe";
import IsolationStatus from "./pages/IsolationStatus";
import IsolationLiveCheck from "./pages/IsolationLiveCheck";
import InstallCheck from "./pages/InstallCheck";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import StudentProfile from "./pages/StudentProfile";
import Tasks from "./pages/Tasks";
import Chapters from "./pages/Chapters";
import ChapterDetail from "./pages/ChapterDetail";
import Grades from "./pages/Grades";
import ActivityPage from "./pages/ActivityPage";
import Reports from "./pages/Reports";
import StudentReport from "./pages/reports/StudentReport";
import TaskReport from "./pages/reports/TaskReport";
import DayReport from "./pages/reports/DayReport";
import GapReport from "./pages/reports/GapReport";
import Export from "./pages/Export";
import SettingsPage from "./pages/SettingsPage";
import SmartImport from "./pages/SmartImport";

import TimeRangeReport from "./pages/TimeRangeReport";
import Automation from "./pages/Automation";
import Setup from "./pages/Setup";
import LtiBootstrap from "./pages/LtiBootstrap";
import NotFound from "./pages/NotFound";
import Guide from "./pages/Guide";
import AdminHub from "./pages/AdminHub";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => {
  useKeepAlive();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* /install kept as a public alias for printed Moodle docs; redirects to in-app /setup */}
          <Route path="/install" element={<Navigate to="/setup" replace />} />
          <Route path="/lti" element={<LtiBootstrap />} />
          {/* Guide is a standalone teacher presentation — no Teacher Hub chrome,
              no teacher data, fully separate product sharing only this repo. */}
          <Route path="/guide" element={<Guide />} />
          {/* Admin Hub is Yaniv's private control center — gated by Supabase
              Auth + admin role. Never linked from Teacher Hub navigation. */}
          <Route
            path="/admin-hub"
            element={
              <ProtectedAdminRoute>
                <AdminHub />
              </ProtectedAdminRoute>
            }
          />
          {/* Rescue route: if a Moodle iframe/browser lands on the backend launch URL as a page, keep the teacher inside the app instead of showing NotFound. */}
          <Route path="/api/lti/launch" element={<Navigate to="/" replace />} />
          {/* No teacher login exists — any old /auth /login /signup link goes to setup. */}
          <Route path="/auth" element={<Navigate to="/setup" replace />} />
          <Route path="/login" element={<Navigate to="/setup" replace />} />
          <Route path="/signup" element={<Navigate to="/setup" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Navigate to="/" replace />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/chapters" element={<Chapters />} />
            <Route path="/chapters/:sectionId" element={<ChapterDetail />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/times" element={<TimeRangeReport />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/students" element={<StudentReport />} />
            <Route path="/reports/tasks" element={<TaskReport />} />
            <Route path="/reports/days" element={<DayReport />} />
            <Route path="/reports/gaps" element={<GapReport />} />
            <Route path="/export" element={<Export />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* All imports go through one auto-detecting page. Keep /import as a
                redirect alias for any old bookmarks/printed docs. */}
            <Route path="/import" element={<Navigate to="/smart-import" replace />} />
            <Route path="/smart-import" element={<SmartImport />} />
            <Route path="/missing-data" element={<MissingData />} />
            <Route path="/capabilities" element={<CapabilityProbe />} />
            <Route path="/isolation" element={<IsolationStatus />} />
            <Route path="/isolation-check" element={<IsolationLiveCheck />} />
            <Route path="/install-check" element={<InstallCheck />} />
            <Route path="/setup" element={<Setup />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};
export default App;


