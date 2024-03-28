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
        
        
        //User routes - No authentication needed 
        this.router.put(`${this.path}/reset/:id`, this.resetPassword);
        this.router.get(`${this.path}/verify/:id`, this.verifyUserEmail);
        this.router.get(`${this.path}/professionals/:skill`, this.getAllProfessionalsBySkill);
        this.router.get(`${this.path}/professionals`, this.getAllProfessionals)
        this.router.delete(`${this.path}/:id`, this.deleteUser)

        //Admin routes - Admin authentication needed (only admins can access these)
        this.router.get(`${this.path}`, adminMiddleware, this.getAllUsers)
        this.router.get(`${this.path}/clients`, adminMiddleware, this.getAllClients)
        this.router.get(`${this.path}/admins`, adminMiddleware, this.getAllAdmins)
        this.router.put(`${this.path}/approve/:id`, adminMiddleware, this.approveUser)
        this.router.get(`${this.path}/:id`, adminMiddleware, this.getUserById)
        this.router.patch(`${this.path}/:id`, adminMiddleware, this.changeStatus)

        

        /*

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
            // only admin can see the all professionals
            .get(`${this.path}/professionals`, this.getAllProfessionals)

            // only admin can see the all admins
            .get(`${this.path}/admins`, this.getAllAdmins)

            .get(`${this.path}/professionals/:skill`, this.getAllProfessionalsBySkill)
            // get user by id
            .get(`${this.path}/:id`, [authMiddleware, adminMiddleware], this.getUserById)
            .patch(`${this.path}/:id`, [authMiddleware, adminMiddleware], this.changeStatus)
            .delete(`${this.path}/:id`, [authMiddleware, adminMiddleware], this.deleteUser)
            .put(`${this.path}/approve/:id`, [authMiddleware, adminMiddleware], this.approveUser)
            .get(`${this.path}/verify/:id`, this.verifyUserEmail)
        // this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
        
        */
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
        // await user.populate('password').execPopulate();
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
        console.log('getAllProfessionalsBySkill called with params:', request.params);


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
