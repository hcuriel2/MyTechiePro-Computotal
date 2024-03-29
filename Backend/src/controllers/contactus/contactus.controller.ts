import { Request, Response, NextFunction, Router } from "express";
import NotFoundcontactusException from "../../exceptions/NotFoundcontactusException";
import Controller from "../../interfaces/controller.interface";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import adminMiddleware from "../../middleware/admin.middleware";
import validationMiddleware from "../../middleware/validation.middleware";
import CreatecontactusDto from "./contactus.dto";
import contactus from "../../models/contactus/contactus.interface";
import contactusModel from "../../models/contactus/contactus.model";

class ContactusController implements Controller {
    public path = "/contactus";
    public router = Router();
    private contactus = contactusModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, adminMiddleware, this.getAllContacts);
        this.router.post(this.path, this.postContact);
        this.router.delete(`${this.path}/:id`,adminMiddleware, this.deleteContactusById);
    }

    // Deletes a ContactUs object by ID
    private deleteContactusById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const successResponse = await this.contactus.findByIdAndDelete(id);
        if (successResponse) {
            response.send(200);
        } else {
            next(new NotFoundcontactusException(id));
        }
    };

    // Retrieves all ContactUs submissions
    private getAllContacts = async (request: Request, response: Response) => {
        const contactus = await this.contactus.find()
        response.send(contactus);
    };

    // Creates a new ContactUs object from User submission
    private postContact = async (
        request: RequestWithUser,
        response: Response
    ) => {
        const contactusData: CreatecontactusDto = request.body;
        const createdcontactus = new this.contactus({
            ...contactusData
        });
        const savedcontactus = await createdcontactus.save();
        response.send(savedcontactus);
    };
}

export default ContactusController;
