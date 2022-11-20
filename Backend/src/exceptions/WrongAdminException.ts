import HttpException from "./HttpException";

class WrongAdminException extends HttpException {
    constructor() {
        super(401, "This account is not Admintrator.");
    }
}

export default WrongAdminException;
