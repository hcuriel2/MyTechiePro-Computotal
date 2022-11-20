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
const NotFoundcontactusException_1 = __importDefault(require("../../exceptions/NotFoundcontactusException"));
const contactus_model_1 = __importDefault(require("../../models/contactus/contactus.model"));
class ContactusController {
    constructor() {
        this.path = "/contactus";
        this.router = express_1.Router();
        this.contactus = contactus_model_1.default;
        this.getAllContacts = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const contactus = yield this.contactus.find();
            response.send(contactus);
        });
        this.postContact = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const contactusData = request.body;
            const createdcontactus = new this.contactus(Object.assign({}, contactusData));
            const savedcontactus = yield createdcontactus.save();
            response.send(savedcontactus);
        });
        this.deleteContactusById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const successResponse = yield this.contactus.findByIdAndDelete(id);
            if (successResponse) {
                response.send(200);
            }
            else {
                next(new NotFoundcontactusException_1.default(id));
            }
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, this.getAllContacts);
        // this.router.get(this.path,adminMiddleware, this.getAllContacts);
        this.router.post(this.path, this.postContact);
        // this.router.delete(`${this.path}/:id`, adminMiddleware,this.deleteContactusById);
        this.router.delete(`${this.path}/:id`, this.deleteContactusById);
    }
}
exports.default = ContactusController;
//# sourceMappingURL=contactus.controller.js.map