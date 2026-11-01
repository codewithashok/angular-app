import { Injectable, computed, signal } from '@angular/core';

/**
 * Tracks in-flight HTTP requests. Uses a counter (not a boolean) so parallel
 * requests don't hide the loader when the first one finishes.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);
  readonly isLoading = computed(() => this.activeRequests() > 0);

  start(): void {
    this.activeRequests.update((n) => n + 1);
  }

  stop(): void {
    this.activeRequests.update((n) => Math.max(0, n - 1));
  }
}
