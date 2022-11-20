"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const surveyContentsSchema = new mongoose_1.default.Schema({
    question: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    contents: {
        type: [String],
        default: [],
        required: true
    }
});
const categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    survey: {
        type: [surveyContentsSchema]
    }
});
const surveySchema = new mongoose_1.default.Schema({
    category: {
        type: [categorySchema]
    }
});
const Survey = mongoose_1.default.model("Survey", surveySchema);
exports.default = Survey;
//# sourceMappingURL=survey.model.js.map