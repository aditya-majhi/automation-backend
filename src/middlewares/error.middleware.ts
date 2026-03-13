import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response.js";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void => {
    console.error(`[Error] ${err.message}`, err.stack);

    if (err instanceof ZodError) {
        sendError(res, "Validation failed", 422, err.errors);
        return;
    }

    sendError(res, err.message || "Internal Server Error", 500);
};