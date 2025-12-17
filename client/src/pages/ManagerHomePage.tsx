import { getUser } from '../auth/authStore';
import type { AuthUser } from '../auth/authTypes';
import { LogoutButton } from '../auth/LogoutButton';

export default function ManagerHomePage() {
  const me = getUser<AuthUser>();

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Manager</h1>
            <p className="mt-2 text-sm opacity-80">
              Administration och översikt.
            </p>
          </div>

          <LogoutButton />
        </header>

        <section className="grid gap-4">
          <div className="rounded-xl border p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm opacity-80">Inloggad som</p>
                <p className="mt-1 text-lg font-medium">{me?.email ?? '-'}</p>
              </div>

              <span className="rounded-full border px-3 py-1 text-xs">
                {me?.role?.toUpperCase() ?? '—'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-medium">Managerverktyg</h2>
            <p className="mt-2 text-sm opacity-80">
              Här kommer administration, användarhantering och rapporter.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
