import { Request, Response } from "express";
import HttpException from "../exceptions/HttpException";

function errorMiddleware(error: HttpException, request: Request, response: Response) {
    const status = error.status || 500;
    const message = error.message || "Something Went Wrong";

    response.status(status).send(message)
};

export default errorMiddleware