import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { login } from '../auth/authService';
import { setToken, setUser } from '../auth/authStore';
import type { AuthUser } from '../auth/authTypes';

import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { from?: { pathname?: string } };
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);

      setToken(res.token);
      setUser(res.user as AuthUser);

      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else {
        navigate(res.user.role === 'manager' ? '/manager' : '/worker', {
          replace: true,
        });
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top brand row */}
      <div className="container py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <div
              className="h-4 w-4 rounded-sm bg-primary/70"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-semibold">TrustConstruct</span>
        </div>
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
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
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

              <p className="text-center text-xs text-muted-foreground">
                Blockchain-verified construction quality control
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
