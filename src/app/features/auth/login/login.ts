import { JsonPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Role } from '@core/models/auth-user.model';
import { AuthService } from '@core/services/auth.service';
import { noWhitespaceValidator } from '@shared/validators/no-whitespace.validator';

/** Login page built with a REACTIVE FORM. On success the user is stored in AuthService. */
@Component({
  selector: 'app-login',
  // ReactiveFormsModule provides [formGroup], formControlName and (ngSubmit).
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  // NonNullable: reset() goes back to the initial values instead of null, so values are typed string.
  private readonly fb = inject(NonNullableFormBuilder);

  // Filled from the URL query param by the router: /login?returnUrl=%2Fposts -> "/posts".
  // Works because app.config.ts enables withComponentInputBinding().
  readonly returnUrl = input<string>();

  // The form is defined HERE, in TypeScript: each field = [initial value, validators].
  protected readonly form = this.fb.group({
    // Built-in validators + our CUSTOM one (shared/validators/no-whitespace.validator.ts).
    username: ['', [Validators.required, Validators.minLength(3), noWhitespaceValidator()]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user' as Role],
  });

  login(): void {
    // The button is disabled while invalid, but always re-check before using the values.
    if (this.form.invalid) return;

    // Fully typed: { username: string; password: string; role: Role }
    const { username, role } = this.form.getRawValue();

    this.auth.login(username.trim(), role);
    // Go back to the page the guard blocked, or /users by default.
    this.router.navigateByUrl(this.returnUrl() ?? '/users');
  }
}
