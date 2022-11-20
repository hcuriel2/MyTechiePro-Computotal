import HttpException from "./HttpException";

class NotFoundcontactusException extends HttpException {
    constructor(id: string) {
        super(404, `Contact with id ${id} not found`);
    }
}

export default NotFoundcontactusException;
