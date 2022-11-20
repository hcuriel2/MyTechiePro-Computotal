import mongoose from "mongoose";

const surveyContentsSchema = new mongoose.Schema({
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
})

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    survey: {
        type: [surveyContentsSchema]
    }
})

const surveySchema = new mongoose.Schema({
    category: {
        type: [categorySchema]
    }
});

const Survey = mongoose.model("Survey", surveySchema);
export default Survey
