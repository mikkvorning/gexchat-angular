/**
 * @file validators.ts
 * @description Custom Angular reactive form validator utilities.
 *
 * These helpers extend Angular's built-in `Validators` to support
 * co-located error messages — keeping validation rules and their
 * human-readable messages in the same place rather than split across
 * the form definition and the template.
 *
 * All validators attach a `{ message: string }` object to the error entry,
 * which can be read in templates via a `getError()` helper:
 *
 * ```ts
 * getError(field: string): string {
 *   const errors = this.form.get(field)?.errors;
 *   return errors ? (errors[Object.keys(errors)[0]]?.message ?? '') : '';
 * }
 * ```
 *
 * Template usage (single `<mat-error>` per field):
 * ```html
 * <mat-error>{{ getError('password') }}</mat-error>
 * ```
 */

import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

/**
 * Wraps any Angular `ValidatorFn` and attaches a custom error message.
 *
 * The original error key produced by the validator is preserved, so
 * `hasError()` checks remain compatible.
 *
 * @param validator - Any Angular built-in or custom `ValidatorFn`.
 * @param message   - Human-readable error message shown in the template.
 * @returns A `ValidatorFn` that emits `{ [errorKey]: { message } }` on failure.
 *
 * @example
 * ```ts
 * email: ['', [
 *   rule(Validators.required, 'Email is required'),
 *   rule(Validators.email, 'Please enter a valid email address'),
 * ]]
 * ```
 */
export function rule(validator: ValidatorFn, message: string): ValidatorFn {
  return (control) => {
    const errors = validator(control);
    if (!errors) return null;
    const key = Object.keys(errors)[0];
    return { [key]: { message } };
  };
}

/**
 * Validates a control's value against a regular expression.
 *
 * Unlike `Validators.pattern`, each `matches` call generates a unique error
 * key derived from the regex source, so multiple pattern validators on the
 * same control do not overwrite each other in the errors object.
 *
 * Empty/null values are considered valid — combine with `rule(Validators.required, ...)`
 * if the field is mandatory.
 *
 * @param regex   - Regular expression the value must satisfy.
 * @param message - Human-readable error message shown in the template.
 * @returns A `ValidatorFn` that emits `{ [regexKey]: { message } }` on failure.
 *
 * @example
 * ```ts
 * password: ['', [
 *   rule(Validators.required, 'Password is required'),
 *   rule(Validators.minLength(8), 'Password must be at least 8 characters'),
 *   matches(/[A-Z]/, 'Password must contain at least one uppercase letter'),
 *   matches(/[a-z]/, 'Password must contain at least one lowercase letter'),
 *   matches(/[0-9]/, 'Password must contain at least one number'),
 * ]]
 * ```
 */
export function matches(regex: RegExp, message: string): ValidatorFn {
  const key = regex.source.replace(/\W+/g, '_');
  return (control) => {
    if (!control.value || regex.test(control.value)) return null;
    return { [key]: { message } };
  };
}

/**
 * Returns the error message for the first failing validator on a form field.
 *
 * Designed to work with validators created via `rule()` and `matches()`, which
 * attach a `{ message: string }` object to each error entry.
 *
 * Returns an empty string when the field has no errors, making it safe to bind
 * directly to a `<mat-error>` or similar element.
 *
 * @param form  - The `FormGroup` containing the field.
 * @param field - The name of the form control to check.
 * @returns The first active error's message, or an empty string.
 *
 * ---
 *
 * ### Usage option 1 — wrapper method (recommended)
 *
 * Define a thin adapter on the component class that pre-fills the form.
 * The template only needs to pass the field name.
 *
 * ```ts
 * // component.ts
 * getError = (field: string) => getFieldError(this.myForm, field);
 * ```
 * ```html
 * <!-- template -->
 * <mat-error>{{ getError('email') }}</mat-error>
 * ```
 *
 * ---
 *
 * ### Usage option 2 — direct call in template
 *
 * Expose `getFieldError` as a class property and pass the form explicitly.
 * More verbose in the template but requires no wrapper method.
 *
 * ```ts
 * // component.ts
 * protected getFieldError = getFieldError;
 * ```
 * ```html
 * <!-- template -->
 * <mat-error>{{ getFieldError(myForm, 'email') }}</mat-error>
 * ```
 */
export function getFieldError(
  form: FormGroup | AbstractControl,
  field: string,
): string {
  const errors = form.get(field)?.errors;
  return errors ? (errors[Object.keys(errors)[0]]?.message ?? '') : '';
}
