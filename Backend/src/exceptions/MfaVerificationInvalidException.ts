import HttpException from "./HttpException";

class MfaVerificationInvalidException extends HttpException {
    constructor() {
        super(401, `TOTP code is not valid`);
    }
}

export default MfaVerificationInvalidException;
