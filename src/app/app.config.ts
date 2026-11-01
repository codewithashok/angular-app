import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { GlobalErrorHandler } from '@core/errors/global-error-handler';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { routes } from './app.routes';

/**
 * Application-wide providers (the standalone replacement for AppModule).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Forwards uncaught errors / unhandled promise rejections to ErrorHandler.
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // withComponentInputBinding: route params/query params/data bind to component inputs.
    provideRouter(routes, withComponentInputBinding()),

    // Interceptors run in this order for requests (and in reverse for responses):
    // auth adds the token -> loading tracks the request -> error handles failures.
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor]),
    ),
  ],
};
