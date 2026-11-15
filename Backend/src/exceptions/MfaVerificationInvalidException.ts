import HttpException from "./HttpException";

// A 401 distinguishes a rejected authenticator code from a bad password so the
// sign-in screen can keep the user on the code-entry step and allow another try.
class MfaVerificationInvalidException extends HttpException {
    constructor() {
        super(401, `TOTP code is not valid`);
    }
}

export default MfaVerificationInvalidException;
