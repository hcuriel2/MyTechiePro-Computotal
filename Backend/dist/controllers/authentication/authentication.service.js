"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const UserWithThatEmailAlreadyExistsException_1 = __importDefault(require("../../exceptions/UserWithThatEmailAlreadyExistsException"));
const user_model_1 = __importDefault(require("../../models/user/user.model"));
const emailtransporter_middleware_1 = __importDefault(require("../../middleware/emailtransporter.middleware"));
class AuthenticationService {
    constructor() {
        this.user = user_model_1.default;
        this.API_URL = "https://api.mytechie.pro";
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.user.findOne({ email: userData.email })) {
                throw new UserWithThatEmailAlreadyExistsException_1.default(userData.email);
            }
            const hashedPassword = yield bcrypt.hash(userData.password, 10);
            console.log("BACKEND CHECK FOR IF THE BACKEND HAS RECIEVED USER OBJECT WITH lat and long ");
            console.log(userData);
            //create the user in database with given user object.
            const user = yield this.user.create(Object.assign(Object.assign({}, userData), { password: hashedPassword, ratingSum: 0, ratingCount: 0, rating: 0 }));
            //send email verification
            let verifyEmailOptions = {
                from: 'noreplytechie@gmail.com',
                to: user.email,
                subject: "Verification of email address",
                html: "<b>Verify your email</b><br/><br/>" +
                    `<p>Please click <a href="${this.API_URL}/users/verify/${user._id}">here</a> to verify your email.</p> <br/>`
            };
            emailtransporter_middleware_1.default.sendMail(verifyEmailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });
            if (user.userType === "Professional") {
                // Send email to Admin for new Professional account verification
                const admins = yield this.user.find({ userType: "Admin" });
                if (admins) {
                    const adminEmails = admins.map((admin) => admin.email);
                    let mailOptions = {
                        from: 'noreplytechie@gmail.com',
                        to: adminEmails,
                        subject: "Verification for new a professional account",
                        html: "<b>New professional registered account needs to be verified: </b><br/><br/>" +
                            "<b>First Name:</b> " + user.firstName + "<br/>" +
                            "<b>Last Name:</b> " + user.lastName + "<br/>" +
                            "<b>Phone Number:</b> " + user.phoneNumber + "<br/>" +
                            "<b>Email:</b> " + user.email + "<br/>" +
                            "<b>Company:</b> " + user.company,
                    };
                    emailtransporter_middleware_1.default.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                        else {
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
        });
    }
    createCookie(tokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
    createToken(user) {
        const expiresIn = 60 * 60; // an hour
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken = {
            _id: user._id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }
}
exports.default = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map