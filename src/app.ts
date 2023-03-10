import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";

import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.connectToDatabase();
        this.initializeMiddleware();
        this.initializeControllers(controllers);
        this.initializeErrorHandling()
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`)
        })
    }

    public getServer() {
        return this.app
    }

    public initializeMiddleware() {
        this.app.use(express.json());
        this.app.use(cookieParser())
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware)
    }


    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router)
        })
    }

    private connectToDatabase() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`)
    }
}

export default App;