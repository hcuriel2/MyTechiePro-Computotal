"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const authentication_controller_1 = __importDefault(require("./controllers/authentication/authentication.controller"));
const project_controller_1 = __importDefault(require("./controllers/project/project.controller"));
const user_controller_1 = __importDefault(require("./controllers/user/user.controller"));
const category_controller_1 = __importDefault(require("./controllers/category/category.controller"));
const contactus_controller_1 = __importDefault(require("./controllers/contactus/contactus.controller"));
const survey_controller_1 = __importDefault(require("./controllers/survey/survey.controller"));
const validateEnv_1 = __importDefault(require("./utils/validateEnv"));
const healthcheck_controller_1 = __importDefault(require("./controllers/healthcheck/healthcheck.controller"));
validateEnv_1.default();
const app = new app_1.default([
    new contactus_controller_1.default(),
    new project_controller_1.default(),
    new authentication_controller_1.default(),
    new user_controller_1.default(),
    new category_controller_1.default(),
    new survey_controller_1.default(),
    new healthcheck_controller_1.default(),
]);
app.listen();
//# sourceMappingURL=server.js.map