# Senior Level Angular Interview Answers

Answers to `Senior Level Interview Questions.txt`, written for Angular 22 but noting the
older behaviour interviewers often still ask about. Where this repo has a live example,
the file is linked.

---

## 1. Angular Change Detection (internal working)

**What it is:** the process of keeping the DOM in sync with component data.

**How it works:**

- At compile time, every template becomes a function with two parts: _create_ (build the
  DOM once) and _update_ (compare each binding with its previous value).
- Angular stores the previous value of every binding. During change detection it walks the
  component tree **top-down**, re-evaluates each binding, and touches the DOM only where the
  value changed (`===` comparison).
- Something has to _trigger_ a pass:
  - **Old (zone-based):** Zone.js notices any async event (click, timer, HTTP) and runs
    `ApplicationRef.tick()`, which checks the whole tree.
  - **New (zoneless, this project):** a pass is scheduled only when Angular is told something
    changed: a signal read in a template is set, an event bound in a template fires,
    `markForCheck()` is called, or the `async` pipe receives a value.
- In dev mode Angular runs a second check and throws
  `ExpressionChangedAfterItHasBeenCheckedError` if a binding changed during the check
  (it means data flow is not one-directional).

**Signals make it granular:** a signal knows which templates read it, so only those
components (not their ancestors) are marked dirty.

---

## 2. Zone.js and its role in Angular

- Zone.js **monkey-patches** browser async APIs (`setTimeout`, `addEventListener`,
  `Promise`, XHR...). Angular runs the app in an `NgZone`, so after any async callback
  finishes, Zone.js notifies Angular, which runs change detection.
- Benefit: "magic" UI updates; you never tell Angular something changed.
- Costs: ~30 KB bundle, change detection runs after _every_ async event even when nothing
  changed, harder stack traces, and some APIs (`async/await` natively) can't be patched.
- `ngZone.runOutsideAngular(() => ...)` was the old optimisation for scroll/mousemove
  handlers that should not trigger change detection.

**Today:** Angular 20.2+ supports **zoneless** as stable, and new apps (v21+) are zoneless
by default (`provideZonelessChangeDetection()` is implied). This repo is zoneless; see
[post-list.ts](../src/app/features/posts/post-list/post-list.ts): an old-style plain
property set inside `subscribe()` needs `markForCheck()` because there is no zone.

---

## 3. Ivy Renderer & Standalone Components

**Ivy** (default since v9) is Angular's compiler + runtime:

- Compiles each component into instructions (`ɵɵelementStart`, `ɵɵtext`...) placed on the
  class as a static `ɵcmp` definition.
- **Locality:** a component compiles using only its own metadata → faster builds, libraries
  can be compiled once.
- **Tree-shakable:** unused framework features are not in the bundle.
- Enabled standalone components, signals, `@if/@for` control flow, deferrable views.

**Standalone components** (default since v19):

- The component declares its own dependencies in `imports: [...]`; no `NgModule`.
- Bootstrapped with `bootstrapApplication(App, appConfig)`; providers live in
  [app.config.ts](../src/app/app.config.ts) instead of `AppModule`.
- Lazy load a single component: `loadComponent: () => import(...)`.
- Migration: `ng generate @angular/core:standalone`.

---

## 4. AOT vs JIT Compilation

|                             | JIT (Just-in-Time)             | AOT (Ahead-of-Time)                         |
| --------------------------- | ------------------------------ | ------------------------------------------- |
| When templates compile      | in the browser at runtime      | at build time                               |
| Compiler shipped to browser | yes (large)                    | no                                          |
| Startup                     | slower                         | faster                                      |
| Template errors found       | at runtime                     | at build time                               |
| Security                    | evaluates templates at runtime | templates pre-compiled, less injection risk |

AOT has been the default for both `ng serve` and `ng build` since Ivy (v9). JIT is now
used mainly in some test setups and for truly runtime-compiled templates (rare and
discouraged).

---

## 5. Memory Leaks & Performance Optimization

**Common leak sources**

- Subscriptions to long-lived Observables (`BehaviorSubject`, `interval`, router events,
  store selectors) never unsubscribed.
- Manual `addEventListener` / `setInterval` without cleanup.
- Third-party libraries (charts, maps) not destroyed in `ngOnDestroy`.
- Root services holding references to destroyed components or growing arrays/caches.

**Fixes**

