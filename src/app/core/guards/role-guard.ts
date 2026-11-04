import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '@core/models/auth-user.model';
import { AuthService } from '@core/services/auth.service';

/**
 * AUTHORIZATION guard: is this user ALLOWED to open the page?
 * (authGuard answers a different question: is anyone logged in at all?)
 *
 * The allowed roles come from the route's `data`, so one guard works for every role:
 *   { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } }
 *
 * Guards run in array order: authGuard first sends logged-out users to /login,
 * then roleGuard sends logged-in users without the role to /forbidden.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data['roles'] ?? []) as Role[];

  if (allowedRoles.some((role) => auth.hasRole(role))) {
    return true;
  }

  // Logged in, but not allowed: 403 page.
  return router.createUrlTree(['/forbidden']);
};
