import * as mongoose from "mongoose";
import User from "./user.interface";

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

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};


var validatePassword = function(password) {
    // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
    var re = /(\.\w{2,3})+$/;
    return re.test(password)
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
        // select: false
        // validate: [validatePassword, 'Please fill a valid valid password'],
        // match: [/(\.\w{2,3})+$/, 'Please fill a valid password']
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
    unitType:  {
        type: String,
        enum: Object.values(uniTypes)
    },
    bio: String,
    inquiry: String,
    performance:  { type: [performaceSchema], default: [] },
    website: String,
    secret: String,
    tempSecret: String,
    approved: Boolean,
    verified: Boolean
});

Object.assign(userSchema.statics, { userTypes })

const userModel = mongoose.model<User & mongoose.Document>("User", userSchema);

export default userModel;
