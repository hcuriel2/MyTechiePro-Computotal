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

class AuthenticationController implements Controller {
    public path = "/auth";
    public router = Router();
    public authenticationService = new AuthenticationService();
    private user = userModel;
    public URL = "http://localhost:3333";

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(CreateUserDto),
            this.registration
        );

        this.router.post(
            `${this.path}/admin/register`,
            adminMiddleware,
            validationMiddleware(CreateUserDto),
            this.registration
        );
        
        this.router.post(
            `${this.path}/resetMfa`,
            this.resetMfa
        )

        this.router.post(
            `${this.path}/setupMfa`,
            this.setupMfa
        );

        this.router.post(
            `${this.path}/verifyMfa`,
            this.verifyMfa
        );
        // this.router.post(
        //     `${this.path}/professional/register`,
        //     validationMiddleware(CreateUserDto),
        //     this.registration
        // );

        this.router.post(
            `${this.path}/login`,
            validationMiddleware(LogInDto),
            this.loggingIn
        );
        this.router.post(`${this.path}/logout`, this.loggingOut);
        
        this.router.post(`${this.path}/resetPassword`, this.sendResetPwEmail)
    }
    

    private sendResetPwEmail = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        
        console.log('Reset email function called');

        const { emailAddress } = request.body;
        console.log(emailAddress);
        const user = await this.user.findOne({ emailAddress });

        if (!user){
            console.log('No user account is associated with the specified email');
            response.status(200);
            return;
        }

        /*
        const emailAddress = request.params.emailAddress;
        const user = await this.user.findOne({ email: emailAddress });
        */
        
        let setPwEmailOptions  = {
            from: 'noreply.mytechie.pro@gmail.com', // sender address
            to: emailAddress, // list of receivers
            subject: "Reset Password", // Subject line
            html: "<b>Reset Password</b><br/><br/>" +
            `<p>Please click <a href="${this.URL}/resetPassword/${user._id}">here</a> to change password.</p> <br/>`
          }
        emailtransporter.sendMail(setPwEmailOptions , function(error, info){
        if (error) {
            console.log(error);
            response.status(500); // Error sending email - set status code
        } else {
            console.log('Email sent: ' + info.response);
            response.status(200); // Email sent successfully
        }
        });
    };

    private registration = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const userData: CreateUserDto = request.body;
        console.log(userData);
        try {
            const { cookie, user } = await this.authenticationService.register(
                userData
            );
            response.setHeader("Set-Cookie", [cookie]);
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

    private loggingOut = (request: Request, response: Response) => {
        response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
        response.send(200);
    };

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

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
