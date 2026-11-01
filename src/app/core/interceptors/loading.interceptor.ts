import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '@core/services/loading.service';
import { SKIP_LOADER } from './http-context.tokens';

/** Shows the global loader while a request is in flight (opt out with SKIP_LOADER). */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADER)) {
    return next(req);
  }

  const loading = inject(LoadingService);
  loading.start();
  // finalize runs on success, on error AND on unsubscribe (e.g. component destroyed).
  return next(req).pipe(finalize(() => loading.stop()));
};
