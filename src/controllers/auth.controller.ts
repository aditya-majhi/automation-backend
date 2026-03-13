import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { registerUser, loginUser } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = registerSchema.parse(req.body);
        const result = await registerUser(input);
        sendSuccess(res, result, "User registered successfully", 201);
    } catch (err) {
        if (err instanceof Error && err.message.includes("already exists")) {
            sendError(res, err.message, 409);
            return;
        }
        next(err);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = loginSchema.parse(req.body);
        const result = await loginUser(input);
        sendSuccess(res, result, "Login successful");
    } catch (err) {
        if (err instanceof Error && err.message.includes("Invalid email or password")) {
            sendError(res, err.message, 401);
            return;
        }
        next(err);
    }
};