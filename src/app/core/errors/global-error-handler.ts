import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';

/**
 * Catches errors Angular doesn't otherwise handle: exceptions thrown in
 * components, templates, lifecycle hooks, and unhandled promise rejections.
 * HTTP errors are handled earlier by errorInterceptor.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly notify = inject(NotificationService);

  handleError(error: unknown): void {
    this.logger.error('Unhandled error', error);
    this.notify.error('Something went wrong. Please try again.');
  }
}
