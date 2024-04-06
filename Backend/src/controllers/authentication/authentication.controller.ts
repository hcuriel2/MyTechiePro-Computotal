import * as bcrypt from "bcryptjs";
import { Request, Response, NextFunction, Router } from "express";
import * as jwt from "jsonwebtoken";
import WrongCredentialsException from "../../exceptions/WrongCredentialsException";
import Controller from "../../interfaces/controller.interface";
import DataStoredInToken from "../../interfaces/dataStoredInToken";
import TokenData from "../../interfaces/tokenData.interface";
import validationMiddleware from "../../middleware/validation.middleware";
import adminMiddleware from "../../middleware/admin.middleware";
import CreateUserDto from "../user/user.dto";
import CreateAddressDto from "../user/address.dto";
import User from "../../models/user/user.interface";
import userModel from "../../models/user/user.model";
import AuthenticationService from "./authentication.service";
import AuthMiddleware from "../../middleware/auth.middleware"
import LogInDto from "./logIn.dto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import userController from "../user/user.controller";
import MfaVerificationInvalidException from "../../exceptions/MfaVerificationInvalidException";
import emailtransporter from "../../middleware/emailtransporter.middleware";
import UserNotVerify from "../../exceptions/UserNotVerify";
import authMiddleware from "../../middleware/error.middleware";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import AuthenticationTokenMissingException from "../../exceptions/AuthenticationTokenMissingException";
import { validate, ValidationError } from "class-validator";


class AuthenticationController implements Controller {
    public path = "/api/auth";
    public router = Router();
    public authenticationService = new AuthenticationService();
    private user = userModel;
    public URL = process.env.SERVER_URL;
    public CLIENT_URL = process.env.CLIENT_URL;


    constructor() {
        this.initializeRoutes();
    }

    // Routes for the base '/auth' route
    // Middleware is applied to ensure valid users/DTO objects (data transfer objects)
    // Last parameter is a function (listed below alphabetically)
    private initializeRoutes() {
        this.router.post(`${this.path}/admin/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.get(`${this.path}/checkSession`, authMiddleware, this.checkSession);
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
        this.router.post(`${this.path}/professional/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/resetPassword`, this.sendResetPwEmail);
        this.router.patch(`${this.path}/settings/:id`, authMiddleware, this.updateUserSettings);
        this.router.get(`${this.path}/checkSession`, authMiddleware, this.checkSession);
        this.router.get(`${this.path}/getUserInfo`, authMiddleware, this.getUserInfo);

    }

    public getUserInfo = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        const user = request.user;
        if (!user) {
            // If there's no user, send a 401 Unauthorized response.
            return response.status(401).json({ message: 'Unauthorized: No user information available.' });
        }

        try {
            // Directly return the user object. Be cautious with sensitive information.
            response.json(user);
        } catch (error) {
            console.error('Failed to fetch user information:', error);
            response.status(500).json({ message: 'Internal server error while fetching user information.' });
        }
    }


    // Creates an HttpOnly cookie
    // Used to enable secure sessions
    // Expires after an hour
    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${tokenData.expiresIn}`;
    }

    // Creates a JWT token
    // This token's data is inserted into a HttpOnly cookie
    // Expires after an hour
    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
            userType: user.userType

        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }

    // Returns User information
    // This route is called to retrieve User information the the front-end
    private checkSession = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const user = request.user;
        if (!user) {
            return next(new Error('User information is missing from the request'));
        }

        try {
            response.json(user);

        } catch (error) {
            next(new Error('Check session response failed'));

        }
    }

    // Logs the User in
    // Searches the database for the User
    // Decrypts password and issues an HttpOnly cookie on successful login
    private loggingIn = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ email: logInData.email });


        if (user) {
            const sec = user.get("secret");
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.get("password", null, { getters: false })
            );
            if (!user.verified) {
                next(new UserNotVerify());
            }
            if (isPasswordMatching) {
                if (sec) {
                    if (!logInData.secret) {
                        next(new MfaVerificationInvalidException());
                    }
                    const isMfaVerified = speakeasy.totp.verify({
                        secret: sec,
                        encoding: "base32",
                        token: logInData.secret
                    });
                    if (!isMfaVerified) {
                        next(new MfaVerificationInvalidException());
                        return;
                    }
                };
                const tokenData = this.createToken(user);
                response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
                //response.send({ message: 'Login successful' });
                response.send(user);

            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    };

    // Logs the User out
    // Sets the HttpOnly cookie to an expired state
    private loggingOut = (request: Request, response: Response) => {

        // Clear the cookie with matching attributes, except Max-Age which is set to expire the cookie
        response.setHeader('Set-Cookie', 'Authorization=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None');

        response.send(200);
    };

    // Registers a new User
    // Generates a new account
    // Issues a verification email to the User
    private registration = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const userData: CreateUserDto = request.body;

        try {
            const { cookie, user } = await this.authenticationService.register(userData);
            response.setHeader("Set-Cookie", [cookie]);
            //response.send({ message: 'Registration successful', userType: user.userType });
            response.send(user);
        } catch (error) {
            next(error);
        }
    };

    // Sends a password reset email to a User's email
    // Works with the 'Forgot Password' option on the initial login page
    // Sends a link which enables the User to modify their password
    private sendResetPwEmail = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {


        const { emailAddress } = request.body;

        const user = await this.user.findOne({ email: emailAddress });

        if (!user) {

            response.status(200);
            return;
        }

        let setPwEmailOptions = {
            from: 'noreply.mytechie.pro@gmail.com',
            to: emailAddress,
            subject: "Reset Password",
            html: "<b>Reset Password</b><br/><br/>" +
                `<p>Please click <a href="${this.CLIENT_URL}/resetPassword/${user._id}">here</a> to change password.</p> <br/>`
        }

        emailtransporter.sendMail(setPwEmailOptions, function (error, info) {
            if (error) {

                response.status(500);
            } else {

                response.status(200);
            }
        });
    };

    // Updates User's information in the frontend '/settings' route
    // Modifies existing information in the database
    private updateUserSettings = async (
        request: RequestWithUser,
        response: Response,
    ) => {
        const userId = request.user._id;

        const { firstName, lastName, email, street, city, country, postalCode } = request.body;

        try {
            let user = await this.user.findById(userId);

            if (!user) {
                return response.status(404).json({ message: 'User not found' });
            }

            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;

            if (user.address) {
                user.address.street = street || user.address.street;
                user.address.city = city || user.address.city;
                user.address.country = country || user.address.country;
                user.address.postalCode = postalCode || user.address.postalCode;
            }

            await user.save();

            return response.status(200).json({ message: 'Update successful' });

        } catch (error) {
            console.error('Error updating user:', error);
            return response.status(500).json({ message: 'Failed to update user', error: error.message });
        }
    };
}

export default AuthenticationController;
