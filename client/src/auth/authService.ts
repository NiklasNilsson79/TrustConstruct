import type { AuthUser, UserRole } from './authTypes';

type LoginResponse = {
  token: string;
  user: AuthUser;
};

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

  if (!res.ok) {
    throw new Error('Login failed');
  }

  return res.json();
}

// FAKE login (frontend-first / fallback)
export async function loginFake(
  email: string,
  password: string
): Promise<LoginResponse> {
  void password; // avsiktligt oanvänd i fake-login

  await new Promise((resolve) => setTimeout(resolve, 500));

  const role: UserRole = email.toLowerCase().includes('manager')
    ? 'manager'
    : 'worker';

  return {
    token: 'fake-jwt-token',
    user: { id: 'u_123', email, role },
  };
}
