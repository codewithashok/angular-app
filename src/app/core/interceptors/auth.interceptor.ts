import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@env/environment';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { StorageService } from '@core/services/storage.service';

/**
 * Attaches `Authorization: Bearer <token>` to requests for OUR API only,
 * so the token never leaks to third-party URLs.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(StorageService).get<string>(STORAGE_KEYS.accessToken);

  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Requests are immutable, so clone to modify.
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
