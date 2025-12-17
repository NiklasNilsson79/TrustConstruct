import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

import { RequireAuth } from './auth/RequireAuth';
import { RequireRole } from './auth/RequireRole';

import { UnauthorizedPage } from './pages/UnauthorizedPage';
import WorkerHomePage from './pages/WorkerHomePage';
import ManagerHomePage from './pages/ManagerHomePage';
import WorkerReportsPage from './pages/WorkerReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected */}
      <Route
        path="/worker"
        element={
          <RequireAuth>
            <RequireRole role="worker">
              <WorkerHomePage />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/worker/reports"
        element={
          <RequireAuth>
            <RequireRole role="worker">
              <WorkerReportsPage />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route
        path="/manager"
        element={
          <RequireAuth>
            <RequireRole role="manager">
              <ManagerHomePage />
            </RequireRole>
          </RequireAuth>
        }
      />

      <Route path="/reports/:reportId" element={<ReportDetailPage />} />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
