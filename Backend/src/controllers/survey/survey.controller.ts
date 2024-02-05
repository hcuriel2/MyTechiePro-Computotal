/*NOTES*/
/*
IF YOU MODIFY THE CODE: DOCUMENT THE CHANGE AND MENTION IT IN THE CHANGES SECTION


Summary:
This class is responsible for handling survey-related routes. It defines a base URL
and a single route for retrieving all surveys.


Unused Code:


Clarification needed:



Changes:


*/

import { Request, Response, Router } from "express";
import Controller from "../../interfaces/controller.interface";
import surveyModel from "../../models/survey/survey.model";


// Class implements the Controller interface
class SurveyController implements Controller {
    public path = "/survey"; // base url 
    public router = Router();
    private survey = surveyModel; // references the surveyModel

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAllSurveys); // GET request: retrieves all surveys
    }

    private getAllSurveys = async (request: Request, response: Response) => {
        const surveys = await this.survey.find(); // retrieve all surveys  from the database
        response.send(surveys);                   // send the retrieved surveys as a response
    };
}

export default SurveyController;
