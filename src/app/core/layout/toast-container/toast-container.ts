import { Component, inject } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

/** Renders NotificationService toasts. Placed once in the root App template. */
@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  protected readonly notify = inject(NotificationService);
}
