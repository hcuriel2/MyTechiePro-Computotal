import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import WrongAdminException from "../exceptions/WrongAdminException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import userModel from "../models/user/user.model";

async function adminMiddleware(
    request: RequestWithUser,
    response: Response,
    next: NextFunction
) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        const secret = process.env.JWT_SECRET;
        try {
            const verificationResponse = jwt.verify(
                cookies.Authorization,
                secret
            ) as DataStoredInToken;
            const id = verificationResponse._id;
            const user = await userModel.findById(id);
            if (user.userType === "Admin") {
                request.user = user;
                next();
            } else {
                next(new WrongAuthenticationTokenException());
            }
        } catch (error) {
            next(new WrongAdminException());
        }
    } else {
        next(new WrongAdminException());
    }
}

export default adminMiddleware;
