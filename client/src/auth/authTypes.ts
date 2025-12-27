export type UserRole = 'worker' | 'manager';

export type AuthUser = {
  id: string;

  name: string;
  company: string;

  role: UserRole;

  email?: string;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
};
