"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = __importDefault(require("./HttpException"));
class WrongAdminException extends HttpException_1.default {
    constructor() {
        super(401, "This account is not Admintrator.");
    }
}
exports.default = WrongAdminException;
//# sourceMappingURL=WrongAdminException.js.map