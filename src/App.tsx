import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Grades from './pages/Grades';
import ActivityPage from './pages/ActivityPage';
import StudentProfile from './pages/StudentProfile';
import Import from './pages/Import';
import LtiBootstrap from './pages/LtiBootstrap';
import StudentsList from './pages/StudentsList';
import ReportsCenter from './pages/ReportsCenter';
import ExportCenter from './pages/ExportCenter';
import GapReport from './pages/reports/GapReport';
import StudentReport from './pages/reports/StudentReport';
import TaskReport from './pages/reports/TaskReport';
import DayReport from './pages/reports/DayReport';
import SystemStatus from './pages/SystemStatus';
import MoodleInstall from './pages/MoodleInstall';
import TeacherHelp from './pages/TeacherHelp';

import { TooltipProvider } from './components/ui/tooltip';

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <div className="min-h-screen bg-neutral-50" dir="rtl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/import" element={<Import />} />
            <Route path="/reports" element={<ReportsCenter />} />
            <Route path="/reports/gap" element={<GapReport />} />
            <Route path="/reports/students" element={<StudentReport />} />
            <Route path="/reports/tasks" element={<TaskReport />} />
            <Route path="/reports/days" element={<DayReport />} />
            <Route path="/export" element={<ExportCenter />} />
            <Route path="/status" element={<SystemStatus />} />
            <Route path="/install" element={<MoodleInstall />} />
            <Route path="/help" element={<TeacherHelp />} />
            <Route path="/lti/launch" element={<LtiBootstrap />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </div>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
