import { Component, inject, signal } from '@angular/core';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';

interface Post {
  id: number;
  title: string;
}

/**
 * Landing page. The "Infrastructure check" panel lets you watch the
 * interceptors, global loader, toasts and GlobalErrorHandler work.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);

  protected readonly posts = signal<Post[]>([]);

  /** Success path: loader shows, data arrives, success toast. */
  loadPosts(): void {
    this.api.get<Post[]>(API_ENDPOINTS.posts, { params: { _limit: 5 } }).subscribe((posts) => {
      this.posts.set(posts);
      this.notify.success(`Loaded ${posts.length} posts`);
    });
  }

  /** HTTP error path: errorInterceptor maps the 404 and shows an error toast. */
  triggerHttpError(): void {
    this.api.get('/this-endpoint-does-not-exist').subscribe({
      // The toast is already shown by the interceptor; the component can still react.
      error: () => this.posts.set([]),
    });
  }

  /** Runtime error path: GlobalErrorHandler catches it. */
  triggerRuntimeError(): void {
    throw new Error('Demo runtime error from Home');
  }
}
