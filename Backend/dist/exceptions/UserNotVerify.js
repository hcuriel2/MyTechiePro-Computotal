"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = __importDefault(require("./HttpException"));
class UserNotVerify extends HttpException_1.default {
    constructor() {
        super(400, `User is not verified! Please check email address to verify user!`);
    }
}
exports.default = UserNotVerify;
//# sourceMappingURL=UserNotVerify.js.map