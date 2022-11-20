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
const mongoose = __importStar(require("mongoose"));
const addressSchema = new mongoose.Schema({
    city: String,
    country: String,
    street: String,
    postalCode: String,
    lat: Number,
    lng: Number,
    placeid: String
});
const performaceSchema = new mongoose.Schema({
    rating: Number,
    feedback: String,
    clientName: String,
    service: String,
});
const userTypes = Object.freeze({
    Admin: 'Admin',
    Client: 'Client',
    Professional: 'Professional'
});
//User signup rate types here, value tag in html must match the variable string
const uniTypes = Object.freeze({
    Hour: 'Hour',
    Solution: 'Solution',
    FlatFee: 'Flat fee',
});
const proStatus = Object.freeze({
    Busy: 'Busy',
    Active: 'Active',
});
var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
var validatePassword = function (password) {
    // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
    var re = /(\.\w{2,3})+$/;
    return re.test(password);
};
const userSchema = new mongoose.Schema({
    address: addressSchema,
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    alias: {
        type: String,
    },
    company: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: 'Password is required',
    },
    userType: {
        type: String,
        enum: Object.values(userTypes),
        required: true,
    },
    proStatus: {
        type: String,
        enum: Object.values(proStatus),
        default: "Active"
    },
    skills: [{
            type: String,
        }],
    unitPrice: Number,
    ratingSum: Number,
    ratingCount: Number,
    rating: Number,
    unitType: {
        type: String,
        enum: Object.values(uniTypes)
    },
    bio: String,
    inquiry: String,
    performance: { type: [performaceSchema], default: [] },
    website: String,
    secret: String,
    tempSecret: String,
    approved: Boolean,
    verified: Boolean
});
Object.assign(userSchema.statics, { userTypes });
const userModel = mongoose.model("User", userSchema);
exports.default = userModel;
//# sourceMappingURL=user.model.js.map