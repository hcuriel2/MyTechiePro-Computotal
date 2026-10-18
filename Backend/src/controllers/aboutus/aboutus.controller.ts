import { Request, Response, NextFunction, Router } from "express";
import AboutUsModel from "../../models/aboutus/aboutus.model";
import Controller from "../../interfaces/controller.interface";
import { validate } from "class-validator";
import UpdateAboutUsDto from "./aboutus.dto";
import authMiddleware from "../../middleware/auth.middleware";
import adminMiddleware from "../../middleware/admin.middleware";


class AboutUsController implements Controller {
    public path = "/aboutus";
    public router = Router();
    private aboutUs = AboutUsModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAboutUsContent);
        this.router.put(this.path, authMiddleware, adminMiddleware, this.updateAboutUsContent);
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
          updateAboutUsDto.appendixContent = req.body.appendixContent;
  
          const errors = await validate(updateAboutUsDto);
          if (errors.length > 0) {
              return res.status(400).json({ errors });
          }
          if (updateAboutUsDto.content === undefined && updateAboutUsDto.appendixContent === undefined) {
              return res.status(400).json({ message: "At least one content field is required." });
          }
  
          const contentUpdate: { content?: string; appendixContent?: string } = {};
          if (updateAboutUsDto.content !== undefined) {
              contentUpdate.content = updateAboutUsDto.content;
          }
          if (updateAboutUsDto.appendixContent !== undefined) {
              contentUpdate.appendixContent = updateAboutUsDto.appendixContent;
          }

          const updatedContent = await this.aboutUs.findOneAndUpdate(
              {},
              { $set: contentUpdate },
              { new: true, upsert: true, setDefaultsOnInsert: true }
          );
          res.status(200).json(updatedContent);
      } catch (error) {
          next(error);
      }
  };
}

export default AboutUsController;