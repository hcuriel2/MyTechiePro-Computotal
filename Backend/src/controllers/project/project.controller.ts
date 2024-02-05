/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class serves as an Express controller responsible for handling routes related
to projects (ratings, retrieving, adding, payment, etc).


Unused Code:
- adminMiddleware is commented out and unused again (assuming that this is the case for all backend code)
    - numerous lines of code related to this are unused 
- a ton of handlers related to client and pro are commented out
- project start and end date fields are commented out
- rating system commented out (towards the bottom)


Clarification needed:
- how do we plan on mitigating thie adminMiddleware issue
- what commented out functions are needed - which aren't
- one commented out version is the 'auth version' - are the others not auth?
- rating system is commented out (near the bottom)



Changes:


*/

import { Request, Response, NextFunction, Router } from "express";
import NotFoundprojectException from "../../exceptions/NotFoundProjectException";
import Controller from "../../interfaces/controller.interface";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import authMiddleware from "../../middleware/auth.middleware";
import validationMiddleware from "../../middleware/validation.middleware";
import CreateProjectDto from "./project.dto";
import project from "../../models/project/project.interface";
import projectModel from "../../models/project/project.model";
import userModel from "../../models/user/user.model";
import categoryModel from "../../models/category/category.model";
import adminMiddleware from "../../middleware/admin.middleware";

class ProjectController implements Controller {
    public path = "/projects";
    public router = Router();
    private project = projectModel; // references the projectModel
    private user = userModel; // references the userModel
    private category = categoryModel; // references the categoryModel

    constructor() {
        this.initializeRoutes();
    }

    // Define routes and the associated middleware
    private initializeRoutes() {
        // // auth version do not delete it!
        // this.router.get(this.path, adminMiddleware, this.getAllProjects);
        // this.router.get(`${this.path}/:id`, adminMiddleware,this.getprojectById);
        // this.router.delete(`${this.path}/:id`, adminMiddleware, this.deleteproject);
        // this.router.all(`${this.path}/*`, authMiddleware)
        //            .post(this.path, authMiddleware, this.createproject)
        //            .patch(`${this.path}/comment/:id`,authMiddleware, this.commentProject)
        //            .patch(`${this.path}/ongoing/:id`,authMiddleware, this.onGoingProject)
        //            .patch(`${this.path}/completed/:id`,authMiddleware, this.completedProject)
                //    .patch(`${this.path}/paid/:id`,authMiddleware, this.paidProject);
                //    .patch(`${this.path}/:userId`,authMiddleware, this.getProjectsByUserId);
        this.router.get(this.path, this.getAllProjects);
        // this.router.get(`${this.path}/:id`, this.getAllProjectsByProfessionID);
        this.router.get(`${this.path}/:id`,this.getprojectById);
        this.router.delete(`${this.path}/:id`, this.deleteproject);
        this.router.all(`${this.path}/*`)
                    .post(this.path, this.createproject) // route to create a new project
                    .patch(`${this.path}/comment/:id`, this.commentProject) // route to add comment to a project
                    .patch(`${this.path}/start/:id`,this.startProject) // route to start a project
                    .patch(`${this.path}/feedback/:id`,this.reviewProject)
                    .patch(`${this.path}/complete/:id`, this.completeProject)
                    .patch(`${this.path}/pay/:id`, this.payProject)
                    .get(`${this.path}/client/:clientId`, this.getProjectsByClientId)
                    .get(`${this.path}/professional/:professionalId`, this.getProjectsProfessionalById);
    }


    // //auth version ------ do not delete it
    // private getAllProjects = async (request: Request, response: Response) => {
    //     const projects = await this.project
    //         .find()
    //         .populate("author", "-password");
    //     response.send(projects);
    // };

    // private getprojectById = async (
    //     request: Request,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const id = request.params.id;
    //     const project = await this.project.findById(id);
    //     if (project) {
    //         response.send(project);
    //     } else {
    //         next(new NotFoundprojectException(id));
    //     }
    // };

    // private getProjectsByClientId = async (
    //     request: Request,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const clientId = request.params.clientId;
    //     const client = await this.user.findById(clientId); 
    //     const projects = await this.project.find({client:client});
    //     if (projects) {
    //         response.send(projects);
    //     } else {
    //         response.send("no users in projects");
    //     }
    // };


    // private getProjectsProfessionalById = async (
    //     request: Request,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const professionalId = request.params.professionalId;
    //     const professional = await this.user.findById(professionalId); 
    //     const projects = await this.project.find({professional:professional});
    //     if (projects) {
    //         response.send(projects);
    //     } else {
    //         response.send("no users in projects");
    //     }
    // };
    // private createproject = async (
    //     request: RequestWithUser,
    //     response: Response
    // ) => {
    //     const { categoryName, categoryId, serviceName, serviceId, professionalId } = request.body;
    //     // console.log(request.user._id, request.user.userType)
    //     if ( request.user.userType !== "Client") {
    //         response.send("It's not the client creating the project.");
    //     } else {
    //         const service = await this.category.findOne({
    //             _id: categoryId,
    //             services: { $elemMatch: { _id: serviceId } }            
    //         });
    //         if (service) {
    //             const professional = await this.user.findById(professionalId);
    //             const createdproject = new this.project({
    //                 serviceName: serviceName,
    //                 serviceId: serviceId,
    //                 client: request.user,
    //                 professional: professional
    //             });
    //             const savedProject = await createdproject.save();
    //             response.send(savedProject);
    //         } else {
    //             response.send("No such service yet, no client or not status: 'Request'.");
    //         }
    //     };
    // };

 

