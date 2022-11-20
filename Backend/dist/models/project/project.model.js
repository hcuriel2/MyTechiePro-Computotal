"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Create subdocument schema : comment
const commentSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: true,
    },
    authorId: {
        type: String,
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const state = Object.freeze({
    Request: "Requested",
    Started: "Started",
    OnGoing: "OnGoing",
    Completed: "Completed",
    Paid: "Paid",
});
// Create regular project Schema
const ProjectSchema = new mongoose_1.Schema({
    serviceName: {
        type: String,
        required: true,
    },
    serviceId: {
        type: String,
        required: true,
    },
    client: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    professional: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    comments: { type: [commentSchema], default: [] },
    state: { type: String, enum: Object.values(state), default: "Requested" },
    totalCost: {
        type: Number,
    },
    projectDetails: {
        type: String,
    },
    projectStartDate: {
        type: Date,
    },
    projectEndDate: {
        type: Date,
    },
    eTransferEmail: {
        type: String,
    },
    rating: { type: Number, min: 0, max: 5 },
    feedback: String,
}, { timestamps: true });
const projectModel = mongoose_1.default.model("Project", ProjectSchema);
exports.default = projectModel;
//# sourceMappingURL=project.model.js.map