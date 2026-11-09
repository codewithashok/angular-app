import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validator: the value must not contain any spaces.
 *
 * Usage:  username: ['', [Validators.required, noWhitespaceValidator()]]
 * Error:  { whitespace: true }  ->  check with control.hasError('whitespace')
 */
export function noWhitespaceValidator(): ValidatorFn {
  // Angular calls this function every time the control's value changes.
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;

    // Empty is not our job: leave that to Validators.required.
    if (!value) return null;

    // null = valid. An object = invalid; its key becomes the error name.
    return /\s/.test(value) ? { whitespace: true } : null;
  };
}

/*
 * ===========================================================================
 *  NOTES: Custom validators
 * ===========================================================================
 *
 * WHAT IS A VALIDATOR?
 *   A function that receives a form control and returns:
 *     null                 -> valid
 *     { errorName: ... }   -> invalid; the key is the error name
 *
 *   Built-in ones (Validators.required, minLength, email, pattern...) work the same way.
 *   Validators.minLength(3) returns { minlength: { requiredLength: 3, actualLength: 2 } }.
 *
 * ---------------------------------------------------------------------------
 *  WHY A FUNCTION THAT RETURNS A FUNCTION?
 * ---------------------------------------------------------------------------
 *   noWhitespaceValidator()  -> returns the actual validator (a ValidatorFn)
 *   This "factory" shape lets validators take settings, like Validators.minLength(3):
 *     export function forbiddenNameValidator(name: string): ValidatorFn {
 *       return (control) => control.value === name ? { forbiddenName: true } : null;
 *     }
 *
 * ---------------------------------------------------------------------------
 *  RULES OF THUMB
 * ---------------------------------------------------------------------------
 *   - Return null for empty values; let Validators.required handle "empty".
 *     Then an optional field with your rule still works when left blank.
 *   - Keep validators pure: no HTTP calls, no side effects (use an ASYNC validator for HTTP).
 *   - Put reusable ones in shared/validators/, feature-only ones in the feature folder.
 *
 * ---------------------------------------------------------------------------
 *  3 KINDS OF CUSTOM VALIDATORS
 * ---------------------------------------------------------------------------
 *   1. Field validator (THIS one)    checks one control
 *   2. Cross-field validator         put on the FormGroup to compare controls,
 *                                    e.g. password === confirmPassword
 *   3. Async validator               returns an Observable/Promise, e.g. ask the
 *                                    server "is this username taken?"; runs only after
 *                                    all sync validators pass; control.status = 'PENDING'
 */
