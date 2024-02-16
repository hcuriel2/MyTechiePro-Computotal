import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import UserWithThatEmailAlreadyExistsException from "../../exceptions/UserWithThatEmailAlreadyExistsException";
import DataStoredInToken from "../../interfaces/dataStoredInToken";
import TokenData from "../../interfaces/tokenData.interface";
import CreateUserDto from "../user/user.dto";
import User from "../../models/user/user.interface";
import userModel from "../../models/user/user.model";
import emailtransporter from "../../middleware/emailtransporter.middleware";

class AuthenticationService {
    public user = userModel;
    public API_URL = "http://localhost:3333";

    public async register(userData: CreateUserDto) {
        if (await this.user.findOne({ email: userData.email })) {
            throw new UserWithThatEmailAlreadyExistsException(userData.email);
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        console.log("BACKEND CHECK FOR IF THE BACKEND HAS RECIEVED USER OBJECT WITH lat and long ");
        console.log(userData)
        //create the user in database with given user object.
        const user = await this.user.create({
            ...userData,
            password: hashedPassword,
            ratingSum: 0,
            ratingCount: 0,
            rating: 0
        });
        //send email verification
        let verifyEmailOptions  = {
                from: 'noreplytechie@gmail.com', // sender address
                to: user.email, // list of receivers
                subject: "Verification of email address", // Subject line
                html: "<b>Verify your email</b><br/><br/>" +
                `<p>Please click <a href="${this.API_URL}/users/verify/${user._id}">here</a> to verify your email.</p> <br/>`
              }
        emailtransporter.sendMail(verifyEmailOptions , function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
            });
    
        if(user.userType === "Professional") {
            // Send email to Admin for new Professional account verification
            const admins = await this.user.find({ userType: "Admin" });
            if(admins) {
                const adminEmails = admins.map((admin) => admin.email)
                let mailOptions  = {
                    from: 'noreplytechie@gmail.com', // sender address
                    to: adminEmails, // list of receivers - adminEmails
                    subject: "Verification for new a professional account", // Subject line
                    html: "<b>New professional registered account needs to be verified: </b><br/><br/>" +
                    "<b>First Name:</b> " + user.firstName + "<br/>" +
                    "<b>Last Name:</b> " + user.lastName + "<br/>"+
                    "<b>Phone Number:</b> " + user.phoneNumber + "<br/>"+ 
                    "<b>Email:</b> " + user.email + "<br/>"+ 
                    "<b>Company:</b> " + user.company, // html body
                  }
                emailtransporter.sendMail(mailOptions , function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                }
            }
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);

        return {
            cookie,
            user,
        };
        
    }

    public createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    public createToken(user: User): TokenData {
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

export default AuthenticationService;
