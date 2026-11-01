import { Directive, signal } from '@angular/core';

/**
 * Turns any element into an open/close switch.
 *
 * Usage:
 *   <button appToggle #t="appToggle">{{ t.isOpen() ? 'Show less' : 'Show more' }}</button>
 *   @if (t.isOpen()) { ...extra content... }
 *
 * A directive has NO template of its own; it adds behaviour to the element it is placed on.
 */
@Directive({
  // Attribute selector: applies to any element that has the `appToggle` attribute.
  selector: '[appToggle]',
  // Lets the template grab this directive instance: #t="appToggle"
  exportAs: 'appToggle',
  host: {
    // Listen to clicks on the element this directive is placed on.
    '(click)': 'toggle()',
    // Keep the element's aria-expanded attribute in sync (helps screen readers).
    '[attr.aria-expanded]': 'isOpen()',
  },
})
export class Toggle {
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((open) => !open);
  }
}

/*
 * ===========================================================================
 *  NOTES: Directives
 * ===========================================================================
 *
 * WHAT IS A DIRECTIVE?
 *   A class that adds BEHAVIOUR to an existing element. It has NO template.
 *
 * ---------------------------------------------------------------------------
 *  3 KINDS OF DIRECTIVES
 * ---------------------------------------------------------------------------
 *   1. Component            a directive WITH a template: <app-user-detail />
 *   2. Attribute directive  changes behaviour/look of an element (THIS one)
 *                           built-in examples: [class], [style], routerLink, routerLinkActive
 *   3. Structural directive adds/removes elements (uses <ng-template>)
 *                           old built-ins: *ngIf, *ngFor -> now replaced by @if / @for
 *
 * ---------------------------------------------------------------------------
 *  CREATING A CUSTOM DIRECTIVE
 * ---------------------------------------------------------------------------
 *   1. Generate:  ng generate directive shared/directives/toggle
 *   2. Choose a selector (WHERE it applies):
 *        '[appToggle]'          any element with the appToggle attribute  (most common)
 *        'button[appToggle]'    only <button> elements with it
 *        '.app-toggle'          any element with that CSS class           (rare)
 *      Always use a prefix (app) to avoid clashing with HTML or other libraries.
 *   3. Use it: add Toggle to the component's `imports: []`, then
 *        <button appToggle>...</button>
 *
 * ---------------------------------------------------------------------------
 *  host: { }  (talking to the element the directive is placed on)
 * ---------------------------------------------------------------------------
 *      '(click)': 'toggle()'                 listen to an event       (event binding)
 *      '[attr.aria-expanded]': 'isOpen()'    set an attribute         (property binding)
 *      '[class.open]': 'isOpen()'            add/remove a CSS class
 *      '[style.color]': "'red'"              set a style
 *
 *   Older code does the same with decorators (still works, but `host` is preferred):
 *      @HostListener('click') onClick() { ... }
 *      @HostBinding('attr.aria-expanded') get expanded() { ... }
 *
 * ---------------------------------------------------------------------------
 *  exportAs (sharing the directive's state with the template)
 * ---------------------------------------------------------------------------
 *      exportAs: 'appToggle'
 *      <button appToggle #t="appToggle">   -> t is THIS directive instance
 *      @if (t.isOpen()) { ... }            -> other elements can read its state
 *
 * ---------------------------------------------------------------------------
 *  OTHER THINGS A DIRECTIVE CAN DO
 * ---------------------------------------------------------------------------
 *   - Receive values with input():
 *        readonly appToggleOpen = input(false);   <button appToggle [appToggleOpen]="true">
 *   - Send events with output():
 *        readonly toggled = output<boolean>();    <button appToggle (toggled)="...">
 *   - Access the real DOM element:
 *        private readonly el = inject(ElementRef);   // el.nativeElement
 *     (Prefer host bindings; touch the DOM directly only when unavoidable.)
 *
 * ---------------------------------------------------------------------------
 *  DIRECTIVE vs COMPONENT
 * ---------------------------------------------------------------------------
 *                      Component                  Directive
 *      Own HTML        yes (template)             no
 *      Used as         element <app-x>            attribute <button appX>
 *      Purpose         draw UI                    add behaviour to existing UI
 *      Per element     only one component         many directives allowed
 */
