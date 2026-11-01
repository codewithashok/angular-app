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
