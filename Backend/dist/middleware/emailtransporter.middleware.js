"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
let emailtransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'noreplytechie@gmail.com',
        pass: 'TEST456!',
    },
});
exports.default = emailtransporter;
//# sourceMappingURL=emailtransporter.middleware.js.map