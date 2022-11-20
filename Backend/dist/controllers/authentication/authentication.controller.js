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
const express_1 = require("express");
const jwt = __importStar(require("jsonwebtoken"));
const WrongCredentialsException_1 = __importDefault(require("../../exceptions/WrongCredentialsException"));
const validation_middleware_1 = __importDefault(require("../../middleware/validation.middleware"));
const admin_middleware_1 = __importDefault(require("../../middleware/admin.middleware"));
const user_dto_1 = __importDefault(require("../user/user.dto"));
const user_model_1 = __importDefault(require("../../models/user/user.model"));
const authentication_service_1 = __importDefault(require("./authentication.service"));
const logIn_dto_1 = __importDefault(require("./logIn.dto"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const MfaVerificationInvalidException_1 = __importDefault(require("../../exceptions/MfaVerificationInvalidException"));
const emailtransporter_middleware_1 = __importDefault(require("../../middleware/emailtransporter.middleware"));
const UserNotVerify_1 = __importDefault(require("../../exceptions/UserNotVerify"));
class AuthenticationController {
    constructor() {
        this.path = "/auth";
        this.router = express_1.Router();
        this.authenticationService = new authentication_service_1.default();
        this.user = user_model_1.default;
        this.URL = "https://mytechie.pro";
        this.sendResetPwEmail = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const emailAddress = request.params.emailAddress;
            const user = yield this.user.findOne({ email: emailAddress });
            let setPwEmailOptions = {
                from: 'noreplytechie@gmail.com',
                to: emailAddress,
                subject: "Reset Password",
                html: "<b>Reset Password</b><br/><br/>" +
                    `<p>Please click <a href="${this.URL}/resetPassword/${user._id}">here</a> to change password.</p> <br/>`
            };
            emailtransporter_middleware_1.default.sendMail(setPwEmailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });
        });
        this.registration = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = request.body;
            console.log(userData);
            try {
                const { cookie, user } = yield this.authenticationService.register(userData);
                response.setHeader("Set-Cookie", [cookie]);
                response.send(user);
            }
            catch (error) {
                next(error);
            }
        });
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
        this.resetMfa = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.body;
            yield this.user.findByIdAndUpdate(id, {
                secret: '',
                tempSecret: ''
            });
            return response.sendStatus(200);
        });
        this.verifyMfa = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { id, token } = request.body;
            let user = yield this.user.findById(id);
            let sec = user.get("tempSecret");
            if (!sec) {
                next(new MfaVerificationInvalidException_1.default());
            }
            let isVerified = speakeasy_1.default.totp.verify({
                secret: sec,
                encoding: 'base32',
                token: token
            });
            if (isVerified) {
                yield this.user.findByIdAndUpdate(id, {
                    secret: sec,
                    tempSecret: ''
                });
                return response.sendStatus(200);
            }
            else {
                next(new MfaVerificationInvalidException_1.default());
            }
        });
        this.setupMfa = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { id, email } = request.body;
            const ISSUER = 'Computotal';
            const secret = speakeasy_1.default.generateSecret({
                length: 10,
                name: email,
                issuer: ISSUER
            });
            var url = speakeasy_1.default.otpauthURL({
                secret: secret.base32,
                label: email,
                issuer: ISSUER,
                encoding: 'base32'
            });
            try {
                yield this.user.findByIdAndUpdate(id, {
                    secret: '',
                    tempSecret: secret.base32
                });
                qrcode_1.default.toDataURL(url, (err, dataURL) => {
                    return response.json({
                        secret: secret.base32,
                        dataURL,
                        issuer: ISSUER
                    });
                });
            }
            catch (e) {
                next(e);
            }
        });
        this.loggingIn = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const logInData = request.body;
            const user = yield this.user.findOne({ email: logInData.email });
            if (user) {
                const sec = user.get("secret");
                const isPasswordMatching = yield bcrypt.compare(logInData.password, user.get("password", null, { getters: false }));
                if (!user.verified) {
                    next(new UserNotVerify_1.default());
                }
                if (isPasswordMatching) {
                    if (sec) {
                        if (!logInData.secret) {
                            next(new MfaVerificationInvalidException_1.default());
                        }
                        const isMfaVerified = speakeasy_1.default.totp.verify({
                            secret: sec,
                            encoding: "base32",
                            token: logInData.secret
                        });
                        if (!isMfaVerified) {
                            next(new MfaVerificationInvalidException_1.default());
                            return;
                        }
                    }
                    ;
                    const tokenData = this.createToken(user);
                    response.setHeader("Set-Cookie", [
                        this.createCookie(tokenData),
                    ]);
                    response.send(user);
                }
                else {
                    next(new WrongCredentialsException_1.default());
                }
            }
            else {
                next(new WrongCredentialsException_1.default());
            }
        });
        this.loggingOut = (request, response) => {
            response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
            response.send(200);
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/register`, validation_middleware_1.default(user_dto_1.default), this.registration);
        this.router.post(`${this.path}/admin/register`, admin_middleware_1.default, validation_middleware_1.default(user_dto_1.default), this.registration);
        this.router.post(`${this.path}/resetMfa`, this.resetMfa);
        this.router.post(`${this.path}/setupMfa`, this.setupMfa);
        this.router.post(`${this.path}/verifyMfa`, this.verifyMfa);
        // this.router.post(
        //     `${this.path}/professional/register`,
        //     validationMiddleware(CreateUserDto),
        //     this.registration
        // );
        this.router.post(`${this.path}/login`, validation_middleware_1.default(logIn_dto_1.default), this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
        this.router.get(`${this.path}/resetPassword/:emailAddress`, this.sendResetPwEmail);
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
exports.default = AuthenticationController;
//# sourceMappingURL=authentication.controller.js.map