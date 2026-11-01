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
