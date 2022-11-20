import HttpException from "./HttpException";

class NotFoundCategoryException extends HttpException {
    constructor(id: string) {
        super(404, `Category with id ${id} not found`);
    }
}

export default NotFoundCategoryException;
