import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

import { RequireAuth } from './auth/RequireAuth';
import { RequireRole } from './auth/RequireRole';

import { UnauthorizedPage } from './pages/UnauthorizedPage';
import WorkerHomePage from './pages/WorkerHomePage';
import ManagerHomePage from './pages/ManagerHomePage';
import WorkerReportsPage from './pages/WorkerReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';

import ProtectedLayout from './components/layout/ProtectedLayout';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected layout */}
      <Route
        element={
          <RequireAuth>
            <ProtectedLayout />
          </RequireAuth>
        }>
        {/* Worker */}
        <Route
          path="/worker"
          element={
            <RequireRole role="worker">
              <WorkerHomePage />
            </RequireRole>
          }
        />

        <Route
          path="/worker/reports"
          element={
            <RequireRole role="worker">
              <WorkerReportsPage />
            </RequireRole>
          }
        />

        {/* Manager */}
        <Route
          path="/manager"
          element={
            <RequireRole role="manager">
              <ManagerHomePage />
            </RequireRole>
          }
        />

        {/* Shared */}
        <Route path="/reports/:reportId" element={<ReportDetailPage />} />
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
