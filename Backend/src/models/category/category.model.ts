import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    keywords: {
        type: [String],
        default: []
    }
});

const categorySchema = new mongoose.Schema({
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

const Category = mongoose.model("Category", categorySchema);
export default Category;
