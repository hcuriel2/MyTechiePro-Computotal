import { Request, Response, NextFunction, Router } from "express";
import AboutUsModel from "../../models/aboutus/aboutus.model";
import Controller from "../../interfaces/controller.interface";
import { validate } from "class-validator";
import UpdateAboutUsDto from "./aboutus.dto";
import adminMiddleware from "../../middleware/admin.middleware";

// Used when the database has no About Us document yet, so the home page is never blank on a fresh install.
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
        // Reading is public. Saving goes through adminMiddleware, which checks the Admin cookie.
        this.router.get(this.path, this.getAboutUsContent);
        this.router.put(this.path, adminMiddleware, this.updateAboutUsContent);
    }

    private getAboutUsContent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const aboutUsContent = await this.aboutUs.findOne();
            // no-store so a browser does not keep showing the paragraph from before the last save.
            res.setHeader("Cache-Control", "no-store");
            // Send only { content }. The old response was the whole Mongo document.
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
          // Same { content } shape as the GET, so the admin page can drop the response straight into the textarea.
          res.status(200).json({
              content: updatedContent ? updatedContent.content : updateAboutUsDto.content,
          });
      } catch (error) {
          next(error);
      }
  };
}

export default AboutUsController;