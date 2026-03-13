import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createTestCaseSchema } from "../schemas/testcase.schema";
import { createTestCase, getTestCasesByModule } from "../services/testcase.service";
import { sendSuccess, sendError } from "../utils/response";

export const create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = createTestCaseSchema.parse(req.body);
        const testCase = await createTestCase(input, req.user!.userId);
        sendSuccess(res, testCase, "Test case created successfully", 201);
    } catch (err) {
        if (err instanceof Error && err.message === "Module not found") {
            sendError(res, err.message, 404);
            return;
        }
        next(err);
    }
};

export const getByModule = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const testCases = await getTestCasesByModule(
            req.params.moduleId,
            req.user!.userId
        );
        sendSuccess(res, testCases, "Test cases fetched successfully");
    } catch (err) {
        if (err instanceof Error && err.message === "Module not found") {
            sendError(res, err.message, 404);
            return;
        }
        next(err);
    }
};