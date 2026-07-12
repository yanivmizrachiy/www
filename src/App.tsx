import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useKeepAlive } from "@/hooks/useKeepAlive";
import AppLayout from "@/components/AppLayout";

// Route-level code splitting: every page is its own chunk, fetched on demand.
// The initial paint no longer ships the big /guide presentation, admin center,
// or all the report screens — they load only when the teacher opens them.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MissingData = lazy(() => import("./pages/MissingData"));
const CapabilityProbe = lazy(() => import("./pages/CapabilityProbe"));
const IsolationStatus = lazy(() => import("./pages/IsolationStatus"));
const IsolationLiveCheck = lazy(() => import("./pages/IsolationLiveCheck"));
const InstallCheck = lazy(() => import("./pages/InstallCheck"));
const Students = lazy(() => import("./pages/Students"));
const Teachers = lazy(() => import("./pages/Teachers"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Chapters = lazy(() => import("./pages/Chapters"));
const ChapterDetail = lazy(() => import("./pages/ChapterDetail"));
const Grades = lazy(() => import("./pages/Grades"));
const ActivityPage = lazy(() => import("./pages/ActivityPage"));
const Reports = lazy(() => import("./pages/Reports"));
const StudentReport = lazy(() => import("./pages/reports/StudentReport"));
const TaskReport = lazy(() => import("./pages/reports/TaskReport"));
const DayReport = lazy(() => import("./pages/reports/DayReport"));
const GapReport = lazy(() => import("./pages/reports/GapReport"));
const Export = lazy(() => import("./pages/Export"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SmartImport = lazy(() => import("./pages/SmartImport"));
const TimeRangeReport = lazy(() => import("./pages/TimeRangeReport"));
const Automation = lazy(() => import("./pages/Automation"));
const Setup = lazy(() => import("./pages/Setup"));
const LtiBootstrap = lazy(() => import("./pages/LtiBootstrap"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Guide = lazy(() => import("./pages/Guide"));
const AdminHub = lazy(() => import("./pages/AdminHub"));

const queryClient = new QueryClient();

// Lightweight spinner shown while a route chunk loads.
function RouteFallback() {
  return (
    <div dir="rtl" className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
    </div>
  );
}

const App = () => {
  useKeepAlive();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* /install kept as a public alias for printed Moodle docs; redirects to in-app /setup */}
            <Route path="/install" element={<Navigate to="/setup" replace />} />
            <Route path="/lti" element={<LtiBootstrap />} />
            {/* Guide is a standalone teacher presentation — no tool chrome,
                no teacher data, fully separate product sharing only this repo. */}
            <Route path="/guide" element={<Guide />} />
            {/* Admin Hub is Yaniv's control center. Open access by explicit owner
                decision (2026-07-10): it shows only public links and non-PII
                aggregate diagnostics — no student data, no secrets. Anything
                touching teacher/student data stays behind the LTI session. */}
            <Route path="/admin-hub" element={<AdminHub />} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};
export default App;
