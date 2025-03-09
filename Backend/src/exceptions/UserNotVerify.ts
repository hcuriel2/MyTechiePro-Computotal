import HttpException from "./HttpException";

class UserNotVerify extends HttpException {
    constructor() {
        super(
            403,
            `User is not verified! Please check email address to verify user!`
        );
    }
}

export default UserNotVerify;
