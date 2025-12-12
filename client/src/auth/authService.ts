import type { AuthUser, UserRole } from './authTypes';

type LoginResponse = {
  token: string;
  user: AuthUser;
};

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
