import { Outlet } from 'react-router-dom';
import AppHeader from '../AppHeader';

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Page content */}
      <main className="pt-6">
        <Outlet />
      </main>
    </div>
  );
}
