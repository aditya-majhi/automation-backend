import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createModuleSchema } from "../schemas/module.schema";
import { createModule, getModulesByProject } from "../services/module.services";
import { sendSuccess, sendError } from "../utils/response";

export const create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = createModuleSchema.parse(req.body);
        const module = await createModule(input, req.user!.userId);
        sendSuccess(res, module, "Module created successfully", 201);
    } catch (err) {
        if (err instanceof Error && err.message === "Project not found") {
            sendError(res, err.message, 404);
            return;
        }
        next(err);
    }
};

export const getByProject = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const modules = await getModulesByProject(
            req.params.projectId,
            req.user!.userId
        );
        sendSuccess(res, modules, "Modules fetched successfully");
    } catch (err) {
        if (err instanceof Error && err.message === "Project not found") {
            sendError(res, err.message, 404);
            return;
        }
        next(err);
    }
};