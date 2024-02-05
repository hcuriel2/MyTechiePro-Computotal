/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class serves as a ctonroller for handling user-related routes. It includes various route handlers
and middleware for managing users, such as getting users/pros/admins, reseting passwords, and approving users.
There is also an aspect of retrieving Professionals by skills and geo-location. This is used on the 
mytechie.pro domain.


Unused Code:
- adminMiddleware isn't used & is commented out
- getUserByID has a commented out line - unsure of its use
- getAllPostsOfUser is commented out


Clarification needed:



Changes:


*/

import { Router, Request, Response, NextFunction } from "express";
import NotAuthorizedException from "../../exceptions/NotAuthorizedException";
import Controller from "../../interfaces/controller.interface";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import authMiddleware from "../../middleware/auth.middleware";
import adminMiddleware from "../../middleware/admin.middleware";
import userModel from "../../models/user/user.model";
import UserNotFoundException from "../../exceptions/UserNotFoundException";
import ResetPasswordDto from "../authentication/resetPassword.dto";
import * as bcrypt from "bcryptjs";

class UserController implements Controller {
    public path = "/users";
    public router = Router();
    private user = userModel;
    public URL = "https://mytechie.pro/";

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
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
            .get(`${this.path}/verify/:id`, this.verifyUserEmail)
        // this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
    }

    // Handler for getting a user by ID
    private getUserById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const userQuery = this.user.findById(id);
        const user = await userQuery;
        // await user.populate('password').execPopulate();
        if (user) {
            response.send(user);
        } else {
            next(new UserNotFoundException(id));
        }
    };

    // Handler to get all users
    private getAllUsers = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const users = await this.user.find().populate("-password").exec();
        if (users) {
            response.send(users);
        } else {
            next(new UserNotFoundException("No"));
        }
    };

    // Handler to get all clients
    private getAllClients = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const users = await this.user.find({ userType: "Client" });

            if (users) {
                response.send(users);
            } else {
                next(new UserNotFoundException("No"));
            }
        } catch (e) {
            response.send(e);
        }
    };


    // Handler to get all admins
    private getAllAdmins = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const users = await this.user.find({ userType: "Admin" });

            if (users) {
                response.send(users);
            } else {
                next(new UserNotFoundException("No"));
            }
        } catch (e) {
            response.send(e);
        }
    };

    // Handler to get all professionals
    private getAllProfessionals = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const userQuery = this.user.find({ userType: "Professional" });
        const users = await userQuery;
        if (users) {
            response.send(users);
        } else {
            next(new UserNotFoundException("No"));
        }
    };


    // Handler to get all professionals - filltered by skill and location
    // OLD COMMENT (PREVIOUS TEAM): function for getting list of techies, filtered by SKILL as well as LOCATION
    private getAllProfessionalsBySkill = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        //given object with filtering requirements
        let givenUser = JSON.parse(request.params.skill)
        const skill = givenUser.skill;
        const userLat = givenUser.lat;
        const userLng = givenUser.lng;
        const rnge = givenUser.rnge;
        //get list of techies filtered by skill
        const userQuery = this.user.find({ userType: "Professional", approved: true, skills:{ $in: [skill]}});
        const users = await userQuery;
        let closeUsers = []
        //filter list of users by checking if they are within the given radius of the client.
        let R = 3958.8; // Radius of the Earth in miles
        let d: number;
        for(let i = 0; i < users.length; i++) {
            if (users[i].address["lat"]) {
                let userRadiansLat = userLat * (Math.PI/180);
                let techRadianLat = users[i].address["lat"] * (Math.PI/180);
                let latDiff = techRadianLat - userRadiansLat;
                let lngDiff = (users[i].address["lng"] - userLng) *  (Math.PI/180);
                d = 2 * R * Math.asin(Math.sqrt(Math.sin(latDiff/2)*Math.sin(latDiff/2)+Math.cos(userRadiansLat)*Math.cos(techRadianLat)*Math.sin(lngDiff/2)*Math.sin(lngDiff/2))); //in miles
                d = d * 1.609 //convert distance(miles) to km
                if (d < rnge ) { //rnge is the radius that is set by the user the default value is 10km
                    closeUsers.push(users[i]);
                } 
            }
        }
        if (closeUsers) { //originally just users
            // send back list of techies that are within the given radius.
            response.send(closeUsers);
        } else {
            next(new UserNotFoundException("No"));
        }
    };

    // Handler to reset password
    private resetPassword = async (request: Request, response: Response) => {
        const id = request.params.id;
        const data: ResetPasswordDto = request.body;
        if (data.password === data.confirmPassword) {
            const newPassword = await bcrypt.hash(data.password, 10);
            this.user.findByIdAndUpdate(
                id,
                { password: newPassword },
                function (err, result) {
                    if (err) {
                        response.send(err);
                    } else {
                        response.send(result);
                    }
                }
            );
        } else {
            response.send("The password is not matched.");
        }
    };

    // Handler to update the user's status
    private changeStatus = async (request: Request, response: Response) => {
        const id = request.params.id;
        const { proStatus } = request.body;
        try {
            const user = await this.user.findByIdAndUpdate(id, {
                proStatus: proStatus,
            });
        } catch (e) {
            response.send(e);
        }
    };

    // Handler for deleting a user
    private deleteUser = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const successResponse = await this.user.findByIdAndDelete(id);
        if (successResponse) {
            response.send(200);
        } else {
            next(new UserNotFoundException(id));
        }
    };


    // Handler to approve a new pro account
    // OLD COMMENT (PREVIOUS TEAM): approves the new Pro account
    private approveUser = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        this.user.findByIdAndUpdate(id, {approved: true}, function(err, result){
            if (err) {
                next(new UserNotFoundException(id));
            } else {
                response.send(result);
            }
                        
        })
    };

    // Handler to verify a new user's email
    private verifyUserEmail = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        this.user.findByIdAndUpdate(id, {verified: true}, function(err, result){
            if (err) {
                next(new UserNotFoundException(id));
            } else {
                response.send("Thank you. Your email address has been verified. <br/>" +
            `Please click <a href="${this.URL}">here</a> to login.`);
            }     
        })
    };


    //   private getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    //     const userId = request.params.id;
    //     if (userId === request.user._id.toString()) {
    //       const posts = await this.post.find({ author: userId });
    //       response.send(posts);
    //     }
    //     next(new NotAuthorizedException());
    //   }
}

export default UserController;
