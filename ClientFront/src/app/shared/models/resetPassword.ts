export class ResetPassword {
    password: string;
    confirmPassword: string;
    token: string;

    constructor(password: string, confirmPassword: string, token: string = '') {
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.token = token;
    }
}
