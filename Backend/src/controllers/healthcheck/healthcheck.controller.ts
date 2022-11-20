import { Request, Response, Router } from "express";
import Controller from "../../interfaces/controller.interface";

class healthCheckController implements Controller{
    public path = '/';
    public router = Router();
    constructor(){
        this.initializeRoutes();
    }
    private async initializeRoutes(){
        this.router.get(this.path,this.getHealthCheck);
    }
    private getHealthCheck = async (request:Request,response:Response)=>{
        response.sendStatus(200);
    }
}

export default healthCheckController;