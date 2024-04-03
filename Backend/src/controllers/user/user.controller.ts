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
        this.router.get(`${this.path}/profile/:id`, this.getProUserProfile);
        this.router
            // //auth version
            // .all(`${this.path}/*`, adminMiddleware)

            .all(`${this.path}/*`)
            // only admin can see the all users
            .get(`${this.path}`, this.getAllUsers)
            // only admin can see the all clients
            .get(`${this.path}/clients`, this.getAllClients)

            .get(`${this.path}/professionals/:skill`, this.getAllProfessionalsBySkill)
            // only admin can see the all professionals
            .get(`${this.path}/professionals`, this.getAllProfessionals)

            // only admin can see the all admins
            .get(`${this.path}/admins`, this.getAllAdmins)


            // get user by id
            .get(`${this.path}/:id`, this.getUserById)
            .patch(`${this.path}/:id`, this.changeStatus)
            .delete(`${this.path}/:id`, this.deleteUser)
            .put(`${this.path}/approve/:id`, this.approveUser)
            .get(`${this.path}/verify/:id`, this.verifyUserEmail)
        // this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
    }


    // endpoint to fetch Pro User info
    private getProUserProfile = async (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        try {
            const user = await this.user.findById(id, 'firstName lastName email address skills').populate('skills');
            if (!user) {
                next(new UserNotFoundException(id));
            } else {
                response.json(user);
            }
        } catch (error) {
            next(error);
        }
    };

    private getUserById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const userQuery = this.user.findById(id);
        const user = await userQuery;
        if (user) {
            response.send(user);
        } else {
            next(new UserNotFoundException(id));
        }
    };

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

    // function for getting list of techies, filtered by SKILL as well as LOCATION
    private getAllProfessionalsBySkill = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        //given object with filtering requirements
        console.log(`Received filter string: ${request.params.skill}`);

        let givenUser = JSON.parse(request.params.skill)
        console.log(givenUser);
        const skill = givenUser.skill;
        const userLat = givenUser.lat;
        const userLng = givenUser.lng;
        const rnge = givenUser.rnge;
        //get list of techies filtered by skill
        const userQuery = this.user.find({ userType: "Professional", approved: true, skills:{ $in: [skill]}});
        const users = await userQuery;
        console.log(`Fetched ${users.length} professionals with skill: ${skill}`);
        let closeUsers = []
        //filter list of users by checking if they are within the given radius of the client.
        let R = 6371; // Radius of the Earth in kilometers
let d: number;
for (let i = 0; i < users.length; i++) {
    if (users[i].address["lat"]) {
        let userRadiansLat = userLat * (Math.PI / 180);
        let techRadianLat = users[i].address["lat"] * (Math.PI / 180);
        let latDiff = techRadianLat - userRadiansLat;
        let lngDiff = (users[i].address["lng"] - userLng) * (Math.PI / 180);
        d = 2 * R * Math.asin(Math.sqrt(Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + Math.cos(userRadiansLat) * Math.cos(techRadianLat) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2)));
        console.log(`Distance to ${users[i].firstName}: ${d} km`);
        // No need to convert d to kilometers because it's already in kilometers
        console.log(`Calculating distance to ${users[i].firstName} with lat: ${users[i].address.lat}, lng: ${users[i].address.lng}`);
        if (d < rnge) { // rnge is the radius that is set by the user. The default value is assumed to be in kilometers.
            console.log(`Adding ${users[i].firstName} to close users.`);
            closeUsers.push(users[i]);
        } else {
            console.log(`Excluding ${users[i].firstName}. Distance: ${d} km, Range: ${rnge} km`);
        }
    }
}
console.log(`Found ${closeUsers.length} professionals within range.`);


        if (closeUsers) { //originally just users
            // send back list of techies that are within the given radius.
            response.send(closeUsers);
        } else {
            next(new UserNotFoundException("No"));
        }
    };

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


    // approves the new Pro account
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

    // verify new accounts email address
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
