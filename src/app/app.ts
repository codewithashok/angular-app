import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoader } from '@core/layout/global-loader/global-loader';
import { ToastContainer } from '@core/layout/toast-container/toast-container';

/**
 * Root component. Stays tiny: global overlays (loader, toasts) + the top-level outlet.
 * Page chrome (header/footer) lives in layouts so pages like /login can use a different one.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoader, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