    // private onGoingProject = async (
    //     request: RequestWithUser,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const id = request.params.id;
    //     const {totalCost, projectStartDate, projectEndDate, projectDetails} = request.body;
    //     const startDate = new Date(projectStartDate);
    //     const endDate = new Date(projectEndDate);
    //     // console.log(request.user)
    //     await this.project.findOneAndUpdate({_id:id ,state: "Requested", professional:request.user},
    //     {state:"OnGoing" , totalCost:totalCost, projectStartDate:startDate, projectEndDate:endDate,projectDetails:projectDetails },
    //     {returnOriginal:false}, function(err, result) {
    //         if(result) {  
    //             response.send(result);
    //         } else {
    //             next(new NotFoundprojectException(id));
    //         }
    //     });
    // };


    // private completedProject = async (
    //     request: RequestWithUser,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const id = request.params.id;
    //     await this.project.findOneAndUpdate({_id:id, state: "OnGoing", client:request.user}, 
    //     {state:"Completed", eTransferEmail:request.body.eTransferEmail},
    //     {returnOriginal:false}
    //     , function(err, result) {
    //         if(result) {  
    //             response.send(result);
    //         } else {
    //             next(new NotFoundprojectException(id));
    //         }
    //     });
    // };


    // private paidProject = async (
    //     request: RequestWithUser,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const id = request.params.id;
    //     const {rating, feedback} = request.body;
    //     await this.project.findOneAndUpdate(
    //         {_id:id, state: "Completed", client:request.user}, 
    //         {state:"Paid", rating:rating, feedback:feedback},
    //         {returnOriginal:false}, function(err, result) {
    //         if(result) {  
    //             response.send(result);
    //         } else {
    //             next(new NotFoundprojectException(id));
    //         }
    //     });
    // };

    // private commentProject = async (
    //     request: RequestWithUser,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const id = request.params.id;
    //     const {text} = request.body;
    //     var authorName;
    //     if (request.user.company) {
    //         authorName = request.user.company;
    //     } else {
    //         authorName = (request.user.firstName + " " + request.user.lastName);
    //     }
    //     await this.project.findOne({_id:id ,state: "OnGoing"}, async function(err, result) {
    //         if (!result) {
    //             response.send("the status is not Ongoing.");
    //         } else {
    //             const project = await this.project.findByIdAndUpdate(
    //                 id, 
    //                 { $push:{ comments: { text: text, authorId:request.user._id, authorName:authorName}}},
    //                 { new: true});
    //             if (project) {
    //                 response.send(project);
    //             } else {
    //                 next(new NotFoundprojectException(id));
    //             }
    //         }
    //     });
    // };

    // private deleteproject = async (
    //     request: Request,
    //     response: Response,
    //     next: NextFunction
    // ) => {
    //     const id = request.params.id;
    //     const successResponse = await this.project.findByIdAndDelete(id);
    //     if (successResponse) {
    //         response.send(200);
    //     } else {
    //         next(new NotFoundprojectException(id));
    //     }
    // };

    // Handler to get all projects
    private getAllProjects = async (request: Request, response: Response) => {
        const projects = await this.project
            .find()
        response.send(projects);
    };

