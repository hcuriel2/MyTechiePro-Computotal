import * as bcrypt from "bcryptjs";
import { Request, Response, NextFunction, Router } from "express";
import * as jwt from "jsonwebtoken";
import WrongCredentialsException from "../../exceptions/WrongCredentialsException";
import HttpException from "../../exceptions/HttpException";
import Controller from "../../interfaces/controller.interface";
import DataStoredInToken from "../../interfaces/dataStoredInToken";
import TokenData from "../../interfaces/tokenData.interface";
import validationMiddleware from "../../middleware/validation.middleware";
import adminMiddleware from "../../middleware/admin.middleware";
import { adminRoleMiddleware } from "../../middleware/admin.middleware";
import CreateUserDto from "../user/user.dto";
import CreateAddressDto from "../user/address.dto";
import User from "../../models/user/user.interface";
import userModel from "../../models/user/user.model";
import AuthenticationService from "./authentication.service";
import PasswordResetService from "./password-reset.service";
import AuthMiddleware from "../../middleware/auth.middleware";
import LogInDto from "./logIn.dto";
import qrcode from "qrcode";
import {
    buildOtpAuthUrl,
    generateMfaSecret,
    verifyTotp,
} from "./mfa.util";
import userController from "../user/user.controller";
import MfaVerificationInvalidException from "../../exceptions/MfaVerificationInvalidException";
import sendEmail from '../../middleware/sendgrid.middleware';
import UserNotVerify from "../../exceptions/UserNotVerify";
import authMiddleware from "../../middleware/auth.middleware";
import * as crypto from "crypto";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import AuthenticationTokenMissingException from "../../exceptions/AuthenticationTokenMissingException";
import { validate, ValidationError } from "class-validator";
import NotAuthorizedException from "../../exceptions/NotAuthorizedException";

import { signupGuard } from '../../signup/signup.middleware';

