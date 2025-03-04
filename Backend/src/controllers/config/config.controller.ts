import { Request, Response, Router } from "express";
import Controller from "../../interfaces/controller.interface";

class ConfigController implements Controller {
    public path = "/config";
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/google-maps-key`,
            this.getGoogleMapsApiKey
        );
    }

    private getGoogleMapsApiKey = async (
        request: Request,
        response: Response
    ) => {
        response.send({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
    };
}

export default ConfigController;
