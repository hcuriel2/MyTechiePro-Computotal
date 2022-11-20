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
const express_1 = require("express");
const user_model_1 = __importDefault(require("../../models/user/user.model"));
const UserNotFoundException_1 = __importDefault(require("../../exceptions/UserNotFoundException"));
const bcrypt = __importStar(require("bcryptjs"));
class UserController {
    constructor() {
        this.path = "/users";
        this.router = express_1.Router();
        this.user = user_model_1.default;
        this.URL = "https://mytechie.pro/";
        this.getUserById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const userQuery = this.user.findById(id);
            const user = yield userQuery;
            // await user.populate('password').execPopulate();
            if (user) {
                response.send(user);
            }
            else {
                next(new UserNotFoundException_1.default(id));
            }
        });
        this.getAllUsers = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const users = yield this.user.find().populate("-password").exec();
            if (users) {
                response.send(users);
            }
            else {
                next(new UserNotFoundException_1.default("No"));
            }
        });
        this.getAllClients = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.user.find({ userType: "Client" });
                if (users) {
                    response.send(users);
                }
                else {
                    next(new UserNotFoundException_1.default("No"));
                }
            }
            catch (e) {
                response.send(e);
            }
        });
        this.getAllAdmins = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.user.find({ userType: "Admin" });
                if (users) {
                    response.send(users);
                }
                else {
                    next(new UserNotFoundException_1.default("No"));
                }
            }
            catch (e) {
                response.send(e);
            }
        });
        this.getAllProfessionals = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userQuery = this.user.find({ userType: "Professional" });
            const users = yield userQuery;
            if (users) {
                response.send(users);
            }
            else {
                next(new UserNotFoundException_1.default("No"));
            }
        });
        // function for getting list of techies, filtered by SKILL as well as LOCATION
        this.getAllProfessionalsBySkill = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            //given object with filtering requirements
            let givenUser = JSON.parse(request.params.skill);
            const skill = givenUser.skill;
            const userLat = givenUser.lat;
            const userLng = givenUser.lng;
            const rnge = givenUser.rnge;
            //get list of techies filtered by skill
            const userQuery = this.user.find({ userType: "Professional", approved: true, skills: { $in: [skill] } });
            const users = yield userQuery;
            let closeUsers = [];
            //filter list of users by checking if they are within the given radius of the client.
            let R = 3958.8; // Radius of the Earth in miles
            let d;
            for (let i = 0; i < users.length; i++) {
                if (users[i].address["lat"]) {
                    let userRadiansLat = userLat * (Math.PI / 180);
                    let techRadianLat = users[i].address["lat"] * (Math.PI / 180);
                    let latDiff = techRadianLat - userRadiansLat;
                    let lngDiff = (users[i].address["lng"] - userLng) * (Math.PI / 180);
                    d = 2 * R * Math.asin(Math.sqrt(Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + Math.cos(userRadiansLat) * Math.cos(techRadianLat) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2))); //in miles
                    d = d * 1.609; //convert distance(miles) to km
                    if (d < rnge) { //rnge is the radius that is set by the user the default value is 10km
                        closeUsers.push(users[i]);
                    }
                }
            }
            if (closeUsers) { //originally just users
                // send back list of techies that are within the given radius.
                response.send(closeUsers);
            }
            else {
                next(new UserNotFoundException_1.default("No"));
            }
        });
        this.resetPassword = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const data = request.body;
            if (data.password === data.confirmPassword) {
                const newPassword = yield bcrypt.hash(data.password, 10);
                this.user.findByIdAndUpdate(id, { password: newPassword }, function (err, result) {
                    if (err) {
                        response.send(err);
                    }
                    else {
                        response.send(result);
                    }
                });
            }
            else {
                response.send("The password is not matched.");
            }
        });
        this.changeStatus = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const { proStatus } = request.body;
            try {
                const user = yield this.user.findByIdAndUpdate(id, {
                    proStatus: proStatus,
                });
            }
            catch (e) {
                response.send(e);
            }
        });
        this.deleteUser = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const successResponse = yield this.user.findByIdAndDelete(id);
            if (successResponse) {
                response.send(200);
            }
            else {
                next(new UserNotFoundException_1.default(id));
            }
        });
        // approves the new Pro account
        this.approveUser = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            this.user.findByIdAndUpdate(id, { approved: true }, function (err, result) {
                if (err) {
                    next(new UserNotFoundException_1.default(id));
                }
                else {
                    response.send(result);
                }
            });
        });
        // verify new accounts email address
        this.verifyUserEmail = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            this.user.findByIdAndUpdate(id, { verified: true }, function (err, result) {
                if (err) {
                    next(new UserNotFoundException_1.default(id));
                }
                else {
                    response.send("Thank you. Your email address has been verified. <br/>" +
                        `Please click <a href="${this.URL}">here</a> to login.`);
                }
            });
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        // reset password
        this.router.put(`${this.path}/reset/:id`, this.resetPassword);
        this.router
            // //auth version
            // .all(`${this.path}/*`, adminMiddleware)
            .all(`${this.path}/*`)
            // only admin can see the all users
            .get(`${this.path}`, this.getAllUsers)
            // only admin can see the all clients
            .get(`${this.path}/clients`, this.getAllClients)
            // only admin can see the all professionals
            .get(`${this.path}/professionals`, this.getAllProfessionals)
            // only admin can see the all admins
            .get(`${this.path}/admins`, this.getAllAdmins)
            .get(`${this.path}/professionals/:skill`, this.getAllProfessionalsBySkill)
            // get user by id
            .get(`${this.path}/:id`, this.getUserById)
            .patch(`${this.path}/:id`, this.changeStatus)
            .delete(`${this.path}/:id`, this.deleteUser)
            .put(`${this.path}/approve/:id`, this.approveUser)
            .get(`${this.path}/verify/:id`, this.verifyUserEmail);
        // this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map