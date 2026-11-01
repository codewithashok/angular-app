import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
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
  protected readonly auth = inject(AuthService);

  // toSignal subscribes to the request and gives us a signal; it unsubscribes automatically.
  protected readonly users = toSignal(this.api.get<User[]>(API_ENDPOINTS.users), {
    initialValue: [],
  });

  // Local state: only this page cares which user is selected, so it lives here, not in a service.
  protected readonly selectedUser = signal<User | null>(null);
}
