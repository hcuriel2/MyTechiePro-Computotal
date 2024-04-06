import { Request, Response, NextFunction, Router } from "express";
import NotFoundCategoryException from "../../exceptions/NotFoundCategoryException";
import Controller from "../../interfaces/controller.interface";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import adminMiddleware from "../../middleware/admin.middleware";
import validationMiddleware from "../../middleware/validation.middleware";
import CreateCategoryDto from "./category.dto";
import Category from "../../models/category/category.interface";
import categoryModel from "../../models/category/category.model";
import userModel from "../../models/user/user.model";

class CategoryController implements Controller {
    public path = "/api/categories";
    public router = Router();
    private category = categoryModel;
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAllCategories);
        this.router.get(`${this.path}/:id`, this.getCategoryById);
        this.router.get(`${this.path}/:id/:serviceId`, this.getServiceById);
        this.router
            .all(`${this.path}/*`)
            // .all(`${this.path}/*`, adminMiddleware)
            .put(`${this.path}/services/:id`, this.addServiceKeywords)
            .patch(
                `${this.path}/:id`,
                validationMiddleware(CreateCategoryDto, true),
                this.modifyCategory
            )
            .patch(`${this.path}/:id/:serviceId`, this.modifyKeywordsByServiceId)
            .delete(`${this.path}/:id`, this.deleteCategory)
            .delete(`${this.path}/:id/:serviceId`, this.deleteService)
            .post(
                this.path,
                validationMiddleware(CreateCategoryDto),
                this.createCategory
            );
    }

    private getAllCategories = async (request: Request, response: Response) => {
        const categories = await this.category
            .find()
            .populate("author", "-password");
        response.send(categories);
    };

    private getCategoryById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const category = await this.category.findById(id);
        if (category) {
            response.send(category);
        } else {
            next(new NotFoundCategoryException(id));
        }
    };

    private getServiceById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const serviceId = request.params.serviceId;
        const category = await this.category.findOne({ _id: id, "services.id": serviceId });
        if (category) {
            response.send(category);
        } else {
            next(new NotFoundCategoryException(id));
        }
    };

    private modifyCategory = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const categoryData: Category = request.body;
        const category = await this.category.findByIdAndUpdate(
            id,
            categoryData,
            { new: true }
        );
        if (category) {
            response.send(category);
        } else {
            next(new NotFoundCategoryException(id));
        }
    };

    private addServiceKeywords = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const { name, keywords } = request.body;
        try {
            const category = await this.category.findByIdAndUpdate(
                id,
                { $push: { services: { name: name, keywords: keywords } } },
                { new: true }
            );
            response.send(category);
        } catch (e) {
            response.send(e);
        }
    };

    private modifyKeywordsByServiceId = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const serviceId = request.params.serviceId;
        const { name, keywords } = request.body;
        try {
            const category = await this.category.updateOne(
                { _id: id, "services._id": serviceId },
                { $set: { name: name, keywords: keywords } },
            );
            response.send(category);
        } catch (e) {
            response.send(e);
        }
    };

    private createCategory = async (
        request: RequestWithUser,
        response: Response
    ) => {
        const hardCodedId = "6186fe3acf028f3a8836ff99";
        const categoryData: CreateCategoryDto = request.body;
        // const findUser = await this.user.findById(request.user._id);
        const findUser = await this.user.findById(hardCodedId);


        const createdCategory = new this.category({
            ...categoryData,
            author: hardCodedId,
        });
        const savedCategory = await createdCategory.save();
        await savedCategory.populate("author", "-password").execPopulate();
        response.send(savedCategory);
    };

    private deleteCategory = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const successResponse = await this.category.findByIdAndDelete(id);
        if (successResponse) {
            response.send(200);
        } else {
            next(new NotFoundCategoryException(id));
        }
    };

    private deleteService = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const serviceId = request.params.serviceId;
        const successResponse = await this.category.findByIdAndUpdate(
            id,
            {
                $pull: {
                    services: { _id: serviceId },
                },
            },
            {
                new: true,
            }
        );
        if (successResponse) {
            response.send(200);
        } else {
            next(new NotFoundCategoryException(id));
        }
    };
}

export default CategoryController;