    // Handler to get projects by ID
    private getprojectById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const projectQuery = this.project.findById(id);
        projectQuery.populate('professional').exec();
        projectQuery.populate('client').exec();
        const project = await projectQuery;
        if (project) {
            response.send(project);
        } else {
            next(new NotFoundprojectException(id));
        }
    };


    // Handler to get projects by client ID
    private getProjectsByClientId = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const clientId = request.params.clientId;
        const client = await this.user.findById(clientId); 
        const projects = await this.project.find({client:client});
        if (projects) {
            response.send(projects);
        } else {
            response.send("no users in projects");
        }
    };


    // Handler to get projects by Professional ID
    private getProjectsProfessionalById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const professionalId = request.params.professionalId;
        const professional = await this.user.findById(professionalId); 
        const projects = await this.project.find({professional:professional});
        if (projects) {
            response.send(projects);
        } else {
            response.send("no users in projects");
        }
    };


    // Handler to create a new project
    private createproject = async (
        request: RequestWithUser,
        response: Response
    ) => {
        const projectData: CreateProjectDto = request.body;

        const user = await this.user.findById(projectData.clientId);
        if ( user.userType !== "Client") {
            response.send("It's not the client creating the project.");
        } else {
            const service = await this.category.findOne({
                _id: projectData.categoryId,
                services: { $elemMatch: { _id: projectData.serviceId } }            
            });
            if (service) {
                const professional = await this.user.findById(projectData.professionalId);
                const createdproject = new this.project({
                    serviceName: projectData.serviceName,
                    serviceId: projectData.serviceId,
                    client: user,
                    professional: professional,
                    rating: 0
                });
                const savedProject = await createdproject.save();
                await savedProject.populate('professional', '-password').execPopulate();
                await savedProject.populate('client', '-password').execPopulate();
                response.send(savedProject);
            } else {
                response.send("No such service yet, no client or not status: 'Request'.");
            }
        };
    };

 
    // Handler to create a new project
    private startProject = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const {totalCost, projectDetails, professionalId} = request.body;
        const user = await this.user.findById(professionalId);
        // const startDate = new Date(projectStartDate);
        // const endDate = new Date(projectEndDate);
        await this.project.findOneAndUpdate({_id:id ,state: "Requested", professional:user},
        {state:"OnGoing" , totalCost:totalCost, projectDetails:projectDetails },
        {returnOriginal:false}, function(err, result) {
            if(result) {  
                response.send(result);
            } else {
                next(new NotFoundprojectException(id));
            }
        });
    };


    // Handler to complete a project
    private completeProject = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const {eTransferEmail, professionalId, projectStartDate, projectEndDate, totalCost} = request.body;
        console.log("Given Start date:");
        console.log(projectStartDate);
        console.log("Given End date:");
        console.log(projectEndDate);
        console.log("Given totalCost:");
        console.log(totalCost);
        const startDate = new Date(projectStartDate);
        const endDate = new Date(projectEndDate);
        await this.project.findOneAndUpdate({_id:id, state: "OnGoing", professional: professionalId}, 
        {state:"Completed", eTransferEmail: eTransferEmail, projectStartDate: startDate, projectEndDate: endDate,
         totalCost: parseFloat(totalCost)},
        {returnOriginal:false}
        , function(err, result) {
            if(result) {  
                response.send(result);
            } else {
                next(new NotFoundprojectException(id));
            }
        });
    };

    // Handler to reveiw a project
    // OLD COMMENT (previous team): TODO Check if this is necessary, remove otherwise
    private reviewProject = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const {rating, feedback, professionalId} = request.body;
        await this.project.findOneAndUpdate({_id:id}, 
        {rating:rating, feedback:feedback},
        {returnOriginal:false}
        , function(err, result) {
            if(result) {  
                console.log("fired");
                response.send(result);
            } else {
                next(new NotFoundprojectException(id));
            }
        }).then(() => {
            this.user.findOneAndUpdate({_id:professionalId},
                {
                    $inc: {ratingCount: 1, ratingSum: rating}
                },
                {returnOriginal:false}
                , function(err, result) {
                    if(result) {  
                        //response.send(result)
                        console.log("396");
                    } else {
                        console.log(err);
                        // next(new NotFoundprojectException(id));
                    }
                });
        }

        );
        // await this.user.findOneAndUpdate({_id:professionalId},
        //     {
        //         $inc: {ratingCount: 1, ratingSum: rating}
        //     },
        //     {returnOriginal:false}
        //     , function(err, result) {
        //         if(result) {  
        //             response.send(result);
        //         } else {
        //             next(new NotFoundprojectException(id));
        //         }
        //     });
    };
    

    // Handler to pay for a project
    private payProject = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const {clientId, professionalId} = request.body;
        var authorName;
        const user = await this.user.findById(clientId);
        const project = await this.project.findById(id);
        if (user.company) {
            authorName = user.company;
        } else {
            authorName = (user.firstName + " " + user.lastName);
        }
        try {
            const pro = await this.user.findByIdAndUpdate(
                professionalId, 
                { $push:{ performance: {clientName:authorName, service:project.serviceName}}},
                { new: true});
        } catch (e) {
            response.send(e);
        }
        await this.project.findOneAndUpdate(
            {_id:id, state: "Completed", client:clientId},
            {state:"Paid"},
            {returnOriginal:false}, async function(err, result) {
                if(result) {
                    response.send(result);
                } else {
                    next(new NotFoundprojectException(id));
                }
            });
    };

    // Handler to comment on a project
    private commentProject = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const {text, userId} = request.body;
        const user = await this.user.findById(userId);
        var authorName;
        if (user.company) {
            authorName = user.company;
        } else {
            authorName = (user.firstName + " " + user.lastName);
        }
        const project = await this.project.findByIdAndUpdate(
            id, 
            { $push:{ comments: { text: text, authorId:user._id, authorName:authorName}}},
            { new: true});
        if (project) {
            response.send(project);
        } else {
            next(new NotFoundprojectException(id));
        }
    };

    // Handler to delete a project
    private deleteproject = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const successResponse = await this.project.findByIdAndDelete(id);
        if (successResponse) {
            response.send(200);
        } else {
            next(new NotFoundprojectException(id));
        }
    };
}

export default ProjectController;
