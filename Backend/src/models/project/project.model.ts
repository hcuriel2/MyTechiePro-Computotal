import mongoose, { Schema } from 'mongoose';
import Project from "./project.interface";

// Create subdocument schema : comment
const commentSchema = new Schema(
    {
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
    },
    { timestamps: true },
);

const state = Object.freeze({
    Request: "Requested",
    Started: "Started",
    OnGoing: "OnGoing",
    Completed: "Completed",
    Paid: "Paid",
});

// Create regular project Schema
const ProjectSchema = new Schema(
    {
        serviceName: {
            type: String,
            required: true,
        },
        serviceId: {
            type: String,
            required: true,
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        professional: {
            type: mongoose.Schema.Types.ObjectId,
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
    },
    { timestamps: true },
);

const projectModel = mongoose.model<Project & mongoose.Document>("Project", ProjectSchema);

export default projectModel;
