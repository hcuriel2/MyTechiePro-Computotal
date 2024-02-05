/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class serves as an Express controller responsible for managing contact us 
form submissions. It defines and handles routes for various actions related to form submissions
such as retrieval, creation and deletion.


Unused Code:
- adminMiddleware is commented out and unused again (assuming that this is the case for all backend code)
    - lines 49 & 53
    

Clarification needed:
- how do we plan on mitigating thie adminMiddleware issue

Changes:


*/

import { Request, Response, NextFunction, Router } from "express";
import NotFoundcontactusException from "../../exceptions/NotFoundcontactusException";
import Controller from "../../interfaces/controller.interface";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import adminMiddleware from "../../middleware/admin.middleware";
import validationMiddleware from "../../middleware/validation.middleware";
import CreatecontactusDto from "./contactus.dto";
import contactus from "../../models/contactus/contactus.interface";
import contactusModel from "../../models/contactus/contactus.model";

// Class implements the controller interface
class ContactusController implements Controller {
    public path = "/contactus"; // base url
    public router = Router();
    private contactus = contactusModel; // references the contactusModel

    constructor() {
        this.initializeRoutes();
    }

    // Define routes and associated route handlers
    private initializeRoutes() {
        this.router.get(this.path, this.getAllContacts); // get all contact us submisions
        
        // this.router.get(this.path,adminMiddleware, this.getAllContacts);
        
        this.router.post(this.path, this.postContact); // post a new contact us submission
        
        // this.router.delete(`${this.path}/:id`, adminMiddleware,this.deleteContactusById);
        
        this.router.delete(`${this.path}/:id`,this.deleteContactusById); // delete a contact us submission by ID
    }

    // Handler for getting all contact us submissions
    private getAllContacts = async (request: Request, response: Response) => {
        const contactus = await this.contactus.find() // retrieve all contact us submissions
        response.send(contactus);
    };

    // Handler for posting a new contact us submission
    private postContact = async (
        request: RequestWithUser,
        response: Response
    ) => {
        const contactusData: CreatecontactusDto = request.body; // extract contact us data from the request
        const createdcontactus = new this.contactus({
            ...contactusData
        });
        const savedcontactus = await createdcontactus.save(); // save the new contact us submission to the database
        response.send(savedcontactus);
    };

    // Handler for deleting a contact us submission
    private deleteContactusById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = request.params.id; // extract the contact us submission from the request parameters
        const successResponse = await this.contactus.findByIdAndDelete(id);
        if (successResponse) {
            response.send(200);
        } else {
            next(new NotFoundcontactusException(id)); // handles the case where the contact us submission isn't found
        }
    };
}

export default ContactusController;
