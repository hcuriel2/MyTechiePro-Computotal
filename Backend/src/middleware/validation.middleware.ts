import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import HttpException from "../exceptions/HttpException";
import CreateAddressDto from "../controllers/user/address.dto";

function validationMiddleware<T>(
    type: any,
    skipMissingProperties = false
): RequestHandler {
    return (req, res, next) => {
        validate(plainToClass(type, req.body), { skipMissingProperties }).then(
            (errors: ValidationError[]) => {
                if (errors.length > 0) {
                    
                    const message = errors
                        .map((error: ValidationError) => {
                            const property = error.property;
                            
                            const constraintMessages = error.constraints 
                                ? Object.values(error.constraints)
                                : ['Invalid input'];
                            
                            return `${property}: ${constraintMessages.join(', ')}`;
                        })
                        .join(", ");
                    next(new HttpException(400, message));
                } else {
                    next();
                }
            }
        ).catch(err => {
            next(new HttpException(500, 'Validation process failed'));
        });
    };
}

export default validationMiddleware;
