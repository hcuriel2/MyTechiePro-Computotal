import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose = require("mongoose");
import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";
import cors from "cors";
import 'reflect-metadata';

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        //this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        const allowedOrigins = ['http://mytechie.pro', 'http://mytechie.pro/api/*', 'http://localhost:80'];
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());


        this.app.use(cors({
            origin: function (origin, callback) {
                console.log('Origin of request:', origin); // This will output the origin to the console
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) === -1) {
                    var msg = 'the CORS policy for this site does not allow access from this origin';
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            }, credentials: true
        }))
        /*
        this.app.use(cors({
            origin: 'http://localhost:8080',
            credentials: true
        }));*/
    }

    //private initializeErrorHandling() {
    //   this.app.use(errorMiddleware);
    //}

    // DEV VERSION
    // private initializeControllers(controllers: Controller[]) {
    //     controllers.forEach((controller) => {
    //         this.app.use("/", controller.router);
    //     });
    // }

    // DEPLOYMENT VERSION
    private initializeControllers(controllers: Controller[]) {
        // Define the global prefix for all routes
        const apiPrefix = '/api';

        controllers.forEach((controller) => {
            // Prepend the prefix to the path of each controller
            this.app.use(apiPrefix, controller.router);
        });
    }


    private connectToTheDatabase() {


        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        mongoose.connect(
            `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`,
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            },
        );


    }
}

export default App;
