import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

/**
 * Thin wrapper around console. Swap the implementation later to ship logs to
 * a monitoring tool (Sentry, Datadog, App Insights...) without touching callers.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  debug(...args: unknown[]): void {
    if (!environment.production) console.debug('[DEBUG]', ...args);
  }

  info(...args: unknown[]): void {
    if (!environment.production) console.info('[INFO]', ...args);
  }

  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...args);
  }

  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args);
  }
}
