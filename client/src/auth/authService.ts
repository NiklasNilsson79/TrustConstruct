import type { AuthUser, BackendUser, UserRole } from './authTypes';

type LoginResponse = {
  token: string;
  user: AuthUser;
};

function normalizeUser(u: BackendUser): AuthUser {
  const id = u.id ?? u._id;
  if (!id) throw new Error('Invalid user payload (missing id/_id).');

  return {
    id,
    name: u.name,
    company: u.company,
    role: u.role,
    email: u.email ?? '',
  };
}

// RIKTIG login (backend)
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error('Login failed');

  const data = (await res.json()) as { token: string; user: BackendUser };
  return { token: data.token, user: normalizeUser(data.user) };
}

// Hämta inloggad användare (backend)
export async function getMe(token: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Unauthorized');

  const data = (await res.json()) as BackendUser;
  return normalizeUser(data);
}

// FAKE login (frontend-first / fallback)
export async function loginFake(
  email: string,
  password: string
): Promise<LoginResponse> {
  void password;

  await new Promise((resolve) => setTimeout(resolve, 500));

  const role: UserRole = email.toLowerCase().includes('manager')
    ? 'manager'
    : 'worker';

  return {
    token: 'fake-jwt-token',
    user: {
      id: 'u_123',
      email,
      role,
      name: 'Demo User',
      company: 'Demo Company',
    },
  };
}