- `async` pipe or `toSignal()` (auto-unsubscribe).
- `takeUntilDestroyed()` / `DestroyRef.onDestroy()`.
- Old way: `Subscription` + `ngOnDestroy` (see
  [post-list.ts](../src/app/features/posts/post-list/post-list.ts)) or `takeUntil(destroy$)`.
- Find leaks with Chrome DevTools → Memory → heap snapshots (look for "Detached" nodes).

**Performance checklist**

- Signals / `OnPush` / zoneless to cut change-detection work.
- `track` in `@for` (`trackBy` in `*ngFor`) to avoid re-creating DOM rows.
- Pure pipes or `computed()` instead of method calls in templates.
- Lazy routes (`loadComponent`/`loadChildren`) and `@defer` blocks.
- Virtual scrolling (`cdk-virtual-scroll-viewport`) for long lists.
- `NgOptimizedImage`, preloading strategies, bundle budgets in `angular.json`.
- `switchMap`/`debounceTime` to drop stale HTTP calls; cache rarely changing data.
- SSR + hydration for faster first paint.

---

## 6. OnPush Change Detection Strategy

```ts
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, ... })
```

With `Default`, a component is checked on every change-detection pass. With `OnPush`, it is
checked **only** when:

1. An `@Input` / `input()` receives a **new reference** (mutating an object does not count).
2. An event bound in its template (or a child's) fires.
3. A signal read in its template changes.
4. The `async` pipe emits.
5. `ChangeDetectorRef.markForCheck()` is called manually.

Consequences: you must use **immutable updates** (`[...items, newItem]`), and data changed
in a `subscribe()` callback needs `markForCheck()` (or a signal).

`markForCheck()` marks the component _and its ancestors_ dirty for the next pass;
`detectChanges()` checks this component and its children _right now_.

With signals and zoneless, OnPush is the recommended default and Angular is moving towards
making it the default strategy.

---

## 7. Dynamic Components

Creating components at runtime (modals, toasts, dashboards from config).

```ts
// 1. Declarative (simplest)
<ng-container *ngComponentOutlet="widgetType(); inputs: { data: data() }" />

// 2. Programmatic, into a ViewContainerRef
private vcr = viewChild.required('host', { read: ViewContainerRef });
const ref = this.vcr().createComponent(AlertComponent, {
  bindings: [inputBinding('message', () => 'Saved')],   // v20+ binding API
});
ref.setInput('type', 'success');   // older way to set inputs
ref.destroy();

// 3. Outside any view (e.g. attach to <body>)
const ref = createComponent(Modal, { environmentInjector: this.envInjector });
this.appRef.attachView(ref.hostView);
document.body.appendChild(ref.location.nativeElement);
```

`ComponentFactoryResolver` and `entryComponents` are the **pre-Ivy** way and are deprecated.
Lazy-load the component class with `await import(...)` before creating it.
The CDK (`Overlay`, `Dialog`, `ComponentPortal`) wraps this for real projects.

---

## 8. ViewChild vs ContentChild

|                   | `viewChild()` / `@ViewChild`     | `contentChild()` / `@ContentChild`                  |
| ----------------- | -------------------------------- | --------------------------------------------------- |
| Finds elements in | the component's **own template** | content the **parent projected** via `<ng-content>` |
| Available from    | `ngAfterViewInit`                | `ngAfterContentInit`                                |
| Plural            | `viewChildren()`                 | `contentChildren()`                                 |

```html
<!-- card.html (Card's own template) -->
<h2 #title>Card</h2>
← viewChild('title')
<ng-content />

<!-- parent.html -->
<app-card> <app-card-footer /> ← contentChild(CardFooter) inside Card </app-card>
```

Modern signal queries: `title = viewChild<ElementRef>('title')` → read with `this.title()`,
no lifecycle hook timing worries; `viewChild.required(...)` when it always exists.
Options: `{ read: ElementRef | ViewContainerRef | SomeDirective }`, `{ descendants: true }`
for content queries.

---

## 9. ng-content vs ng-template vs ng-container

|                  | Renders?                   | Purpose                                                                                                                                                                    |
| ---------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<ng-content>`   | yes, the projected content | **Content projection**: a slot where the parent's markup appears. Multi-slot with `select=".footer"`. Content is always created by the parent, even if the slot is hidden. |
| `<ng-template>`  | **no**, until told to      | A reusable chunk of template, rendered only via `*ngTemplateOutlet`, a structural directive, or `ViewContainerRef.createEmbeddedView()`. Can receive context: `let-item`.  |
| `<ng-container>` | no DOM element of its own  | A grouping wrapper that adds no extra element; used to host structural directives or `ngTemplateOutlet` without a `<div>`.                                                 |

```html
<ng-template #row let-user>{{ user.name }}</ng-template>
<ng-container *ngTemplateOutlet="row; context: { $implicit: selectedUser() }" />
```

Rule of thumb: **ng-content** = parent decides the content; **ng-template** = the component
decides when/how often to render it (e.g. a list that lets the caller customise each row).

---

## 10. Angular Security (XSS & CSRF)

**XSS (Cross-Site Scripting)**

- Angular treats every bound value as untrusted and **sanitizes** it by context: HTML
  (`[innerHTML]`), style, URL (`[href]`), resource URL (`<iframe [src]>`).
  `{{ }}` interpolation is always text-escaped.
- `DomSanitizer.bypassSecurityTrustHtml(...)` disables this; use only for content you
  fully control and review it in code review.
- Avoid `ElementRef.nativeElement.innerHTML = ...` (bypasses sanitization); use bindings
  or `Renderer2`.
- AOT avoids template injection; never build templates from user input.
- Add a **Content Security Policy**; Angular supports `autoCsp` in `angular.json` and
  **Trusted Types**.

**CSRF / XSRF (Cross-Site Request Forgery)**

- Relevant when auth is cookie-based. `HttpClient` supports the double-submit cookie
  pattern: it reads the `XSRF-TOKEN` cookie and sends it as the `X-XSRF-TOKEN` header on
  mutating requests to same-origin URLs (`provideHttpClient(withXsrfConfiguration({...}))`).
  The server must set the cookie and validate the header.
- Also: `SameSite` cookies on the server.
- Bearer tokens in headers (this repo's [auth.interceptor.ts](../src/app/core/interceptors/auth.interceptor.ts))
  are not sent automatically by the browser, so they are not vulnerable to CSRF, but
  tokens in `localStorage` _are_ exposed to XSS; HttpOnly cookies are safer for tokens.

Other points: never put secrets in the frontend (environment files ship to the browser),
validate on the server, keep Angular updated.

---

## 11. HTTP Interceptors

Middleware for every `HttpClient` request/response. Modern form is a function:

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(StorageService).get<string>(STORAGE_KEYS.accessToken);
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor]));
```

- Requests are **immutable** → `req.clone(...)`.
- **Order matters:** requests pass through in array order, responses come back in reverse.
- Per-request flags with `HttpContextToken` (this repo: `SKIP_LOADER`, `SKIP_ERROR_TOAST`).
- Typical uses: auth header, token refresh on 401 (queue requests while refreshing),
  global error handling, loader, retry (`retry({ count: 2, delay })`), caching, logging,
  base URL.
- Old way: class implementing `HttpInterceptor` registered with `HTTP_INTERCEPTORS` +
  `withInterceptorsFromDi()`.

Examples in this repo: [core/interceptors/](../src/app/core/interceptors/).

---

## 12. State Management & NgRx

**Levels of state**

1. **Local** component state → a `signal()` in the component.
2. **Shared** state → a root service with signals (this repo's
   [auth.service.ts](../src/app/core/services/auth.service.ts)) or `BehaviorSubject`
   (older).
3. **Complex, app-wide** state with many writers, auditing needs, undo, dev-tools → a
   library.

**NgRx Store** (Redux pattern):

- **Store** holds one immutable state tree.
- **Actions** describe events (`[Users Page] Load`).
- **Reducers** are pure functions: `(state, action) => newState`.
- **Selectors** derive memoized slices (`selectSignal` gives a signal).
- **Effects** handle side effects (HTTP) and dispatch success/failure actions.
- Pros: predictable, Redux DevTools time travel, scales across teams. Cons: lots of
  boilerplate.

**NgRx SignalStore** (`@ngrx/signals`) is the modern, lighter option:
`signalStore(withState(...), withComputed(...), withMethods(...))`.
Others: NGXS, Akita (deprecated), Elf.

Interview line: _"Start with signals in services; reach for NgRx when state is shared by
many features, changes from many places, and you need traceability."_

---

## 13. Data Sharing Between Components

| Relationship                    | Technique                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Parent → child                  | `input()` / `@Input()` (this repo: `[user]` in [user-list.html](../src/app/features/users/user-list/user-list.html)) |
| Child → parent                  | `output()` / `@Output() EventEmitter` (`(closed)`)                                                                   |
| Two-way                         | `model()` → `[(value)]`                                                                                              |
| Parent calls child              | `viewChild(Child)` then `this.child().method()`                                                                      |
| Siblings / unrelated            | shared service with signals or `BehaviorSubject`                                                                     |
| Across routes                   | route params, query params, `history.state`, resolvers                                                               |
| Persist across reloads          | localStorage / sessionStorage (via a service)                                                                        |
| App-wide complex                | NgRx / SignalStore                                                                                                   |
| Deep tree without prop drilling | a service provided at the ancestor component (`providers: [...]`)                                                    |

---

## 14. Custom Validators

**Sync validator** (a function returning `ValidationErrors | null`):

```ts
export function noSpaces(): ValidatorFn {
  return (control) => (/\s/.test(control.value ?? '') ? { noSpaces: true } : null);
}
username = new FormControl('', [Validators.required, noSpaces()]);
```

**Cross-field validator** (on the `FormGroup`):

```ts
const passwordsMatch: ValidatorFn = (group) =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
form = new FormGroup(
  { password: new FormControl(''), confirm: new FormControl('') },
  { validators: passwordsMatch },
);
```

**Async validator** (returns `Observable`/`Promise`; runs only after sync validators pass):

```ts
usernameTaken =
  (api: UserApi): AsyncValidatorFn =>
  (control) =>
    timer(400).pipe(
      switchMap(() => api.exists(control.value)),
      map((taken) => (taken ? { taken: true } : null)),
    );
new FormControl('', {
  validators: [Validators.required],
  asyncValidators: [usernameTaken(api)],
  updateOn: 'blur',
});
```

Template: `@if (form.controls.username.hasError('noSpaces')) {...}`.
For template-driven forms, wrap it in a directive providing `NG_VALIDATORS`.
Signal Forms use `validate(path, ctx => ...)` in the schema.

---

## 15. Angular Universal (SSR)

"Angular Universal" was the old name; since v17 it is built into the CLI as
`@angular/ssr` (`ng new --ssr` or `ng add @angular/ssr`).

- **SSR:** the server renders HTML per request → faster first contentful paint, better
  SEO and link previews.
- **SSG / prerendering:** HTML generated at build time for static routes.
- **Hybrid rendering (v19+):** choose per route with `RenderMode.Server | Prerender | Client`
  in `app.routes.server.ts`.
- **Hydration** (`provideClientHydration()`): the browser reuses the server DOM instead of
  re-rendering. **Incremental hydration** with `@defer (hydrate on viewport)`.
  `withEventReplay()` replays clicks made before hydration finished.
- **HTTP transfer cache:** data fetched on the server is reused in the browser, so the
  request isn't made twice.
- **Pitfalls:** no `window`/`document`/`localStorage` on the server. Guard with
  `afterNextRender()`, `isPlatformBrowser(inject(PLATFORM_ID))`, or inject `DOCUMENT`.
  Avoid DOM manipulation that breaks hydration (`ngSkipHydration` as last resort).

---

## 16. Angular Signals

Reactive primitives that hold a value and notify readers when it changes.

| API                                      | Purpose                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `signal(v)`                              | writable: `.set()`, `.update()`, `.asReadonly()`                                |
| `computed(() => ...)`                    | derived, read-only, lazy and memoized                                           |
| `linkedSignal(() => ...)`                | writable, but resets when its source changes (this repo: default selected user) |
| `effect(() => ...)`                      | side effects (logging, localStorage sync); not for copying state                |
| `input()`, `output()`, `model()`         | component API as signals                                                        |
| `viewChild()`, `contentChild()`          | signal queries                                                                  |
| `resource`, `rxResource`, `httpResource` | async data as signals (value, isLoading, error)                                 |
| `toSignal()`, `toObservable()`           | RxJS interop                                                                    |
| `untracked(() => ...)`                   | read without creating a dependency                                              |

**Why:** fine-grained change detection (only components that read a changed signal
update), no subscriptions to manage, enables zoneless, glitch-free derived state.

**Signals vs RxJS:** signals = _state_ (always have a current value, synchronous);
RxJS = _events/streams over time_ (debounce, retries, websockets, cancellation). They
complement each other.

---

## 17. Internationalization (i18n)

**Built-in `@angular/localize`:**

- Mark text: `<h1 i18n="@@homeTitle">Welcome</h1>`, attributes `i18n-title`, in TS
  `` $localize`Hello` ``.
- Plurals/selects (ICU): `{count, plural, =0 {No items} =1 {One item} other {{{count}} items}}`.
- `ng extract-i18n` produces `messages.xlf`; translators create `messages.fr.xlf`.
- Build **one bundle per locale** (`"localize": ["fr", "de"]` in `angular.json`); switching
  language means loading a different URL/build. Fastest at runtime, translations
  compiled in.
- Locale-aware pipes (`date`, `currency`, `number`) use `LOCALE_ID`.

**Runtime libraries:** **Transloco** or **ngx-translate** load JSON at runtime → switch
language without reload, one build. Trade-off: runtime cost, keys instead of source text.

Also consider RTL (`dir="rtl"`), date/number formats, and pluralization rules per language.

---

## 18. Renderer2

An abstraction for DOM manipulation instead of touching `nativeElement` directly.

```ts
private renderer = inject(Renderer2);
private el = inject(ElementRef);

this.renderer.addClass(this.el.nativeElement, 'active');
this.renderer.setStyle(this.el.nativeElement, 'color', 'red');
const unlisten = this.renderer.listen('window', 'resize', () => ...);   // call unlisten() on destroy
```

**Why:** works on platforms without a real DOM (SSR, web workers), keeps Angular's
sanitization in the loop, and is easy to mock in tests.

**Prefer first:** template bindings, or `host: { '[class.active]': '...', '(click)': '...' }`
in directives (like [toggle.ts](../src/app/shared/directives/toggle.ts)). Use
`Renderer2` when a directive must create/move elements or listen to global targets.

---

## 19. Testing Angular Apps & TestBed

- **Runners:** Karma + Jasmine (old, deprecated) → Jest (popular alternative) → **Vitest**
  (CLI default since v21, used here). E2E: Playwright / Cypress (Protractor is dead).
- **TestBed** creates a mini Angular environment:
  ```ts
  TestBed.configureTestingModule({
    imports: [UserDetail],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: AuthService, useValue: { isLoggedIn: signal(true) } },
    ],
  });
  const fixture = TestBed.createComponent(UserDetail);
  fixture.componentRef.setInput('user', mockUser);
  await fixture.whenStable();
  expect(fixture.nativeElement.textContent).toContain('LEANNE');
  ```
- `HttpTestingController` to assert requests and flush fake responses.
- `TestBed.inject(Service)`, `TestBed.runInInjectionContext()` for functional guards and
  interceptors (see [auth-guard.spec.ts](../src/app/core/guards/auth-guard.spec.ts)).
- `RouterTestingHarness` for routed components; CDK component harnesses for
  Material components.
- Async: `fakeAsync`/`tick` (zone-based) or `vi.useFakeTimers()` / `await whenStable()`
  (zoneless).
- **What to test:** pure logic (pipes, validators, services) directly without TestBed;
  components by their rendered output and emitted outputs, not private internals.

---

## 20. Migrating Angular Apps to New Versions

**Process**

1. Use the official guide: <https://angular.dev/update-guide> (choose from/to versions).
2. Upgrade **one major at a time**: `ng update @angular/core@N @angular/cli@N`.
   Schematics rewrite code automatically.
3. Update third-party libraries (`ng update @angular/material`, NgRx...) and check their
   compatibility tables.
4. Match Node.js and TypeScript versions required by that Angular release.
5. Run build, lint, unit and E2E tests after each step; commit per major.

**AngularJS (1.x) → Angular:** a rewrite, done incrementally with `@angular/upgrade`
(`UpgradeModule`, `downgradeComponent`) or by micro-frontends.

**Optional modernisation migrations** (`ng generate @angular/core:<name>`):

- `standalone` (remove NgModules)
- `control-flow` (`*ngIf/*ngFor` → `@if/@for`)
- `inject` (constructor DI → `inject()`)
- `signal-input-migration`, `output-migration`, `signal-queries-migration`
- `route-lazy-loading`, `cleanup-unused-imports`
- Zoneless: remove zone.js, add `provideZonelessChangeDetection()`, fix code relying on
  automatic change detection.

**Common pain points:** deprecated APIs removed (`ComponentFactoryResolver`, class guards,
`HttpClientModule` patterns), RxJS major upgrades, Karma → Vitest/Jest, libraries lagging
behind.
