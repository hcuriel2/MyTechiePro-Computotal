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
import emailtransporter from "../../middleware/emailtransporter.middleware";


class ProjectController implements Controller {
    public path = "/projects";
    public router = Router();
    private project = projectModel;
    private user = userModel;
    private category = categoryModel;

    constructor() {
        this.initializeRoutes();
    }

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
        this.router.get(`${this.path}`, this.getAllProjects);
        // this.router.get(`${this.path}/:id`, this.getAllProjectsByProfessionID);
        this.router.get(`${this.path}/:id`, this.getprojectById);
        this.router.delete(`${this.path}/:id`, this.deleteproject);
        this.router.all(`${this.path}/*`)
                    .post(this.path, authMiddleware, this.createproject)
                    .patch(`${this.path}/comment/:id`, authMiddleware, this.commentProject)
                    .patch(`${this.path}/start/:id`, authMiddleware, this.startProject)
                    .patch(`${this.path}/feedback/:id`, authMiddleware,this.reviewProject)
                    .patch(`${this.path}/complete/:id`,authMiddleware, this.completeProject)
                    .patch(`${this.path}/pay/:id`, authMiddleware,this.payProject)
                    .get(`${this.path}/client/:clientId`, authMiddleware, this.getProjectsByClientId)
                    .get(`${this.path}/professional/:professionalId`, authMiddleware, this.getProjectsProfessionalById)
                    .post(`${this.path}/projectReview`, authMiddleware,this.projectReview)

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

    private getAllProjects = async (request: Request, response: Response) => {
        const projects = await this.project
            .find()
        response.send(projects);
    };

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

    private async findUsersByType(userType){
        let users = null;
        try {
            users = await this.user.find({ userType: userType });
            console.log("findUsersByType was successful.")
        } catch (e) {
            console.error('findUsersByTpe failed.', e);
        }
        return users;
    }


    private projectReview = async (
        request: Request,
        response: Response
    ) => {
        console.log(request.body);
        const projectID = request.body.projectID; 
        const review = request.body.review;
        const rating = request.body.rating;
        let projectObj = null;
        let clientID = null;
        let clientName = null;


        // Retrieve project object
        try {
            projectObj = await this.project.findOne({ _id: projectID });
            console.log("found project");
        } catch (e) {
            console.error(e);
        }
        
        // Take the clientID from the project object
        // Use this value to search for a client object
        // Assign the first and last name to clientName - this is used for the author value for the review comment
        clientID = projectObj.client;
        try {
            let clientObj = await this.user.findOne({ _id: clientID });
            let fName = clientObj.firstName;
            let lName = clientObj.lastName;
            clientName = `${fName} ${lName}`;
        } catch (e) {
            console.error(e);
        }
        


        // Object to hold Review and Rating
        const updateOperation = {
            $push: { comments: {
                text: review,
                authorId: clientID,
                authorName: clientName
            } 
        },
            $set: {rating: rating }
        }


        // Update the project object 
        try {
            const result = await this.project.updateOne({ _id: projectID }, updateOperation);
            console.log("Project review successfully added: ", result);
            response.json({ message: "Project updated successfully", result: result })

        } catch (e) {
            console.error(e);
            response.status(500).json({ message: "Failed to update project object" });
        }



        // If the rating is below 3, a notification needs to be sent to the admin
        if (rating < 3) {
            console.log('\n\n\n\n\n Negative review detected\n\n\n\n\n')
            let admins =  await this.findUsersByType('Admin');
            let emailList = null;

            for (let admin of admins){
                emailList += `${admin.email}, `
                
            }
            console.log(emailList);

            let html = `
                <h1>Unsatisfied Customer</h1>
                <p>Please contact the customer immediately</p>
                <p>Client: ${clientName}
                ClientID: ${clientID}</p>
            `

            this.sendEmail("willondrik@outlook.com", "Notification of Negative Review", html);
        }
    }

    private async sendEmail(recipients, subject, message){
        let email = {
            from: 'noreply.mytechie.pro@gmail.com',
            to: recipients,
            subject: subject,
            html: message
        }
        emailtransporter.sendMail(email, function(error, info) {
            if (error){
                console.log(error);
                
            } else {
                console.log("Poor review notification sent to admins.");
            }
        })
    }



    // TODO Check if this is necessary, remove otherwise
    private reviewProject = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        console.log(request.params.id);
        console.log('starting review function')
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
