import { Component, inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';

/** Thin progress bar at the top of the page while any HTTP request is running. */
@Component({
  selector: 'app-global-loader',
  template: `
    @if (loading.isLoading()) {
      <div class="loader" role="progressbar" aria-label="Loading"></div>
    }
  `,
  styleUrl: './global-loader.scss',
})
export class GlobalLoader {
  protected readonly loading = inject(LoadingService);
}
