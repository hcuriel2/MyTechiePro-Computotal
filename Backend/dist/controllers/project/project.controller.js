"use strict";
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
const NotFoundProjectException_1 = __importDefault(require("../../exceptions/NotFoundProjectException"));
const project_model_1 = __importDefault(require("../../models/project/project.model"));
const user_model_1 = __importDefault(require("../../models/user/user.model"));
const category_model_1 = __importDefault(require("../../models/category/category.model"));
class ProjectController {
    constructor() {
        this.path = "/projects";
        this.router = express_1.Router();
        this.project = project_model_1.default;
        this.user = user_model_1.default;
        this.category = category_model_1.default;
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
        this.getAllProjects = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const projects = yield this.project
                .find();
            response.send(projects);
        });
        this.getprojectById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const projectQuery = this.project.findById(id);
            projectQuery.populate('professional').exec();
            projectQuery.populate('client').exec();
            const project = yield projectQuery;
            if (project) {
                response.send(project);
            }
            else {
                next(new NotFoundProjectException_1.default(id));
            }
        });
        this.getProjectsByClientId = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const clientId = request.params.clientId;
            const client = yield this.user.findById(clientId);
            const projects = yield this.project.find({ client: client });
            if (projects) {
                response.send(projects);
            }
            else {
                response.send("no users in projects");
            }
        });
        this.getProjectsProfessionalById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const professionalId = request.params.professionalId;
            const professional = yield this.user.findById(professionalId);
            const projects = yield this.project.find({ professional: professional });
            if (projects) {
                response.send(projects);
            }
            else {
                response.send("no users in projects");
            }
        });
        this.createproject = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const projectData = request.body;
            const user = yield this.user.findById(projectData.clientId);
            if (user.userType !== "Client") {
                response.send("It's not the client creating the project.");
            }
            else {
                const service = yield this.category.findOne({
                    _id: projectData.categoryId,
                    services: { $elemMatch: { _id: projectData.serviceId } }
                });
                if (service) {
                    const professional = yield this.user.findById(projectData.professionalId);
                    const createdproject = new this.project({
                        serviceName: projectData.serviceName,
                        serviceId: projectData.serviceId,
                        client: user,
                        professional: professional,
                        rating: 0
                    });
                    const savedProject = yield createdproject.save();
                    yield savedProject.populate('professional', '-password').execPopulate();
                    yield savedProject.populate('client', '-password').execPopulate();
                    response.send(savedProject);
                }
                else {
                    response.send("No such service yet, no client or not status: 'Request'.");
                }
            }
            ;
        });
        this.startProject = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const { totalCost, projectDetails, professionalId } = request.body;
            const user = yield this.user.findById(professionalId);
            // const startDate = new Date(projectStartDate);
            // const endDate = new Date(projectEndDate);
            yield this.project.findOneAndUpdate({ _id: id, state: "Requested", professional: user }, { state: "OnGoing", totalCost: totalCost, projectDetails: projectDetails }, { returnOriginal: false }, function (err, result) {
                if (result) {
                    response.send(result);
                }
                else {
                    next(new NotFoundProjectException_1.default(id));
                }
            });
        });
        this.completeProject = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const { eTransferEmail, professionalId, projectStartDate, projectEndDate, totalCost } = request.body;
            console.log("Given Start date:");
            console.log(projectStartDate);
            console.log("Given End date:");
            console.log(projectEndDate);
            console.log("Given totalCost:");
            console.log(totalCost);
            const startDate = new Date(projectStartDate);
            const endDate = new Date(projectEndDate);
            yield this.project.findOneAndUpdate({ _id: id, state: "OnGoing", professional: professionalId }, { state: "Completed", eTransferEmail: eTransferEmail, projectStartDate: startDate, projectEndDate: endDate,
                totalCost: parseFloat(totalCost) }, { returnOriginal: false }, function (err, result) {
                if (result) {
                    response.send(result);
                }
                else {
                    next(new NotFoundProjectException_1.default(id));
                }
            });
        });
        // TODO Check if this is necessary, remove otherwise
        this.reviewProject = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const { rating, feedback, professionalId } = request.body;
            yield this.project.findOneAndUpdate({ _id: id }, { rating: rating, feedback: feedback }, { returnOriginal: false }, function (err, result) {
                if (result) {
                    console.log("fired");
                    response.send(result);
                }
                else {
                    next(new NotFoundProjectException_1.default(id));
                }
            }).then(() => {
                this.user.findOneAndUpdate({ _id: professionalId }, {
                    $inc: { ratingCount: 1, ratingSum: rating }
                }, { returnOriginal: false }, function (err, result) {
                    if (result) {
                        //response.send(result)
                        console.log("396");
                    }
                    else {
                        console.log(err);
                        // next(new NotFoundprojectException(id));
                    }
                });
            });
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
        });
        this.payProject = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const { clientId, professionalId } = request.body;
            var authorName;
            const user = yield this.user.findById(clientId);
            const project = yield this.project.findById(id);
            if (user.company) {
                authorName = user.company;
            }
            else {
                authorName = (user.firstName + " " + user.lastName);
            }
            try {
                const pro = yield this.user.findByIdAndUpdate(professionalId, { $push: { performance: { clientName: authorName, service: project.serviceName } } }, { new: true });
            }
            catch (e) {
                response.send(e);
            }
            yield this.project.findOneAndUpdate({ _id: id, state: "Completed", client: clientId }, { state: "Paid" }, { returnOriginal: false }, function (err, result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (result) {
                        response.send(result);
                    }
                    else {
                        next(new NotFoundProjectException_1.default(id));
                    }
                });
            });
        });
        this.commentProject = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const { text, userId } = request.body;
            const user = yield this.user.findById(userId);
            var authorName;
            if (user.company) {
                authorName = user.company;
            }
            else {
                authorName = (user.firstName + " " + user.lastName);
            }
            const project = yield this.project.findByIdAndUpdate(id, { $push: { comments: { text: text, authorId: user._id, authorName: authorName } } }, { new: true });
            if (project) {
                response.send(project);
            }
            else {
                next(new NotFoundProjectException_1.default(id));
            }
        });
        this.deleteproject = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const successResponse = yield this.project.findByIdAndDelete(id);
            if (successResponse) {
                response.send(200);
            }
            else {
                next(new NotFoundProjectException_1.default(id));
            }
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
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
        this.router.get(`${this.path}/:id`, this.getprojectById);
        this.router.delete(`${this.path}/:id`, this.deleteproject);
        this.router.all(`${this.path}/*`)
            .post(this.path, this.createproject)
            .patch(`${this.path}/comment/:id`, this.commentProject)
            .patch(`${this.path}/start/:id`, this.startProject)
            .patch(`${this.path}/feedback/:id`, this.reviewProject)
            .patch(`${this.path}/complete/:id`, this.completeProject)
            .patch(`${this.path}/pay/:id`, this.payProject)
            .get(`${this.path}/client/:clientId`, this.getProjectsByClientId)
            .get(`${this.path}/professional/:professionalId`, this.getProjectsProfessionalById);
    }
}
exports.default = ProjectController;
//# sourceMappingURL=project.controller.js.map