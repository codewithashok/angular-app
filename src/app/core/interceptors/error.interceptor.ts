import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { AppError } from '@core/models/app-error.model';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { StorageService } from '@core/services/storage.service';
import { SKIP_ERROR_TOAST } from './http-context.tokens';

/**
 * Central HTTP error handling:
 * 1. Maps HttpErrorResponse -> AppError (one predictable shape for components)
 * 2. Shows a user-friendly toast (opt out with SKIP_ERROR_TOAST)
 * 3. Clears the session on 401
 * 4. Re-throws so callers can still react (stop a spinner, show inline errors)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const logger = inject(LoggerService);
  const storage = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError: AppError = {
        status: error.status,
        message: messageFor(error),
        url: error.url,
        details: error.error,
      };

      logger.error('HTTP error', appError);

      if (error.status === 401) {
        storage.remove(STORAGE_KEYS.accessToken);
        // Redirect to /login is added in the Auth step.
      }

      if (!req.context.get(SKIP_ERROR_TOAST)) {
        notify.error(appError.message);
      }

      return throwError(() => appError);
    }),
  );
};

function messageFor(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Network error. Please check your connection.';

  // Prefer a message from the backend if it sent one.
  const serverMessage = (error.error as { message?: unknown } | null)?.message;
  if (typeof serverMessage === 'string' && serverMessage) return serverMessage;

  switch (error.status) {
    case 400:
      return 'Invalid request.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    default:
      return error.status >= 500
        ? 'Server error. Please try again later.'
        : `Unexpected error (${error.status}).`;
  }
}
