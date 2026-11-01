import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a full name into its initials.
 *
 * Usage:  {{ 'Leanne Graham' | initials }}  ->  "LG"
 *         {{ 'Mrs. Dennis Schulist' | initials }}  ->  "MD" (max 2 letters)
 */
@Pipe({
  // The name you write in templates after the | symbol.
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  // Angular calls transform() with the value on the LEFT of the |.
  // Whatever it returns is what gets displayed.
  transform(name: string | null | undefined): string {
    if (!name) return '';

    return name
      .trim()
      .split(/\s+/) // "Leanne Graham" -> ["Leanne", "Graham"]
      .map((word) => word[0]) // -> ["L", "G"]
      .join('') // -> "LG"
      .slice(0, 2)
      .toUpperCase();
  }
}

/*
 * ===========================================================================
 *  NOTES: Pipes
 * ===========================================================================
 *
 * WHAT IS A PIPE?
 *   A function used in templates to change how a value is DISPLAYED.
 *   It never changes the original data; it only formats the output.
 *
 *      {{ value | pipeName }}                  no arguments
 *      {{ value | pipeName: arg1 : arg2 }}     with arguments (separated by :)
 *      {{ value | pipe1 | pipe2 }}             chained, runs left to right
 *
 * ---------------------------------------------------------------------------
 *  BUILT-IN PIPES (from @angular/common)
 * ---------------------------------------------------------------------------
 *      uppercase / lowercase / titlecase   text case
 *      date        {{ d | date: 'dd/MM/yyyy' }}      -> 01/11/2026
 *      number      {{ 1 | number: '3.0-0' }}         -> 001   (class: DecimalPipe)
 *      currency    {{ 1250 | currency: 'INR' }}      -> ₹1,250.00
 *      percent     {{ 0.25 | percent }}              -> 25%
 *      slice       {{ 'Angular' | slice: 0 : 3 }}    -> Ang   (works on arrays too)
 *      json        {{ obj | json }}                  -> formatted JSON (debugging)
 *      keyvalue    @for (e of obj | keyvalue; ...)   -> loop over an object
 *      async       {{ obs$ | async }}                -> subscribes to an Observable
 *
 * ---------------------------------------------------------------------------
 *  CREATING A CUSTOM PIPE
 * ---------------------------------------------------------------------------
 *   1. Generate:   ng generate pipe shared/pipes/initials
 *   2. Give it a name in @Pipe({ name: 'initials' }), the word used after the |
 *   3. Implement transform(value, ...args): the return value is what's displayed
 *        - value = what is on the LEFT of the |
 *        - args  = anything after the colons:  {{ name | initials: 3 }}
 *                  -> transform(name, maxLetters = 2) { ... }
 *   4. Use it: add InitialsPipe to the component's `imports: []`, then
 *        {{ user().name | initials }}
 *
 * ---------------------------------------------------------------------------
 *  PURE vs IMPURE
 * ---------------------------------------------------------------------------
 *   pure: true (DEFAULT, like this pipe)
 *      transform() re-runs ONLY when the input changes:
 *        - primitives (string/number/boolean): when the value is different
 *        - objects/arrays: only when it's a NEW reference
 *          (array.push() on the same array is NOT detected)
 *      Fast; use this almost always.
 *
 *   pure: false  ->  @Pipe({ name: 'x', pure: false })
 *      transform() re-runs on EVERY change detection, even if nothing changed.
 *      Detects array.push(), but can be slow. Built-in impure pipes: async, json, keyvalue.
 *      Prefer immutable updates ([...arr, item]) or computed() instead.
 *
 * ---------------------------------------------------------------------------
 *  PIPE vs METHOD IN TEMPLATE
 * ---------------------------------------------------------------------------
 *      {{ getInitials(user().name) }}   method: may run on every change detection
 *      {{ user().name | initials }}     pure pipe: runs only when name changes
 *   Pipes are also reusable: any component can import them.
 *
 * ---------------------------------------------------------------------------
 *  WHERE DO PIPES LIVE?
 * ---------------------------------------------------------------------------
 *      shared/pipes/       used by many features (like this one)
 *      features/x/pipes/   used by one feature only
 *   Keep pipes simple and side-effect free: no HTTP calls, no state changes.
 */
