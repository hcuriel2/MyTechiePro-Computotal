"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
function validateEnv() {
    envalid_1.cleanEnv(process.env, {
        JWT_SECRET: envalid_1.str(),
        MONGO_PASSWORD: envalid_1.str(),
        MONGO_PATH: envalid_1.str(),
        MONGO_USER: envalid_1.str(),
        PORT: envalid_1.port(),
    });
}
exports.default = validateEnv;
//# sourceMappingURL=validateEnv.js.map