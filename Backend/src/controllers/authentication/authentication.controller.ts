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
import projectModel from "../../models/project/project.model";
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
    private project = projectModel;
    public URL = process.env.SERVER_URL;
    public CLIENT_URL = process.env.CLIENT_URL;
    

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
        
        this.router.post(
          `${this.path}/professional/register`,
            validationMiddleware(CreateUserDto),
            this.registration
        );

        this.router.post(
            `${this.path}/login`,
            validationMiddleware(LogInDto),
            this.loggingIn
        );
        this.router.post(`${this.path}/logout`, this.loggingOut);
        
        this.router.post(`${this.path}/resetPassword`, this.sendResetPwEmail);


        this.router.post(`${this.path}/reviews`, this.projectReview);
    }
    

    private projectReview = async (
        request: Request,
        response: Response
    ) => {
        console.log(request.body);
        const projectID = request.body.projectID; 
        const review = request.body.review;
        const rating = request.body.rating;
        let projectObj = null;
        let clientID = null;
        let clientName = null;


        // Retrieve project object
        try {
            projectObj = await this.project.findOne({ _id: projectID });
            console.log("found project");
        } catch (e) {
            console.error(e);
        }
        
        // Take the clientID from the project object
        // Use this value to search for a client object
        // Assign the first and last name to clientName - this is used for the author value for the review comment
        clientID = projectObj.client;
        try {
            let clientObj = await this.user.findOne({ _id: clientID });
            let fName = clientObj.firstName;
            let lName = clientObj.lastName;
            clientName = `${fName} ${lName}`;
        } catch (e) {
            console.error(e);
        }
        


        // Object to hold Review and Rating
        const updateOperation = {
            $push: { comments: {
                text: review,
                authorId: clientID,
                authorName: clientName
            } 
        },
            $set: {rating: rating }
        }


        // Update the project object 
        try {
            const result = await this.project.updateOne({ _id: projectID }, updateOperation);
            console.log("Project review successfully added: ", result);
            response.json({ message: "Project updated successfully", result: result })

        } catch (e) {
            console.error(e);
            response.status(500).json({ message: "Failed to update project object" });
        }



        // If the rating is below 3, a notification needs to be sent to the admin
        if (rating < 3) {
            console.log('\n\n\n\n\n Negative review detected\n\n\n\n\n')
            let admins =  await this.findUsersByType('Admin');
            let emailList = null;

            for (let admin of admins){
                emailList += `${admin.email}, `
                
            }
            console.log(emailList);

            let html = `
                <h1>Unsatisfied Customer</h1>
                <p>Please contact the customer immediately</p>
                <p>Client: ${clientName}
                ClientID: ${clientID}</p>
            `

            this.sendEmail("willondrik@outlook.com", "Notification of Negative Review", html);
        }
    }


    private async findUsersByType(userType){
        let users = null;
        try {
            users = await this.user.find({ userType: userType });
            console.log("findUsersByType was successful.")
        } catch (e) {
            console.error('findUsersByTpe failed.', e);
        }
        return users;
    }

    private async sendEmail(recipients, subject, message){
        let email = {
            from: 'noreply.mytechie.pro@gmail.com',
            to: recipients,
            subject: subject,
            html: message
        }
        emailtransporter.sendMail(email, function(error, info) {
            if (error){
                console.log(error);
                
            } else {
                console.log("Poor review notification sent to admins.");
            }
        })
    }


    private sendResetPwEmail = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        
        console.log('\nReset email function called');
        const { emailAddress } = request.body;
        const user = await this.user.findOne({ email: emailAddress });


        if (!user){
            console.log('No user account is associated with the specified email');
            response.status(200);
            return;
        }
        
        let setPwEmailOptions  = {
            from: 'noreply.mytechie.pro@gmail.com', // sender address
            to: emailAddress, // list of receivers
            subject: "Reset Password", // Subject line
            html: "<b>Reset Password</b><br/><br/>" +
            `<p>Please click <a href="${this.CLIENT_URL}/resetPassword/${user._id}">here</a> to change password.</p> <br/>`
          }
        emailtransporter.sendMail(setPwEmailOptions , function(error, info){
        if (error) {
            console.log(error, "\n");
            response.status(500); // Error sending email - set status code
        } else {
            console.log(`Email recipient: ${emailAddress}`);
            console.log('Email successfully sent: ' + info.response);
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
