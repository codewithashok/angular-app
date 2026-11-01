import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '@core/models/toast.model';

/**
 * App-wide toast messages. State lives in a signal; ToastContainer renders it.
 * Any service or component can call notify.success('Saved'), notify.error(...), etc.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 0;

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 6000);
  }

  info(message: string): void {
    this.show('info', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private show(type: ToastType, message: string, durationMs = 4000): void {
    const id = ++this.nextId;
    this._toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}
