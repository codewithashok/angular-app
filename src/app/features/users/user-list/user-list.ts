import { Component, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { UserDetail } from '../user-detail/user-detail';

/**
 * PARENT component: loads users, shows the list, and passes the selected
 * user down to the child UserDetail component.
 */
@Component({
  selector: 'app-user-list',
  // A standalone component must import every child component it uses in its template.
  imports: [UserDetail],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  protected readonly auth = inject(AuthService);

  // toSignal subscribes to the request and gives us a signal; it unsubscribes automatically.
  protected readonly users = toSignal(this.api.get<User[]>(API_ENDPOINTS.users), {
    initialValue: [],
  });

  // Local state: only this page cares which user is selected, so it lives here, not in a service.
  // linkedSignal = a writable signal whose DEFAULT is computed from another signal:
  // - when users() changes (e.g. the API response arrives), it resets to the first user
  // - we can still change it ourselves with .set() (clicking a user, closing the panel)
  protected readonly selectedUser = linkedSignal<User | null>(() => this.users()[0] ?? null);

  // Runs when the child emits `closed`. `user` is the value the child passed to emit().
  onDetailClosed(user: User): void {
    this.selectedUser.set(null);
    this.notify.info(`Closed details of ${user.name}`);
  }
}
