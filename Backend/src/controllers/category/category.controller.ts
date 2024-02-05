/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class is responsible for managing category-related operations by use of Express.js. It includes
routes and handlers for actions such as retrieving all categories, getting a cateogry by ID, modifying 
categories, adding service keywords, creating new categories and deleting categories or services within
the aforementioned categories. This class integrates with the 'categoryModel' and 'userModel' for database
operations.


Unused Code:
- adminMiddleware doesn't appear to be used (seems related to the commented out adminMiddleware line @ )
- createCategory handler
    - it appears there were issues getting this to work (the user is hardcoded)

Clarification needed:
- why is adminMiddleware commented out
- why is the createCategory handler hardcoded - this needs to be changed
    - are there more functions that require user id, that don't have it incorporated?


Changes:


*/



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

// Implements the Controller interface
class CategoryController implements Controller {
    public path = "/categories"; // base path for category-related routes
    public router = Router();
    private category = categoryModel; // references the category model
    private user = userModel; // references the user model

    constructor() {
        this.initializeRoutes();
    }

    // Initialize the routes for the CategoryController
    // Uses different HTTP methods to create, read, update and delete different items
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

    // Handler to get all categories
    private getAllCategories = async (request: Request, response: Response) => {
        const categories = await this.category
            .find()
            .populate("author", "-password");
        response.send(categories);
    };

    // Handler to get a category by ID
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

    // Handler to get a service within a category
    private getServiceById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const serviceId = request.params.serviceId;
        const category = await this.category.findOne({_id:id, "services.id":serviceId});
        if (category) {
            response.send(category);
        } else {
            next(new NotFoundCategoryException(id));
        }
    };

    // Handler to modify a category
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

    // Handler to add service keywords
    private addServiceKeywords = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const {name, keywords} = request.body;
        try {
            const category = await this.category.findByIdAndUpdate(
                id,
                { $push: { services: {name:name, keywords:keywords} } },
                { new: true }
            );
            response.send(category);
        } catch (e) {
            response.send(e);
        }
    };

    // Handler to modify keywords for a service by serviceId
    private modifyKeywordsByServiceId = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const serviceId = request.params.serviceId;
        const {name,keywords} = request.body;
        try {
            const category = await this.category.updateOne(
                {_id:id, "services._id":serviceId},
                { $set: {name:name, keywords:keywords } },
            );
            response.send(category);
        } catch (e) {
            response.send(e);
        }
    };

    // Handler to create a new category
    private createCategory = async (
        request: RequestWithUser,
        response: Response
    ) => {
        const hardCodedId = "6186fe3acf028f3a8836ff99";
        const categoryData: CreateCategoryDto = request.body;
        // const findUser = await this.user.findById(request.user._id);
        const findUser = await this.user.findById(hardCodedId);
        console.log(findUser);

        const createdCategory = new this.category({
            ...categoryData,
            author: hardCodedId,
        });
        const savedCategory = await createdCategory.save();
        await savedCategory.populate("author", "-password").execPopulate();
        response.send(savedCategory);
    };

    // Handler to delete a category
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

    // Handler to delete a service
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
                services: {_id: serviceId},
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
