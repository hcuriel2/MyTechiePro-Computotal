import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import UserWithThatEmailAlreadyExistsException from "../../exceptions/UserWithThatEmailAlreadyExistsException";
import * as crypto from "crypto";
import DataStoredInToken from "../../interfaces/dataStoredInToken";
import TokenData from "../../interfaces/tokenData.interface";
import CreateUserDto from "../user/user.dto";
import User from "../../models/user/user.interface";
import userModel from "../../models/user/user.model";
import sendEmail from '../../middleware/sendgrid.middleware';

class AuthenticationService {
    public user = userModel;
    public API_URL = process.env.SERVER_URL;
    public CLIENT_URL = process.env.CLIENT_URL;

    // Generates a HttpOnly cookie on successful User registration
    // JWT token is inserted into it
    // Applies the 1 hour expiration from the token
    public createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${tokenData.expiresIn}`;
    }

    // Creates a JWT token
    // 1 hour expiration
    public createToken(user: User): TokenData {
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

    // Registers a new User
    // Checks if the email already exists
    // Hashes password
    // Sends verification email - if pro's sign up, it notifies admin
    public async register(userData: CreateUserDto) {
        if (await this.user.findOne({ email: userData.email })) {
            throw new UserWithThatEmailAlreadyExistsException(userData.email);
        }

        // Generate a verification token and session id
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const sessionId = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        //create the user in database with given user object.
        const user = await this.user.create({
            ...userData,
            password: hashedPassword,
            ratingSum: 0,
            ratingCount: 0,
            rating: 0,
            verified: false,
            verificationToken: verificationToken,
            verificationSessionId: sessionId,
        });

        // Send verification email
        const verificationUrl = `${this.CLIENT_URL}/verify-email?token=${verificationToken}&session=${sessionId}`;

        const verifyEmailHtml = `
            <h2>Welcome to MyTechie!</h2>
            <p>Please click the link below to verify your email address:</p>
            <p><a href="${verificationUrl}">Verify Email</a></p>
        `;

        try {
            await sendEmail(
                user.email,
                "Verify Your Email Address",
                verifyEmailHtml
            );
    
            // If the User is a Professional, an email is sent to all Admin
            // Admin need to approve new Professional users
            if (user.userType === "Professional") {
                const admins = await this.user.find({ userType: "Admin" });
                if (admins && admins.length > 0) {
                    const adminEmails = admins.map((admin) => admin.email);
                    const adminNotificationHtml = 
                        "<b>New professional registered account needs to be verified: </b><br/><br/>" +
                        "<b>First Name:</b> " + user.firstName + "<br/>" +
                        "<b>Last Name:</b> " + user.lastName + "<br/>" +
                        "<b>Phone Number:</b> " + user.phoneNumber + "<br/>" +
                        "<b>Email:</b> " + user.email + "<br/>" +
                        "<b>Company:</b> " + user.company;
                    
                    await sendEmail(
                        adminEmails,
                        "Verification for new a professional account",
                        adminNotificationHtml
                    );
                }
            }
        } catch (error) {
            console.error("Error sending verification email:", error);
        }

        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);

        return { 
            cookie,
            user 
        };
    }
}

export default AuthenticationService;
