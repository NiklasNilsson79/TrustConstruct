import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../auth/authService';
import { setToken, setUser } from '../auth/authStore';
import type { AuthUser } from '../auth/authTypes';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>TrustConstruct</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>Sign in to continue</p>

      <form
        onSubmit={onSubmit}
        style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label>
          Email
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 6 }}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 6 }}
            required
          />
        </label>

        <button
          type="submit"
          style={{ padding: 10, marginTop: 8 }}
          disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {error && <p role="alert">{error}</p>}
      </form>
    </div>
  );
}
