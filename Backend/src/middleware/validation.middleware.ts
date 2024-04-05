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
                            // Check if error.constraints is truthy before attempting to access its values
                            return error.constraints
                                ? Object.values(error.constraints).join(", ")
                                : 'Validation error without constraints message'; // Provide a generic message or handle this case as needed
                        })
                        .join(", ");
                    next(new HttpException(400, message));
                } else {
                    next();
                }
            }
        );
    };
}

export default validationMiddleware;
