import { Injectable, computed, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { AuthUser } from '@core/models/auth-user.model';
import { StorageService } from './storage.service';

/**
 * Holds the logged-in user and shares it across the app.
 *
 * providedIn: 'root' => one instance, so the header, pages and guards
 * all read the same user.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);

  // Start with the user saved in localStorage, so a page refresh keeps you logged in.
  private readonly _user = signal<AuthUser | null>(
    this.storage.get<AuthUser>(STORAGE_KEYS.authUser),
  );

  // Read-only for everyone else; only login() and logout() can change it.
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  /**
   * Fake login: the demo API has no auth endpoint, so any username/password works.
   * A real app would POST credentials to the backend and receive the user + token.
   */
  login(username: string): void {
    const user: AuthUser = { username, loggedInAt: new Date().toISOString() };

    this._user.set(user);
    this.storage.set(STORAGE_KEYS.authUser, user);
    // authInterceptor adds this as "Authorization: Bearer ..." (see the Network tab).
    this.storage.set(STORAGE_KEYS.accessToken, 'demo-token');
  }

  logout(): void {
    this._user.set(null);
    this.storage.remove(STORAGE_KEYS.authUser);
    this.storage.remove(STORAGE_KEYS.accessToken);
  }
}
