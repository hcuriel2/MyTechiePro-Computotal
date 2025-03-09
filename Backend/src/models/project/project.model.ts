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
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
        },
        priceConfirmed: {
            type: Boolean,
            default: false
        },
        clientResponse: {
            type: String,
            enum: [null, 'confirmed', 'rejected'],
            default: null
        }
    },
    { timestamps: true },
);

// Add virtual property to calculate if a project is overdue
ProjectSchema.virtual('isOverdue').get(function() {
    // Only check for overdue on Completed projects
    if (this.state !== 'Completed') {
        return false;
    }
    
    const now = new Date();
    const updatedAt = new Date(this.updatedAt);
    const diffTime = Math.abs(now.getTime() - updatedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Two cases for overdue:
    if (this.priceConfirmed) {
        // Case 1: Price is confirmed but project not paid for 15+ days
        return diffDays >= 15 && this.clientResponse === 'Confirmed';
    } else {
        // Case 2: Price is not confirmed for 15+ days
        return diffDays >= 15;
    }
});

// Configure toJSON to include virtual properties
ProjectSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

// Configure toObject to include virtual properties
ProjectSchema.set('toObject', {
    virtuals: true
});

const projectModel = mongoose.model<Project & mongoose.Document>("Project", ProjectSchema);

export default projectModel;
