import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';

/** Shows the list of users from the API. */
@Component({
  selector: 'app-user-list',
  template: `
    <h1>Users</h1>
    <!-- Shared data: the same logged-in user the header shows -->
    <p>Logged in as: {{ auth.user()?.username ?? 'nobody' }}</p>

    <ul>
      @for (user of users(); track user.id) {
        <li>{{ user.name }} ({{ user.email }})</li>
      } @empty {
        <li>Loading users…</li>
      }
    </ul>
  `,
})
export class UserList {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  // toSignal subscribes to the request and gives us a signal; it unsubscribes automatically.
  protected readonly users = toSignal(this.api.get<User[]>(API_ENDPOINTS.users), {
    initialValue: [],
  });
}
