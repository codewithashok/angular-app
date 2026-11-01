/** The logged-in user, kept in AuthService and shared across the app. */
export interface AuthUser {
  username: string;
  loggedInAt: string;
}
