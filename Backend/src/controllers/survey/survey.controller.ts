import { Request, Response, Router } from "express";
import Controller from "../../interfaces/controller.interface";
import surveyModel from "../../models/survey/survey.model";


class SurveyController implements Controller {
    public path = "/survey";
    public router = Router();
    private survey = surveyModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAllSurveys);
    }

    private getAllSurveys = async (request: Request, response: Response) => {
        const surveys = await this.survey.find();
        response.send(surveys);
    };
}

export default SurveyController;
