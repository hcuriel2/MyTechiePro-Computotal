export class ResetPassword {
    password: string;
    confirmPassword: string;

    constructor(password: string, confirmPassword: string) {
        this.password = password;
        this.confirmPassword = confirmPassword;
    }
}