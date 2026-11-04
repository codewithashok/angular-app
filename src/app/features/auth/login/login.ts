import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/** Login page. On success the user is stored in AuthService (shared) and we go to /users. */
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Filled from the URL query param by the router: /login?returnUrl=%2Fposts -> "/posts".
  // Works because app.config.ts enables withComponentInputBinding().
  readonly returnUrl = input<string>();

  login(username: string, password: string, role: string): void {
    if (!username.trim() || !password) return;

    this.auth.login(username.trim(), role === 'admin' ? 'admin' : 'user');
    // Go back to the page the guard blocked, or /users by default.
    this.router.navigateByUrl(this.returnUrl() ?? '/users');
  }
}
