import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import userModel from "../models/user/user.model";

async function authMiddleware(
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
            if (user) {
                request.user = user;
                next();
            } else {
                console.error(`User not found during authentication, ID: ${id}`);
                next(new WrongAuthenticationTokenException());
            }
        } catch (error) {
            console.error(`JWT Verification Error: ${error.message}`);
            next(new WrongAuthenticationTokenException());
        }
    } else {
        console.error('No Authorization cookie found');
        next(new AuthenticationTokenMissingException());
    }
}

export default authMiddleware;
