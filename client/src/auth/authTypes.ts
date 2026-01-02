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

export type BackendUser = {
  id?: string;
  _id?: string; // optional fallback if a Mongo-shaped user ever appears

  name: string;
  company: string;

  role: UserRole;

  email?: string; // optional, backend-login may not include it
};
