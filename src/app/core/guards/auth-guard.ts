import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Protects routes that need a logged-in user.
 *
 * Add it to a route:  { path: 'users', canActivate: [authGuard], ... }
 * The router runs this BEFORE opening the page:
 *   - return true     -> the page opens
 *   - return UrlTree  -> the router redirects there instead
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // Not logged in: go to /login and remember where the user wanted to go.
  // state.url is the URL being opened, e.g. "/posts" -> /login?returnUrl=%2Fposts
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
