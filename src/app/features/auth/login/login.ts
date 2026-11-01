import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/** Login page. On success the user is stored in AuthService (shared) and we go to /users. */
@Component({
  selector: 'app-login',
  template: `
    <h1>Login</h1>

    @if (auth.user(); as user) {
      <p>You are already logged in as {{ user.username }}.</p>
    } @else {
      <!-- $event.preventDefault() stops the browser from reloading the page on submit -->
      <form class="login" (submit)="$event.preventDefault(); login(username.value, password.value)">
        <label>
          Username
          <input #username autocomplete="username" />
        </label>
        <label>
          Password
          <input #password type="password" autocomplete="current-password" />
        </label>
        <button type="submit">Login</button>
      </form>
    }
  `,
  styles: `
    .login {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 320px;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  `,
})
export class Login {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  login(username: string, password: string): void {
    if (!username.trim() || !password) return;

    this.auth.login(username.trim());
    this.router.navigate(['/users']);
  }
}
