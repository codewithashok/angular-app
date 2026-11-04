/** What the user is allowed to do. Add more roles here as the app grows. */
export type Role = 'admin' | 'user';

/** The logged-in user, kept in AuthService and shared across the app. */
export interface AuthUser {
  username: string;
  role: Role;
  loggedInAt: string;
}
