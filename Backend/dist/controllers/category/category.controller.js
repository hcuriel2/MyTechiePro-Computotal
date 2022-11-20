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
const NotFoundCategoryException_1 = __importDefault(require("../../exceptions/NotFoundCategoryException"));
const validation_middleware_1 = __importDefault(require("../../middleware/validation.middleware"));
const category_dto_1 = __importDefault(require("./category.dto"));
const category_model_1 = __importDefault(require("../../models/category/category.model"));
const user_model_1 = __importDefault(require("../../models/user/user.model"));
class CategoryController {
    constructor() {
        this.path = "/categories";
        this.router = express_1.Router();
        this.category = category_model_1.default;
        this.user = user_model_1.default;
        this.getAllCategories = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const categories = yield this.category
                .find()
                .populate("author", "-password");
            response.send(categories);
        });
        this.getCategoryById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const category = yield this.category.findById(id);
            if (category) {
                response.send(category);
            }
            else {
                next(new NotFoundCategoryException_1.default(id));
            }
        });
        this.getServiceById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const serviceId = request.params.serviceId;
            const category = yield this.category.findOne({ _id: id, "services.id": serviceId });
            if (category) {
                response.send(category);
            }
            else {
                next(new NotFoundCategoryException_1.default(id));
            }
        });
        this.modifyCategory = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const categoryData = request.body;
            const category = yield this.category.findByIdAndUpdate(id, categoryData, { new: true });
            if (category) {
                response.send(category);
            }
            else {
                next(new NotFoundCategoryException_1.default(id));
            }
        });
        this.addServiceKeywords = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const { name, keywords } = request.body;
            try {
                const category = yield this.category.findByIdAndUpdate(id, { $push: { services: { name: name, keywords: keywords } } }, { new: true });
                response.send(category);
            }
            catch (e) {
                response.send(e);
            }
        });
        this.modifyKeywordsByServiceId = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const serviceId = request.params.serviceId;
            const { name, keywords } = request.body;
            try {
                const category = yield this.category.updateOne({ _id: id, "services._id": serviceId }, { $set: { name: name, keywords: keywords } });
                response.send(category);
            }
            catch (e) {
                response.send(e);
            }
        });
        this.createCategory = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const categoryData = request.body;
            const findUser = yield this.user.findById(request.user._id);
            console.log(findUser);
            const createdCategory = new this.category(Object.assign(Object.assign({}, categoryData), { author: request.user._id }));
            const savedCategory = yield createdCategory.save();
            yield savedCategory.populate("author", "-password").execPopulate();
            response.send(savedCategory);
        });
        this.deleteCategory = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const successResponse = yield this.category.findByIdAndDelete(id);
            if (successResponse) {
                response.send(200);
            }
            else {
                next(new NotFoundCategoryException_1.default(id));
            }
        });
        this.deleteService = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const serviceId = request.params.serviceId;
            const successResponse = yield this.category.findByIdAndUpdate(id, {
                $pull: {
                    services: { _id: serviceId },
                },
            }, {
                new: true,
            });
            if (successResponse) {
                response.send(200);
            }
            else {
                next(new NotFoundCategoryException_1.default(id));
            }
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, this.getAllCategories);
        this.router.get(`${this.path}/:id`, this.getCategoryById);
        this.router.get(`${this.path}/:id/:serviceId`, this.getServiceById);
        this.router
            .all(`${this.path}/*`)
            // .all(`${this.path}/*`, adminMiddleware)
            .put(`${this.path}/services/:id`, this.addServiceKeywords)
            .patch(`${this.path}/:id`, validation_middleware_1.default(category_dto_1.default, true), this.modifyCategory)
            .patch(`${this.path}/:id/:serviceId`, this.modifyKeywordsByServiceId)
            .delete(`${this.path}/:id`, this.deleteCategory)
            .delete(`${this.path}/:id/:serviceId`, this.deleteService)
            .post(this.path, validation_middleware_1.default(category_dto_1.default), this.createCategory);
    }
}
exports.default = CategoryController;
//# sourceMappingURL=category.controller.js.map