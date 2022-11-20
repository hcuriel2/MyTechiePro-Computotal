"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ServiceSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    keywords: {
        type: [String],
        default: []
    }
});
const categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    services: {
        type: [ServiceSchema],
        default: [],
    },
    icon: {
        type: String,
        required: true,
    }
});
const Category = mongoose_1.default.model("Category", categorySchema);
exports.default = Category;
//# sourceMappingURL=category.model.js.map