import HttpException from "./HttpException";

class WrongCredentialsException extends HttpException {
    constructor() {
        super(400, `Credential is not right`);
    }
}

export default WrongCredentialsException;
