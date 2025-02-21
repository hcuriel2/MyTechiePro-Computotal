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
import HttpException from "../../exceptions/HttpException";
import TransactionModel from "../../models/transaction/transaction.model";
import Stripe from 'stripe';

class ProjectController implements Controller {
    public path = "/projects";
    public router = Router();
    private project = projectModel;
    private user = userModel;
    private category = categoryModel;
    private stripe: Stripe; 

    constructor() {
        // Bind all methods that need 'this' context
        this.initializeRoutes();
        this.payProject = this.payProject.bind(this);
        this.project = projectModel; // Ensure project model is initialized

        // Initialize Stripe
        console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 8) + '...');
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-01-27.acacia'
        });
    }

    public resetProjectPrice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const projectId = req.params.id;
            const { totalCost } = req.body;
            
            const project = await this.project.findByIdAndUpdate(
                projectId,
                { 
                    totalCost, 
                    clientResponse: null,
                    priceConfirmed: false
                },
                { new: true }
            ).populate('professional').populate('client');
    
            if (!project) {
                return next(new HttpException(404, 'Project not found'));
            }
    
            res.status(200).json(project);
        } catch (error) {
            console.error('Reset price error:', error);
            next(new HttpException(500, 'Internal server error'));
        }
    };
    
    private initializeRoutes() {
        this.router.post(`${this.path}/pay`, async (req, res, next) => {
            try {
                await this.payProject(req, res);
            } catch (error) {
                console.error('Payment route error:', error);
                next(new HttpException(500, 'Payment processing failed'));
            }
        });

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
                    // .patch(`${this.path}/pay/:id`, authMiddleware,this.payProject)
                    .get(`${this.path}/client/:clientId`, authMiddleware, this.getProjectsByClientId)
                    .get(`${this.path}/professional/:professionalId`, authMiddleware, this.getProjectsProfessionalById)
                    .post(`${this.path}/projectReview`, authMiddleware,this.projectReview)
                    .patch(`${this.path}/client-response/:id`, authMiddleware, this.updateClientResponse)
                    .patch(`${this.path}/:id/reset-price`, authMiddleware, this.resetProjectPrice);
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
    //     // 
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
    //     // 
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
                    rating: 0,
                    priceConfirmed: false,
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
            
        } catch (e) {
            console.error('findUsersByTpe failed.', e);
        }
        return users;
    }


    private projectReview = async (
        request: Request,
        response: Response
    ) => {
        
        const projectID = request.body.projectID; 
        const review = request.body.review;
        const rating = request.body.rating;
        let projectObj = null;
        let clientID = null;
        let clientName = null;
        let clientEmail = null;
        let clientPhoneNumber = null;


        // Retrieve project object
        try {
            projectObj = await this.project.findOne({ _id: projectID });
            
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
            clientEmail = clientObj.email;
            clientPhoneNumber = clientObj.phoneNumber;


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
            
            response.json({ message: "Project updated successfully", result: result })

        } catch (e) {
            console.error(e);
            response.status(500).json({ message: "Failed to update project object" });
        }



        // If the rating is below 3, a notification needs to be sent to the admin
        if (rating < 3) {
            
            let admins =  await this.findUsersByType('Admin');
            let emailList = null;

            for (let admin of admins){
                emailList += `${admin.email}, `
                
            }

            // Feature is designed to work with the admin list
            // Currently the only email is set in the ENV file
            

            let html = `
                <h1>Unsatisfied Customer</h1>
                <br/>
                <p><b>Please contact the customer immediately</b></p>
                <p>Client: ${clientName}
                <br/>
                <p>Email: ${clientEmail}</p>
                <p>Phone Number: ${clientPhoneNumber}</p>
                <br/>
                <br/>
                <h3>Client Review (${rating}/5)</h3>
                <p>${review}</p>

            `

            this.sendEmail(process.env.ADMIN_EMAIL, "Notification of Negative Review", html);
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
                
                
            } else {
                
            }
        })
    }



    // TODO Check if this is necessary, remove otherwise
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
                        
                    } else {
                        
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


    // Niko: Initiates a Stripe Checkout session for a given project. It checks the project and pricing, 
    // then either updates an existing Transaction or creates a new one (with status "pending").
    // Finally, it creates a Stripe session and returns the session URL, with projectId added to success and cancel URLs.
    private async payProject(req: Request, res: Response) {
        try {
          const { projectId } = req.body; 
          if (!projectId) {
            return res.status(400).json({ error: "Missing projectId" });
          }
      
          const proj = await this.project.findById(projectId)
            .populate('client')
            .populate('professional');
          if (!proj) {
            return res.status(404).json({ error: "Project not found" });
          }
          if (!proj.totalCost || proj.totalCost <= 0) {
            return res.status(400).json({ error: "Invalid project price" });
          }
      
          const clientId = (proj.client as any)._id;
          const professionalId = (proj.professional as any)._id;
          const totalAmount = proj.totalCost;
          const platformFee = 8.5;
      
          let transaction = await TransactionModel
            .findOne({ project: projectId })
            .sort({ createdAt: -1 });
          
          if (transaction) {
            transaction.totalAmount = totalAmount;
            transaction.platformFee = platformFee;
            transaction.paymentIntentId = "pending_" + Date.now();
            transaction.status = "pending";
            transaction = await transaction.save();
          } else {
            transaction = new TransactionModel({
              project: projectId,
              client: clientId,
              professional: professionalId,
              totalAmount: totalAmount,
              platformFee: platformFee,
              paymentIntentId: "pending_" + Date.now(),
              status: "pending"
            });
            transaction = await transaction.save();
          }
          console.log('Transaction created/updated:', transaction._id);
      
          const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
              price_data: {
                currency: "cad",
                product_data: { 
                  name: `Payment for Project ${projectId}`,
                  description: `Project payment for ${proj.serviceName || 'service'}`
                },
                unit_amount: Math.round(totalAmount * 100),
              },
              quantity: 1,
            }],
            mode: "payment",
            metadata: {
              projectId,
              clientId: clientId.toString(),
              professionalId: professionalId.toString(),
              transactionId: transaction._id.toString(),
              totalAmount: totalAmount.toString(),
            },
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&transactionId=${transaction._id}&projectId=${projectId}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-failed?session_id={CHECKOUT_SESSION_ID}&transactionId=${transaction._id}&projectId=${projectId}`,
          });
          
          res.json({ url: session.url });
        } catch (error) {
          console.error("Detailed error:", error);
          res.status(500).json({ 
            error: "Failed to create payment session",
            details: error.message 
          });
        }
      }

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

    private updateClientResponse = async (
        request: RequestWithUser,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const { clientResponse } = request.body;

        await this.project.findByIdAndUpdate(
            id,
            {
                clientResponse,
                priceConfirmed: clientResponse === 'confirmed' ? true : false
            },
            { new: true },
            function(err, result) {
                if(result) {
                    response.send(result);
                } else {
                    next(new NotFoundprojectException(id));
                }
            }
        )
    }
}

export default ProjectController;
