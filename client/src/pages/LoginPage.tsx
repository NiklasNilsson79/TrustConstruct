// client/src/pages/LoginPage.tsx
import AppLogo from '../components/brand/AppLogo';

import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { setToken, setUser } from '../auth/authStore';
import type { AuthUser } from '../auth/authTypes';

import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

type PresetUser = {
  name: string;
  company: string;
};

const PRESET_USERS: PresetUser[] = [
  { name: 'Niklas Nilsson', company: 'Nelzon Production AB' },
  { name: 'Carl Andersson', company: 'CA Electric AB' },
  { name: 'Tobias Pettersson', company: 'Manager Solutions AB' },
];

const COMPANIES = [
  'Nelzon Production AB',
  'CA Electric AB',
  'Manager Solutions AB',
] as const;

function selectClassName(disabled?: boolean) {
  // Matchar generellt Tailwind-stil som brukar användas av Input-komponenten
  return [
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
    'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    disabled ? 'opacity-80' : '',
  ].join(' ');
}

export default function LoginPage() {
  const [name, setName] = React.useState(PRESET_USERS[0]?.name ?? '');
  const [company, setCompany] = React.useState(PRESET_USERS[0]?.company ?? '');
  const [password, setPassword] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { from?: { pathname?: string } };
  };

  React.useEffect(() => {
    // Autofyll company baserat på valt namn (men låt användaren ändra om de vill)
    const match = PRESET_USERS.find((u) => u.name === name);
    if (match) setCompany(match.company);
  }, [name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          password,
        }),
      });

      if (!res.ok) {
        let msg = 'Login failed. Please try again.';
        try {
          const data = await res.json();
          if (data?.message && typeof data.message === 'string')
            msg = data.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data = await res.json();

      setToken(data.token);
      setUser(data.user as AuthUser);

      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else {
        navigate(data.user.role === 'manager' ? '/manager' : '/worker', {
          replace: true,
        });
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top brand row */}
      <div className="flex justify-start px-6 pt-10">
        <AppLogo />
      </div>

      {/* Centered auth card */}
      <div className="container flex min-h-[calc(100vh-96px)] items-center justify-center py-10">
        <div className="w-full max-w-md">
          {/* Header above card */}
          <div className="mb-6 text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your construction quality control dashboard
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>

                  <select
                    id="name"
                    className={selectClassName()}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required>
                    {PRESET_USERS.map((u) => (
                      <option key={u.name} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">
                    Company
                  </label>

                  <select
                    id="company"
                    className={selectClassName()}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required>
                    {COMPANIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs text-muted-foreground">
                    You must select the company that belongs to the selected
                    user.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                  Sign In
                </Button>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
