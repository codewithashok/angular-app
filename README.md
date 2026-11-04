# Angular App

A production-style Angular 22 starter, built step by step to learn Angular concepts.
Standalone components, zoneless change detection, signals, SCSS, Vitest.

## Getting started

Requires Node.js 22+.

```bash
npm install
npm start          # dev server at http://localhost:4200
```

## Scripts

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm start`            | Dev server with live reload (development env) |
| `npm run build`        | Production build into `dist/`                 |
| `npm test`             | Unit tests (Vitest) in watch mode             |
| `npm run test:ci`      | Unit tests once, for CI                       |
| `npm run lint`         | ESLint for TypeScript and HTML templates      |
| `npm run lint:fix`     | ESLint with auto-fix                          |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Verify formatting without changing files (CI) |

A **pre-commit hook** (Husky + lint-staged) runs ESLint and Prettier on staged files,
so badly formatted or lint-failing code cannot be committed.

## Folder structure

```
src/
  environments/        Build-time config (API URL, flags). Swapped via angular.json fileReplacements.
  styles/              Global SCSS partials (design tokens).
  styles.scss          Global styles entry.
  app/
    app.config.ts      App-wide providers: router, HttpClient + interceptors, ErrorHandler.
    app.routes.ts      Top-level routes (pages are lazy loaded).
    app.ts             Root component: global loader, toasts, <router-outlet>.

    core/              Singletons used once for the whole app. Never imported by shared/.
      constants/       API endpoint paths, storage keys.
      errors/          GlobalErrorHandler (uncaught runtime errors).
      guards/          Route guards: authGuard (logged-in users only).
      interceptors/    auth (Bearer token), loading (global loader), error (AppError + toast).
      layout/          App shell components: MainLayout, ToastContainer, GlobalLoader.
      models/          App-wide types: AppError, Toast, PagedResponse, AuthUser, User, Post.
      services/        ApiService (all HTTP), AuthService, Logger, Storage, Notification, Loading.

    shared/            Reusable, stateless building blocks.
      directives/      Toggle (show more / show less).
      pipes/           InitialsPipe.

    features/          One folder per page/feature. Each feature owns its components,
                       services and models. Features never import from other features.
      auth/login/
      home/
      not-found/
      posts/post-list/
      users/user-list/, users/user-detail/
```

### Import rules

- `features/*` may import from `core/` and `shared/`.
- `shared/` may import from `core/models` only. It holds no app state.
- `core/` never imports from `features/`.
- Use path aliases instead of deep relative paths: `@core/...`, `@shared/...`, `@features/...`, `@env/...`.

### Naming conventions (Angular 2025 style guide)

| Kind        | File                      | Class / symbol    |
| ----------- | ------------------------- | ----------------- |
| Component   | `home.ts` + `.html/.scss` | `Home`            |
| Service     | `api.service.ts`          | `ApiService`      |
| Interceptor | `auth.interceptor.ts`     | `authInterceptor` |
| Guard       | `auth-guard.ts`           | `authGuard`       |
| Pipe        | `initials-pipe.ts`        | `InitialsPipe`    |
| Directive   | `toggle.ts`               | `Toggle`          |
| Model       | `app-error.model.ts`      | `AppError`        |

Guards, pipes and directives use the names `ng generate` produces.

## How an HTTP request flows

```
Component -> ApiService -> authInterceptor -> loadingInterceptor -> errorInterceptor -> server
```

- Components never inject `HttpClient` directly; they use `ApiService` (or a feature service built on it).
- Errors arrive in components as a normalized `AppError`; a toast is already shown.
- Opt out per request with `SKIP_LOADER` / `SKIP_ERROR_TOAST` HttpContext tokens.
