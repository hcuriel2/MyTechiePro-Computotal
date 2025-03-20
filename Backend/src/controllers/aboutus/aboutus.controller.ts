import { Request, Response, NextFunction, Router } from "express";
import AboutUsModel from "../../models/aboutus/aboutus.model";
import Controller from "../../interfaces/controller.interface";
import { validate } from "class-validator";
import UpdateAboutUsDto from "./aboutus.dto";


class AboutUsController implements Controller {
    public path = "/aboutus";
    public router = Router();
    private aboutUs = AboutUsModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAboutUsContent);
        this.router.put(this.path, this.updateAboutUsContent);
    }

    private getAboutUsContent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const aboutUsContent = await this.aboutUs.findOne();
            res.status(200).json(aboutUsContent);
        } catch (error) {
            next(error);
        }
    };

    private updateAboutUsContent = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const updateAboutUsDto = new UpdateAboutUsDto();
          updateAboutUsDto.content = req.body.content;
  
          const errors = await validate(updateAboutUsDto);
          if (errors.length > 0) {
              return res.status(400).json({ errors });
          }
  
          const updatedContent = await this.aboutUs.findOneAndUpdate(
              {},
              { content: updateAboutUsDto.content },
              { new: true, upsert: true }
          );
          res.status(200).json(updatedContent);
      } catch (error) {
          next(error);
      }
  };
}

export default AboutUsController;