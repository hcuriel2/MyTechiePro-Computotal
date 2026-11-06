import { Request, Response, NextFunction, Router } from "express";
import AboutUsModel from "../../models/aboutus/aboutus.model";
import Controller from "../../interfaces/controller.interface";
import { validate } from "class-validator";
import UpdateAboutUsDto from "./aboutus.dto";
import adminMiddleware from "../../middleware/admin.middleware";

const DEFAULT_ABOUT_US_CONTENT =
    "We help you find trusted technology professionals for repairs, setup, and everyday tech support.";

class AboutUsController implements Controller {
    public path = "/aboutus";
    public router = Router();
    private aboutUs = AboutUsModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAboutUsContent);
        this.router.put(this.path, adminMiddleware, this.updateAboutUsContent);
    }

    private getAboutUsContent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const aboutUsContent = await this.aboutUs.findOne();
            res.setHeader("Cache-Control", "no-store");
            res.status(200).json({
                content: aboutUsContent ? aboutUsContent.content : DEFAULT_ABOUT_US_CONTENT,
            });
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
          res.status(200).json({
              content: updatedContent ? updatedContent.content : updateAboutUsDto.content,
          });
      } catch (error) {
          next(error);
      }
  };
}

export default AboutUsController;