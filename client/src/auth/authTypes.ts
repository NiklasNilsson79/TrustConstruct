export type UserRole = 'worker' | 'manager';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
};
