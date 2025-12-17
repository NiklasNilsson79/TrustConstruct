import { getUser } from '../auth/authStore';
import type { AuthUser } from '../auth/authTypes';
import { LogoutButton } from '../auth/LogoutButton';

export default function WorkerHomePage() {
  const me = getUser<AuthUser>();

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Worker</h1>
            <p className="mt-2 text-sm opacity-80">
              Översikt och arbetsflöde för dina uppgifter.
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
            <h2 className="text-lg font-medium">Dina uppgifter</h2>
            <p className="mt-2 text-sm opacity-80">
              Nästa steg blir att hämta och visa worker-relaterad data från API.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
