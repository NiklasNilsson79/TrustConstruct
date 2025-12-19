import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from './authStore';
import type { AuthUser } from './authTypes';

function toDisplayName(user: AuthUser | null) {
  if (!user?.email) return 'Unknown user';
  const local = user.email.split('@')[0] || user.email;
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function UserMenu() {
  const navigate = useNavigate();
  const user = getUser<AuthUser>();

  const displayName = useMemo(() => toDisplayName(user ?? null), [user]);
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  function onLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex items-center gap-4">
      {/* Briefcase icon  */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-600"
          aria-hidden="true">
          <path d="M10 6h4" />
          <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
          <path d="M4 7h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
          <path d="M2 12v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7" />
        </svg>
      </div>

      {/* Name + role  “John Worker” + “Worker” */}
      <div className="leading-tight">
        <div className="text-sm font-medium text-slate-900">{displayName}</div>
        <div className="text-xs text-slate-500">{roleLabel}</div>
      </div>

      {/* Role pill */}
      {roleLabel && (
        <span className="rounded-full bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 text-xs">
          {roleLabel}
        </span>
      )}

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="ml-1 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
}
