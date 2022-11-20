"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const mongoose = require("mongoose");
const cors_1 = __importDefault(require("cors"));
class App {
    constructor(controllers) {
        this.app = express_1.default();
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }
    listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        this.app.use(body_parser_1.default.json());
        this.app.use(cookie_parser_1.default());
        this.app.use(cors_1.default());
    }
    initializeErrorHandling() {
        // this.app.use(errorMiddleware);
    }
    initializeControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }
    connectToTheDatabase() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map