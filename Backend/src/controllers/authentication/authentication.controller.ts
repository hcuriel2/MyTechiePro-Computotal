/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION

Summary:
This file defines an Express controller called AuthenticationController,
which handles various authentication-related operations. It also uses
different middleware for validation, authentication and authorization, MFA,
login/logout, and sending reset password emails. It also contains methods
for creating JWT tokens and cookies for user authentication and session management.


Imported but not used in this file (may be related to unfinished pro code):
- AuthMiddleware
- userController
- TokenData
- DataStoredInToken
- AdminMiddleware 
- UserNotVerify


Unused Code:
- lines 90 - 94 --> was supposed to be a route for pro registration
- lines 166 - 177 --> was supposed to handle pro registration & related data



MFA (not working currently - should be set up via SMS):
- lines 190 - 273



Clarification needed:
- do we have access to the 'noreplytechie@gmail.com' email --> its used for sending the password reset email (not currently working)



Changes:


*/




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


// This class implements the Controller Interface
class AuthenticationController implements Controller {
    public path = "/auth"; // the base path for auth-related routes
    public router = Router(); // create an Express router for this controller
    public authenticationService = new AuthenticationService(); // Create an instance of the AuthenticationService
    private user = userModel; // reference the user model
    public URL = "https://mytechie.pro";

    constructor() {
        this.initializeRoutes();
    }

    // Initializes routes and their handlers
    private initializeRoutes() {

        // POST route for user registration
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(CreateUserDto),
            this.registration
        );

        // POST route for admin registration
        this.router.post(
            `${this.path}/admin/register`,
            adminMiddleware,
            validationMiddleware(CreateUserDto),
            this.registration
        );
        
        // POST route for resetting mMFA
        this.router.post(
            `${this.path}/resetMfa`,
            this.resetMfa
        )

        // POST route for setting up MFA
        this.router.post(
            `${this.path}/setupMfa`,
            this.setupMfa
        );

        // Post route for verifying MFA
        this.router.post(
            `${this.path}/verifyMfa`,
            this.verifyMfa
        );

        // this.router.post(
        //     `${this.path}/professional/register`,
        //     validationMiddleware(CreateUserDto),
        //     this.registration
        // );

        // Post route for user login
        this.router.post(
            `${this.path}/login`,
            validationMiddleware(LogInDto),
            this.loggingIn
        );
        this.router.post(`${this.path}/logout`, this.loggingOut);
        
        this.router.get(`${this.path}/resetPassword/:emailAddress`, this.sendResetPwEmail)
    }
    

    // Handler for resetting user's passwords
    private sendResetPwEmail = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const emailAddress = request.params.emailAddress;
        const user = await this.user.findOne({ email: emailAddress });
        let setPwEmailOptions  = {
            from: 'noreplytechie@gmail.com', // sender address
            to: emailAddress, // list of receivers
            subject: "Reset Password", // Subject line
            html: "<b>Reset Password</b><br/><br/>" +
            `<p>Please click <a href="${this.URL}/resetPassword/${user._id}">here</a> to change password.</p> <br/>`
          }

        // Sends the reset password email
        emailtransporter.sendMail(setPwEmailOptions , function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });
    };

    // Handler for user registration
    private registration = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        
        // extract user data from the request body
        const userData: CreateUserDto = request.body;
        console.log(userData);
        try {

            // Call the registration method from AuthenticationService
            const { cookie, user } = await this.authenticationService.register(
                userData
            );

            // Set a cookie in the response
            response.setHeader("Set-Cookie", [cookie]);

            // Send the registered user data as a response
            response.send(user);
        } catch (error) {
            next(error);
        }
    };

    // private registrationPro = async (request: Request, response: Response, next: NextFunction) => {
    //     const userData: CreateUserDto = request.body;
    //     try {
    //         const { cookie, user } = await this.authenticationService.register(
    //             userData
    //         );
    //         response.setHeader("Set-Cookie", [cookie]);
    //         response.send(user);
    //     } catch (error) {
    //         next(error);
    //     }
    // };

    // Handler for resetting MFA
    private resetMfa = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const {id} = request.body;
        await this.user.findByIdAndUpdate(id, {
            secret: '',
            tempSecret: ''
        });
        return response.sendStatus(200);
    };

    // Handler for verifying MFA
    private verifyMfa = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const {id, token} = request.body;
        let user = await this.user.findById(id);
        let sec = user.get("tempSecret");
        if (!sec) {
            next(new MfaVerificationInvalidException())
        }
        
        let isVerified = speakeasy.totp.verify({
            secret: sec,
            encoding: 'base32',
            token: token
        });
    
        if (isVerified) {
            await this.user.findByIdAndUpdate(id, {
                secret: sec,
                tempSecret: ''
            });

            return response.sendStatus(200)
        } else {
            next(new MfaVerificationInvalidException());
        }
    };

    // Handler for setting up MFA
    private setupMfa = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const {id, email} = request.body;
        const ISSUER = 'Computotal';
        
        const secret = speakeasy.generateSecret({
            length: 10,
            name: email,
            issuer: ISSUER
        });
    
        var url = speakeasy.otpauthURL({
            secret: secret.base32,
            label: email,
            issuer: ISSUER,
            encoding: 'base32'
        });
        
        try {
            await this.user.findByIdAndUpdate(id, {
                secret: '',
                tempSecret: secret.base32
            });

            qrcode.toDataURL(url, (err, dataURL) => {
                return response.json({
                    secret: secret.base32,
                    dataURL,
                    issuer: ISSUER
                });
            });
        } catch (e) {
            next(e);
        }
    };

    // Handler for user login
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
            if(!user.verified) {
                next(new UserNotVerify());
            }
            if (isPasswordMatching) {
                if (sec) {
                    if (!logInData.secret) {
                        next(new MfaVerificationInvalidException());
                    }
                    const isMfaVerified = speakeasy.totp.verify({
                        secret:sec,
                        encoding:"base32",
                        token:logInData.secret
                    });
                    if (!isMfaVerified) {
                        next(new MfaVerificationInvalidException());
                        return;
                    }
                };
                const tokenData = this.createToken(user);
                response.setHeader("Set-Cookie", [
                    this.createCookie(tokenData),
                ]);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    };

    // Handler for logging out
    private loggingOut = (request: Request, response: Response) => {
        response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
        response.send(200);
    };

    // Method to create an Authorization cookie
    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    // Method to create a JWT token for user authentication
    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60; // an hour
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }
}

export default AuthenticationController;
