import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

/** Admin-only page. Protected by roleGuard with data: { roles: ['admin'] } in app.routes.ts. */
@Component({
  selector: 'app-admin-dashboard',
  template: `
    <h1>Admin dashboard</h1>
    <p>Only users with the <strong>admin</strong> role can open this page.</p>
    <p>Signed in as {{ auth.user()?.username }} ({{ auth.user()?.role }}).</p>
  `,
})
export class AdminDashboard {
  protected readonly auth = inject(AuthService);
}
