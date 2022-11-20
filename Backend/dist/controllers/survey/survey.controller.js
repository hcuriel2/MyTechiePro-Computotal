"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const survey_model_1 = __importDefault(require("../../models/survey/survey.model"));
class SurveyController {
    constructor() {
        this.path = "/survey";
        this.router = express_1.Router();
        this.survey = survey_model_1.default;
        this.getAllSurveys = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const surveys = yield this.survey.find();
            response.send(surveys);
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, this.getAllSurveys);
    }
}
exports.default = SurveyController;
//# sourceMappingURL=survey.controller.js.map