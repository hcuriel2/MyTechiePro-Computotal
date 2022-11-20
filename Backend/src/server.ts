import "dotenv/config";
import App from "./app";
import AuthenticationController from "./controllers/authentication/authentication.controller";
import ProjectController from "./controllers/project/project.controller";
import UserController from "./controllers/user/user.controller";
import CategoryController from "./controllers/category/category.controller";
import ContactController from "./controllers/contactus/contactus.controller";
import SurveyController from "./controllers/survey/survey.controller";
import validateEnv from "./utils/validateEnv";

validateEnv();

const app = new App([
    new ContactController(),
    new ProjectController(),
    new AuthenticationController(),
    new UserController(),
    new CategoryController(),
    new SurveyController(),
]);

app.listen();