class AuthenticationController implements Controller {
    public path = "/auth";
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
        this.router.post(
            `${this.path}/admin/register`,
            adminMiddleware,
            adminRoleMiddleware("Admin"),
            validationMiddleware(CreateUserDto),
            this.adminRegistration
        );
        this.router.get(
            `${this.path}/checkSession`,
            authMiddleware,
            this.checkSession
        );
        this.router.post(
            `${this.path}/login`,
            validationMiddleware(LogInDto),
            this.loggingIn
        );
        // MFA setup routes require an existing authenticated session. Setup creates a
        // pending key, confirm activates it after a valid code, and disable removes it
        // after a password check. Reset follows setup, so the current key stays active
        // until the replacement key is confirmed.
        this.router.post(`${this.path}/mfa/setup`, authMiddleware, this.setupMfa);
        this.router.post(`${this.path}/mfa/confirm`, authMiddleware, this.confirmMfa);
        this.router.post(`${this.path}/mfa/disable`, authMiddleware, this.disableMfa);
        this.router.post(`${this.path}/logout`, this.loggingOut);
        this.router.post(
            `${this.path}/professional/register`,
            signupGuard(),
            validationMiddleware(CreateUserDto),
            this.registration
        );
        this.router.post(
            `${this.path}/register`,
            signupGuard(),
            validationMiddleware(CreateUserDto),
            this.registration
        );
        this.router.post(`${this.path}/resetPassword`, this.sendResetPwEmail);
        this.router.patch(
            `${this.path}/settings/:id`,
            authMiddleware,
            this.updateUserSettings
        );
        this.router.get(
            `${this.path}/checkSession`,
            authMiddleware,
            this.checkSession
        );
        this.router.get(
            `${this.path}/getUserInfo`,
            authMiddleware,
            this.getUserInfo
        );
        this.router.get(`${this.path}/check-verification`, this.checkVerification);
        this.router.post(`${this.path}/confirm-verification`, this.confirmVerification);
        this.router.post(
            `${this.path}/resend-verification`,
            this.resendVerificationEmail
        );
    }

    public getUserInfo = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const user = request.user;
        if (!user) {
            // If there's no user, send a 401 Unauthorized response.
            return response.status(401).json({
                message: "Unauthorized: No user information available.",
            });
        }

        try {
            response.json(this.toPublicUser(user));
        } catch (error) {
            console.error("Failed to fetch user information:", error);
            response.status(500).json({
                message:
                    "Internal server error while fetching user information.",
            });
        }
    };

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
            userType: user.userType,
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
            return next(
                new Error("User information is missing from the request")
            );
        }

        try {
            response.json(this.toPublicUser(user));
        } catch (error) {
            next(new Error("Check session response failed"));
        }
    };

    // What we actually send back to the browser after login or a session check.
    // The password hash and the authenticator secret stay on the server.
    // mfaEnabled is just a yes/no so the settings page knows whether to show "on" or "off".
    private toPublicUser(user: any) {
        const source =
            typeof user.toObject === "function" ? user.toObject() : { ...user };
        // Read the secret before we delete it from the copy we're about to send.
        const mfaEnabled = Boolean(
            typeof user.get === "function" ? user.get("secret") : source.secret
        );
        delete source.password;
        delete source.secret;
        delete source.tempSecret;
        delete source.verificationToken;
        delete source.verificationSessionId;
        source.mfaEnabled = mfaEnabled;
        return source;
    }

    // Logs the User in.
    // Same email and password check as before.
    // If this account never turned on an authenticator, we issue the cookie right here.
    // If they did, we wait for a valid 6-digit code before the cookie goes out.
    private loggingIn = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ email: logInData.email });

        if (!user) {
            next(new WrongCredentialsException());
            return;
        }
        if (!user.verified) {
            next(new UserNotVerify());
            return;
        }
        const isPasswordMatching = await bcrypt.compare(
            logInData.password,
            user.get("password", null, { getters: false })
        );
        if (!isPasswordMatching) {
            next(new WrongCredentialsException());
            return;
        }

        // Only the confirmed secret enables the second sign-in step. tempSecret is
        // intentionally ignored so an unfinished enrollment cannot lock out the user.
        const sec = user.get("secret");
        if (sec) {
            const token = (logInData.secret || "").replace(/\s/g, "");
            // Password was right, but they haven't typed a code yet.
            // Tell the sign-in dialog to slide the code box out. Don't set a cookie yet.
            if (!token) {
                response.status(200).json({ mfaRequired: true });
                return;
            }
            // Wrong or expired code. 401 is separate from a bad password (that's 400)
            // so the dialog can stay on the code step instead of saying the password was wrong.
            if (!verifyTotp(sec, token)) {
                next(new MfaVerificationInvalidException());
                return;
            }
        }

        const tokenData = this.createToken(user);
        response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
        response.send(this.toPublicUser(user));
    };

    // Starts authenticator setup, or a reset if they already have one.
    // The new secret is saved as tempSecret only. Login still uses the old secret
    // until they prove the new QR code works, so a half-finished reset doesn't lock them out.
    // This response is the one place the secret is shown. They need it for the QR / manual key.
    private setupMfa = async (request: RequestWithUser, response: Response) => {
        const user = await this.user.findById(request.user._id);
        if (!user) {
            return response.status(401).json({ message: "Unauthorized" });
        }

        try {
            const secret = generateMfaSecret();
            const otpauthUrl = buildOtpAuthUrl(user.email, secret);
            // The phone app scans this image. The link inside it is the otpauth url above.
            const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

            // Update only the pending MFA field. Saving the whole user document here
            // re-runs validation for unrelated profile fields and can fail for older
            // accounts whose data predates the current schema requirements.
            await this.user.updateOne(
                { _id: user._id },
                { $set: { tempSecret: secret } }
            );

            return response.status(200).json({
                otpauthUrl,
                secret,
                qrDataUrl,
            });
        } catch (error) {
            console.error("MFA setup failed:", error);
            return response.status(500).json({
                message: "Could not start authenticator setup.",
            });
        }
    };

    // The user typed the code their app is showing for the QR we just gave them.
    // If it matches tempSecret, that secret becomes the real one and MFA is actually on.
    private confirmMfa = async (request: RequestWithUser, response: Response) => {
        // Reject malformed input before querying the account or checking the TOTP.
        const code = ((request.body && request.body.token) || "").replace(/\s/g, "");
        if (!/^\d{6}$/.test(code)) {
            return response.status(400).json({
                message: "Enter the 6-digit code from your authenticator app.",
            });
        }

        const user = await this.user.findById(request.user._id);
        if (!user || !user.get("tempSecret")) {
            return response.status(400).json({
                message: "Start setup again to get a new QR code.",
            });
        }

        // Verify against the pending key, never the currently active key. A reset only
        // replaces the old authenticator after the new key proves it can generate codes.
        const pending = user.get("tempSecret");
        if (!verifyTotp(pending, code)) {
            return response.status(401).json({
                message: "That code is incorrect or expired. Try the current code.",
            });
        }

        // Move the pending secret over and drop tempSecret so a later confirm can't reuse it.
        await this.user.findByIdAndUpdate(user._id, {
            $set: { secret: pending },
            $unset: { tempSecret: 1 },
        });
        return response.status(200).json({ mfaEnabled: true });
    };

    // Turns the authenticator off for the signed-in account.
    private disableMfa = async (request: RequestWithUser, response: Response) => {
        const user = await this.user.findById(request.user._id);
        if (!user) {
            return response.status(401).json({ message: "Unauthorized" });
        }

        await this.user.findByIdAndUpdate(user._id, {
            $unset: { secret: 1, tempSecret: 1 },
        });
        return response.status(200).json({ mfaEnabled: false });
    };

    // Logs the User out
    // Sets the HttpOnly cookie to an expired state
    private loggingOut = (request: Request, response: Response) => {
        try {
            // Clear the Authorization cookie
            response.setHeader("Set-Cookie", [
                "Authorization=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None",
                "user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None",
            ]);

            response.sendStatus(200);
        } catch (error) {
            console.error("Logout error:", error);
            response.sendStatus(500);
        }
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

        if (userData.userType === "Admin") {
            return next(new NotAuthorizedException());
        }

        try {
            const { user } = await this.authenticationService.register(
                userData
            );
            response.status(201).send(user);
        } catch (error) {
            next(error);
        }
    };

    private adminRegistration = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const userData: CreateUserDto = request.body;

        if (userData.userType !== "Admin") {
            return response.status(400).json({
                message: "Admin registration requires userType Admin.",
            });
        }

        try {
            const { user } = await this.authenticationService.register(
                userData
            );
            response.status(201).send(user);
        } catch (error) {
            if (error instanceof HttpException) {
                return response.status(error.status).json({ message: error.message });
            }
            next(error);
        }
    };

    private verifyEmail = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { token } = request.params;

        try {
            const user = await this.user.findOne({ 
                verificationToken: token,
                verificationTokenUsed: { $ne: true } 
            });

            if (!user) {
                return response
                    .status(400)
                    .send("Invalid or expired verification token");
            }

            // Update user as verified
            user.verified = true;
            user.verificationTokenUsed = true; 
            user.verificationToken = crypto.randomBytes(32).toString("hex");
            await user.save();
            // Create authentication token and cookie
            const tokenData = this.createToken(user);
            const cookie = this.createCookie(tokenData);
            // Set the cookie and redirect to home or dashboard
            response.setHeader("Set-Cookie", [cookie]);
            return response.status(200).json({
                success: true,
                message: "Email verified successfully",
                user: this.toPublicUser(user),
            });
        } catch (error) {
            console.error("Verification error:", error);
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
        // A uniform response avoids disclosing account existence or mail failures.
        response.setHeader('Cache-Control', 'no-store');
        try {
            await new PasswordResetService().requestReset(request.body && request.body.emailAddress);
        } catch (_) {
            // Do not expose recovery credentials, user records, or provider errors.
        }
        response.status(200).json({ message: 'If the account exists, a reset link has been sent.' });
    };

    // Updates User's information in the frontend '/settings' route
    // Modifies existing information in the database
    private updateUserSettings = async (
        request: RequestWithUser,
        response: Response
    ) => {
        const userId = request.user._id;

        const {
            firstName,
            lastName,
            email,
            street,
            city,
            country,
            postalCode,
        } = request.body;

        try {
            let user = await this.user.findById(userId);

            if (!user) {
                return response.status(404).json({ message: "User not found" });
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

            return response.status(200).json({ message: "Update successful" });
        } catch (error) {
            console.error("Error updating user:", error);
            return response.status(500).json({
                message: "Failed to update user",
                error: error.message,
            });
        }
    };

    private resendVerificationEmail = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { email } = request.body;

        try {
            const user = await this.user.findOne({ email });

            if (!user) {
                // Don't reveal user existence for security
                return response.status(200).send({
                    message:
                        "If your email exists, a verification link has been sent.",
                });
            }

            if (user.verified) {
                return response
                    .status(200)
                    .send({ message: "Email already verified. Please login." });
            }

            // Generate new verification token
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const sessionId = crypto.randomBytes(16).toString("hex");
            user.verificationToken = verificationToken;
            user.verificationSessionId = sessionId;
            await user.save();

            // Send verification email
            const verificationUrl = `${this.CLIENT_URL}/verify-email?token=${verificationToken}&session=${sessionId}`;
            const verifyEmailHtml = `
                <h2>Welcome to MyTechie!</h2>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="${verificationUrl}">Verify Email</a></p>
            `;

            await sendEmail(
                user.email,
                "Verify Your Email Address",
                verifyEmailHtml
            );
    
            return response.status(200).send({
                message: "Verification email sent. Please check your inbox.",
            });
        } catch (error) {
            console.error("Error resending verification email:", error);
            next(error);
        }
    };
    
    private checkVerification = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const token = request.query.token as string;
        const session = request.query.session as string;
        
        if (!token || !session) {
            return response.status(400).send("Missing verification parameters");
        }
        
        try {
            const user = await this.user.findOne({ 
                verificationToken: token,
                verificationSessionId: session
            });
            
            if (!user) {
                return response.status(400).json({ 
                    message: "Invalid or expired verification link" 
                });
            }
            
            return response.status(200).json({ 
                isVerified: user.verified,
                email: user.email
            });
        } catch (error) {
            next(error);
        }
    };

    private confirmVerification = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const { token, session } = request.body;
        
        if (!token || !session) {
            return response.status(400).send("Missing verification parameters");
        }
        
        try {
            const user = await this.user.findOne({ 
                verificationToken: token,
                verificationSessionId: session,
                verified: false 
            });
            
            if (!user) {
                return response.status(400).json({ 
                    message: "Invalid or expired verification link" 
                });
            }
            
            user.verified = true;
            user.verificationToken = crypto.randomBytes(32).toString("hex");
            user.verificationTokenUsed = true;
            await user.save();
            
            const tokenData = this.createToken(user);
            const cookie = this.createCookie(tokenData);
            
            response.setHeader("Set-Cookie", [cookie]);
            return response.status(200).json({
                success: true,
                message: "Email verified successfully",
                user: this.toPublicUser(user),
            });
        } catch (error) {
            console.error("Verification confirmation error:", error);
            next(error);
        }
    };
}

export default AuthenticationController;
