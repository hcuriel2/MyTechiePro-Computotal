import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordValidator: ValidatorFn = (
    control: AbstractControl
): ValidationErrors | null => {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { notSame: true };
};
